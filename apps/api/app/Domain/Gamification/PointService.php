<?php

namespace App\Domain\Gamification;

use App\Models\ExamAttempt;
use App\Models\Order;
use App\Models\PointTransaction;
use App\Models\PointWallet;
use App\Models\SessionAttendance;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class PointService
{
    /**
     * Get or create the user's point wallet.
     */
    public function getOrCreateWallet(User $user): PointWallet
    {
        return PointWallet::firstOrCreate(
            ['user_id' => $user->id],
            ['balance' => 0, 'total_earned' => 0, 'total_spent' => 0]
        );
    }

    /**
     * Earn points — credits the point wallet with lockForUpdate.
     */
    public function earn(
        PointWallet $wallet,
        int $amount,
        string $sourceType,
        ?string $sourceId = null,
        string $description = 'Poin diterima'
    ): PointTransaction {
        if ($amount <= 0) {
            throw ValidationException::withMessages(['amount' => 'Jumlah poin harus lebih besar dari nol.']);
        }

        return DB::transaction(function () use ($wallet, $amount, $sourceType, $sourceId, $description) {
            $locked = PointWallet::query()->lockForUpdate()->findOrFail($wallet->id);

            $newBalance = $locked->balance + $amount;
            $locked->update([
                'balance' => $newBalance,
                'total_earned' => $locked->total_earned + $amount,
            ]);

            return PointTransaction::create([
                'point_wallet_id' => $locked->id,
                'type' => 'earn',
                'amount' => $amount,
                'balance_after' => $newBalance,
                'source_type' => $sourceType,
                'source_id' => $sourceId,
                'description' => $description,
            ]);
        });
    }

    /**
     * Spend points — debits the point wallet with lockForUpdate and balance validation.
     */
    public function spend(
        PointWallet $wallet,
        int $amount,
        string $sourceType,
        ?string $sourceId = null,
        string $description = 'Poin digunakan'
    ): PointTransaction {
        if ($amount <= 0) {
            throw ValidationException::withMessages(['amount' => 'Jumlah poin harus lebih besar dari nol.']);
        }

        return DB::transaction(function () use ($wallet, $amount, $sourceType, $sourceId, $description) {
            $locked = PointWallet::query()->lockForUpdate()->findOrFail($wallet->id);

            if ($locked->balance < $amount) {
                throw ValidationException::withMessages([
                    'points' => "Saldo poin tidak mencukupi. Tersedia: {$locked->balance}, dibutuhkan: {$amount}.",
                ]);
            }

            $newBalance = $locked->balance - $amount;
            $locked->update([
                'balance' => $newBalance,
                'total_spent' => $locked->total_spent + $amount,
            ]);

            return PointTransaction::create([
                'point_wallet_id' => $locked->id,
                'type' => 'spend',
                'amount' => $amount,
                'balance_after' => $newBalance,
                'source_type' => $sourceType,
                'source_id' => $sourceId,
                'description' => $description,
            ]);
        });
    }

    /**
     * Refund points back to the wallet (e.g., cancelled store order).
     */
    public function refund(
        PointWallet $wallet,
        int $amount,
        string $sourceType,
        ?string $sourceId = null,
        string $description = 'Refund poin'
    ): PointTransaction {
        return $this->earn($wallet, $amount, $sourceType, $sourceId, $description);
    }

    // ──────────────────────────────────────────────────────────────
    // Award hooks — called from existing controllers
    // ──────────────────────────────────────────────────────────────

    /**
     * Award points when a student passes CBT exam.
     * Rule: passing grade met → 50 points per exam.
     */
    public function awardCbtAchievement(User $user, ExamAttempt $attempt): void
    {
        $score = (float) ($attempt->score_total ?? 0);
        $isPassed = ($attempt->is_passed ?? false) || $score >= 60;
        if (! $isPassed) {
            return;
        }

        // Prevent duplicate award for same attempt
        $alreadyAwarded = PointTransaction::whereHas('pointWallet', fn ($q) => $q->where('user_id', $user->id))
            ->where('source_type', 'cbt_achievement')
            ->where('source_id', (string) $attempt->id)
            ->exists();

        if ($alreadyAwarded) {
            return;
        }

        $wallet = $this->getOrCreateWallet($user);
        $points = 50; // Standard CBT pass reward
        $packageName = $attempt->session?->package?->name ?? 'Ujian';

        $this->earn(
            $wallet,
            $points,
            'cbt_achievement',
            (string) $attempt->id,
            "Bonus kelulusan TryOut: {$packageName} (Skor: {$score})"
        );
    }

    /**
     * Award points for perfect attendance on a session.
     * Called after mentor locks attendance — awards to each present student.
     */
    public function awardAttendancePerfect(User $user, int $sessionId): void
    {
        // Prevent duplicate
        $alreadyAwarded = PointTransaction::whereHas('pointWallet', fn ($q) => $q->where('user_id', $user->id))
            ->where('source_type', 'attendance_perfect')
            ->where('source_id', (string) $sessionId)
            ->exists();

        if ($alreadyAwarded) {
            return;
        }

        $wallet = $this->getOrCreateWallet($user);
        $points = 10; // Standard attendance reward

        $this->earn(
            $wallet,
            $points,
            'attendance_perfect',
            (string) $sessionId,
            "Bonus kehadiran sesi kelas #{$sessionId}"
        );
    }

    /**
     * Award cashback points on program purchase.
     * Default: 5% of order total converted to points (1 poin = Rp100).
     */
    public function awardCashbackPurchase(User $user, Order $order): void
    {
        // Prevent duplicate
        $alreadyAwarded = PointTransaction::whereHas('pointWallet', fn ($q) => $q->where('user_id', $user->id))
            ->where('source_type', 'cashback')
            ->where('source_id', (string) $order->id)
            ->exists();

        if ($alreadyAwarded) {
            return;
        }

        $ratio = 100; // 1 poin = Rp100 (default)
        $cashbackPercent = 5; // 5% cashback
        $cashbackAmount = (float) $order->total * ($cashbackPercent / 100);
        $points = max(1, (int) round($cashbackAmount / $ratio));

        $wallet = $this->getOrCreateWallet($user);
        $this->earn(
            $wallet,
            $points,
            'cashback',
            (string) $order->id,
            "Cashback {$cashbackPercent}% pembelian program (Order #{$order->id})"
        );
    }
}
