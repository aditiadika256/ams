<?php

namespace App\Domain\Finance;

use App\Actions\Access\ConfirmPaidOrder;
use App\Enums\WalletTransactionType;
use App\Enums\WalletType;
use App\Exceptions\DomainConflictException;
use App\Models\Order;
use App\Models\User;
use App\Models\Wallet;
use App\Models\WalletTransaction;
use App\Models\Withdrawal;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class WalletService
{
    public function __construct(
        private readonly ConfirmPaidOrder $confirmPaidOrder,
    ) {}

    /**
     * Get or initialize a user's wallet of the given type.
     */
    public function getOrCreateWallet(User $user, WalletType|string $type): Wallet
    {
        $typeValue = $type instanceof WalletType ? $type->value : $type;

        return Wallet::firstOrCreate(
            ['user_id' => $user->id, 'type' => $typeValue],
            ['balance' => 0.00, 'pending_balance' => 0.00]
        );
    }

    /**
     * Credit funds to a wallet and write an immutable ledger record.
     */
    public function credit(
        Wallet $wallet,
        float|string $amount,
        ?string $refType = null,
        ?string $refId = null,
        string $description = 'Kredit saldo'
    ): WalletTransaction {
        $amount = (float) $amount;
        if ($amount <= 0) {
            throw ValidationException::withMessages(['amount' => 'Nominal kredit harus lebih besar dari nol.']);
        }

        return DB::transaction(function () use ($wallet, $amount, $refType, $refId, $description): WalletTransaction {
            $locked = Wallet::query()->lockForUpdate()->findOrFail($wallet->id);
            $newBalance = round((float) $locked->balance + $amount, 2);

            $locked->update(['balance' => $newBalance]);

            return WalletTransaction::create([
                'wallet_id' => $locked->id,
                'type' => WalletTransactionType::Credit,
                'amount' => $amount,
                'balance_after' => $newBalance,
                'reference_type' => $refType,
                'reference_id' => $refId,
                'description' => $description,
            ]);
        });
    }

    /**
     * Debit funds from a wallet, validating sufficient balance.
     */
    public function debit(
        Wallet $wallet,
        float|string $amount,
        ?string $refType = null,
        ?string $refId = null,
        string $description = 'Debit saldo'
    ): WalletTransaction {
        $amount = (float) $amount;
        if ($amount <= 0) {
            throw ValidationException::withMessages(['amount' => 'Nominal debit harus lebih besar dari nol.']);
        }

        return DB::transaction(function () use ($wallet, $amount, $refType, $refId, $description): WalletTransaction {
            $locked = Wallet::query()->lockForUpdate()->findOrFail($wallet->id);
            $currentBalance = (float) $locked->balance;

            if ($currentBalance < $amount) {
                throw new DomainConflictException(
                    'INSUFFICIENT_WALLET_BALANCE',
                    'Saldo dompet tidak mencukupi untuk transaksi ini.',
                    ['current_balance' => $currentBalance, 'requested_amount' => $amount]
                );
            }

            $newBalance = round($currentBalance - $amount, 2);
            $locked->update(['balance' => $newBalance]);

            return WalletTransaction::create([
                'wallet_id' => $locked->id,
                'type' => WalletTransactionType::Debit,
                'amount' => $amount,
                'balance_after' => $newBalance,
                'reference_type' => $refType,
                'reference_id' => $refId,
                'description' => $description,
            ]);
        });
    }

    /**
     * Set or reset 6-digit transaction PIN.
     */
    public function setPin(User $user, string $pin): void
    {
        if (! preg_match('/^[0-9]{6}$/', $pin)) {
            throw ValidationException::withMessages(['pin' => 'PIN transaksi harus berupa 6 digit angka.']);
        }

        $user->update([
            'pin_hash' => Hash::make($pin),
            'pin_failed_attempts' => 0,
            'pin_locked_until' => null,
        ]);
    }

    /**
     * Verify 6-digit transaction PIN with lockout protection (3 attempts -> 30 min lockout).
     */
    public function verifyPin(User $user, string $pin): bool
    {
        if ($user->isPinLocked()) {
            $minutesLeft = now()->diffInMinutes($user->pin_locked_until) + 1;
            throw new DomainConflictException(
                'PIN_LOCKED',
                "PIN transaksi terkunci sementara karena salah 3x. Coba lagi dalam {$minutesLeft} menit."
            );
        }

        if (! $user->hasPin()) {
            throw new DomainConflictException('PIN_NOT_SET', 'PIN transaksi belum diatur.');
        }

        if (! Hash::check($pin, $user->pin_hash)) {
            $attempts = $user->pin_failed_attempts + 1;
            $lockedUntil = $attempts >= 3 ? now()->addMinutes(30) : null;

            $user->update([
                'pin_failed_attempts' => $attempts,
                'pin_locked_until' => $lockedUntil,
            ]);

            if ($lockedUntil) {
                throw new DomainConflictException(
                    'PIN_LOCKED',
                    'PIN salah 3 kali berturut-turut. Akun terkunci dari transaksi selama 30 menit.'
                );
            }

            $remaining = 3 - $attempts;
            throw new DomainConflictException(
                'INVALID_PIN',
                "PIN transaksi salah. Sisa percobaan: {$remaining} kali."
            );
        }

        // Reset failed attempts on success
        if ($user->pin_failed_attempts > 0 || $user->pin_locked_until !== null) {
            $user->update([
                'pin_failed_attempts' => 0,
                'pin_locked_until' => null,
            ]);
        }

        return true;
    }

    /**
     * Pay an Order using Student Wallet balance.
     */
    public function payOrderWithWallet(User $user, Order $order, string $pin): Order
    {
        $this->verifyPin($user, $pin);

        $wallet = $this->getOrCreateWallet($user, WalletType::Student);
        $total = (float) $order->total;

        return DB::transaction(function () use ($wallet, $order, $total): Order {
            $this->debit(
                $wallet,
                $total,
                Order::class,
                (string) $order->id,
                "Pembayaran Order #{$order->id}"
            );

            return $this->confirmPaidOrder->handle($order, (string) $total);
        });
    }

    /**
     * Auto-rollback / refund order funds to the user's Student Wallet.
     */
    public function refundOrderToWallet(Order $order, string $reason = 'Pembatalan transaksi'): WalletTransaction
    {
        $user = $order->user;
        $wallet = $this->getOrCreateWallet($user, WalletType::Student);
        $amount = (float) $order->total;

        return $this->credit(
            $wallet,
            $amount,
            Order::class,
            (string) $order->id,
            "Refund Order #{$order->id}: {$reason}"
        );
    }

    /**
     * Request withdrawal for Mentor Wallet.
     */
    public function requestWithdrawal(
        User $user,
        float|string $amount,
        array $bankDetails,
        string $pin
    ): Withdrawal {
        $this->verifyPin($user, $pin);

        $amount = (float) $amount;
        if ($amount < 10000) {
            throw ValidationException::withMessages(['amount' => 'Minimal penarikan saldo adalah Rp 10.000.']);
        }

        $wallet = $this->getOrCreateWallet($user, WalletType::Mentor);

        return DB::transaction(function () use ($user, $wallet, $amount, $bankDetails): Withdrawal {
            $locked = Wallet::query()->lockForUpdate()->findOrFail($wallet->id);
            if ((float) $locked->balance < $amount) {
                throw new DomainConflictException(
                    'INSUFFICIENT_BALANCE',
                    'Saldo honor mentor tidak mencukupi untuk penarikan ini.'
                );
            }

            // Move from balance to pending_balance
            $newBalance = round((float) $locked->balance - $amount, 2);
            $newPending = round((float) $locked->pending_balance + $amount, 2);
            $locked->update([
                'balance' => $newBalance,
                'pending_balance' => $newPending,
            ]);

            WalletTransaction::create([
                'wallet_id' => $locked->id,
                'type' => WalletTransactionType::Debit,
                'amount' => $amount,
                'balance_after' => $newBalance,
                'reference_type' => Withdrawal::class,
                'description' => "Pengajuan penarikan dana ke {$bankDetails['bank_name']}",
            ]);

            return Withdrawal::create([
                'user_id' => $user->id,
                'wallet_id' => $locked->id,
                'amount' => $amount,
                'bank_name' => $bankDetails['bank_name'],
                'bank_account_number' => $bankDetails['bank_account_number'],
                'bank_account_name' => $bankDetails['bank_account_name'],
                'status' => 'pending',
                'notes' => $bankDetails['notes'] ?? null,
            ]);
        });
    }

    /**
     * Admin ASD: Approve withdrawal with bank transfer reference.
     */
    public function approveWithdrawal(
        Withdrawal $withdrawal,
        User $admin,
        string $reference,
        ?string $proofUrl = null
    ): Withdrawal {
        return DB::transaction(function () use ($withdrawal, $admin, $reference, $proofUrl): Withdrawal {
            $lockedWithdrawal = Withdrawal::query()->lockForUpdate()->findOrFail($withdrawal->id);
            if ($lockedWithdrawal->status !== 'pending') {
                throw new DomainConflictException('WITHDRAWAL_NOT_PENDING', 'Pengajuan penarikan sudah diproses sebelumnya.');
            }

            $wallet = Wallet::query()->lockForUpdate()->findOrFail($lockedWithdrawal->wallet_id);
            $pending = max(0, round((float) $wallet->pending_balance - (float) $lockedWithdrawal->amount, 2));
            $wallet->update(['pending_balance' => $pending]);

            $lockedWithdrawal->update([
                'status' => 'approved',
                'transfer_reference' => $reference,
                'proof_url' => $proofUrl,
                'approved_by' => $admin->id,
                'approved_at' => now(),
            ]);

            return $lockedWithdrawal;
        });
    }

    /**
     * Admin ASD: Reject withdrawal and refund pending balance back to mentor wallet.
     */
    public function rejectWithdrawal(Withdrawal $withdrawal, User $admin, string $reason): Withdrawal
    {
        return DB::transaction(function () use ($withdrawal, $admin, $reason): Withdrawal {
            $lockedWithdrawal = Withdrawal::query()->lockForUpdate()->findOrFail($withdrawal->id);
            if ($lockedWithdrawal->status !== 'pending') {
                throw new DomainConflictException('WITHDRAWAL_NOT_PENDING', 'Pengajuan penarikan sudah diproses sebelumnya.');
            }

            $wallet = Wallet::query()->lockForUpdate()->findOrFail($lockedWithdrawal->wallet_id);
            $amount = (float) $lockedWithdrawal->amount;

            $newBalance = round((float) $wallet->balance + $amount, 2);
            $newPending = max(0, round((float) $wallet->pending_balance - $amount, 2));

            $wallet->update([
                'balance' => $newBalance,
                'pending_balance' => $newPending,
            ]);

            WalletTransaction::create([
                'wallet_id' => $wallet->id,
                'type' => WalletTransactionType::Credit,
                'amount' => $amount,
                'balance_after' => $newBalance,
                'reference_type' => Withdrawal::class,
                'reference_id' => (string) $lockedWithdrawal->id,
                'description' => "Pengembalian penarikan ditolak: {$reason}",
            ]);

            $lockedWithdrawal->update([
                'status' => 'rejected',
                'notes' => $reason,
                'approved_by' => $admin->id,
                'approved_at' => now(),
            ]);

            return $lockedWithdrawal;
        });
    }
}
