<?php

namespace App\Domain\Finance;

use App\Enums\WalletType;
use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\WalletTransaction;
use App\Models\Withdrawal;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

#[OA\Tag(
    name: 'Finance - Wallets',
    description: 'Student & Mentor Dual-Wallet Management'
)]
class WalletController extends Controller
{
    public function __construct(
        private readonly WalletService $walletService,
    ) {}

    /**
     * Get authenticated user's wallet overview.
     */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user();

        $studentWallet = $this->walletService->getOrCreateWallet($user, WalletType::Student);
        $mentorWallet = $this->walletService->getOrCreateWallet($user, WalletType::Mentor);

        $walletIds = [$studentWallet->id, $mentorWallet->id];
        $recentTransactions = WalletTransaction::whereIn('wallet_id', $walletIds)
            ->with('wallet:id,type')
            ->latest('id')
            ->take(15)
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'has_pin' => $user->hasPin(),
                'is_pin_locked' => $user->isPinLocked(),
                'student_wallet' => [
                    'id' => $studentWallet->id,
                    'balance' => $studentWallet->balance,
                    'pending_balance' => $studentWallet->pending_balance,
                ],
                'mentor_wallet' => [
                    'id' => $mentorWallet->id,
                    'balance' => $mentorWallet->balance,
                    'pending_balance' => $mentorWallet->pending_balance,
                ],
                'recent_transactions' => $recentTransactions,
            ],
        ]);
    }

    /**
     * Set or change 6-digit transaction PIN.
     */
    public function setPin(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'pin' => 'required|digits:6',
        ]);

        $this->walletService->setPin($request->user(), $validated['pin']);

        return response()->json([
            'success' => true,
            'message' => 'PIN transaksi berhasil disimpan.',
        ]);
    }

    /**
     * Pay an order using student wallet balance.
     */
    public function payOrder(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'order_id' => 'required|integer|exists:orders,id',
            'pin' => 'required|digits:6',
        ]);

        $user = $request->user();
        $order = Order::where('id', $validated['order_id'])
            ->where('user_id', $user->id)
            ->firstOrFail();

        if ($order->status === 'paid') {
            return response()->json(['message' => 'Order sudah berstatus lunas.'], 422);
        }

        $paidOrder = $this->walletService->payOrderWithWallet($user, $order, $validated['pin']);

        return response()->json([
            'success' => true,
            'message' => 'Pembayaran via dompet berhasil. Akses program telah aktif.',
            'data' => $paidOrder,
        ]);
    }

    /**
     * Request a withdrawal from mentor wallet.
     */
    public function withdraw(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:10000',
            'bank_name' => 'required|string|max:100',
            'bank_account_number' => 'required|string|max:50',
            'bank_account_name' => 'required|string|max:150',
            'pin' => 'required|digits:6',
            'notes' => 'nullable|string|max:255',
        ]);

        $withdrawal = $this->walletService->requestWithdrawal(
            $request->user(),
            $validated['amount'],
            [
                'bank_name' => $validated['bank_name'],
                'bank_account_number' => $validated['bank_account_number'],
                'bank_account_name' => $validated['bank_account_name'],
                'notes' => $validated['notes'] ?? null,
            ],
            $validated['pin']
        );

        return response()->json([
            'success' => true,
            'message' => 'Pengajuan penarikan dana berhasil dikirim dan menunggu verifikasi admin.',
            'data' => $withdrawal,
        ], 201);
    }

    /**
     * Admin ASD: List all withdrawal requests.
     */
    public function adminWithdrawals(Request $request): JsonResponse
    {
        $query = Withdrawal::with(['user:id,name,email', 'wallet:id,type', 'approver:id,name']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $withdrawals = $query->latest('id')->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $withdrawals,
        ]);
    }

    /**
     * Admin ASD: Approve withdrawal.
     */
    public function adminApproveWithdrawal(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'transfer_reference' => 'required|string|max:100',
            'proof_url' => 'nullable|string',
        ]);

        $withdrawal = Withdrawal::findOrFail($id);
        $approved = $this->walletService->approveWithdrawal(
            $withdrawal,
            $request->user(),
            $validated['transfer_reference'],
            $validated['proof_url'] ?? null
        );

        return response()->json([
            'success' => true,
            'message' => 'Penarikan dana berhasil disetujui.',
            'data' => $approved,
        ]);
    }

    /**
     * Admin ASD: Reject withdrawal.
     */
    public function adminRejectWithdrawal(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'reason' => 'required|string|max:255',
        ]);

        $withdrawal = Withdrawal::findOrFail($id);
        $rejected = $this->walletService->rejectWithdrawal(
            $withdrawal,
            $request->user(),
            $validated['reason']
        );

        return response()->json([
            'success' => true,
            'message' => 'Penarikan dana ditolak dan saldo dikembalikan ke dompet mentor.',
            'data' => $rejected,
        ]);
    }
}
