<?php

namespace App\Domain\Gamification;

use App\Http\Controllers\Controller;
use App\Models\PointTransaction;
use App\Models\PointWallet;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PointController extends Controller
{
    public function __construct(
        private readonly PointService $pointService,
    ) {}

    /**
     * GET /api/v1/points/me — Current user's point balance & recent transactions.
     */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user();
        $wallet = $this->pointService->getOrCreateWallet($user);

        $transactions = PointTransaction::where('point_wallet_id', $wallet->id)
            ->latest('id')
            ->paginate(20);

        return response()->json([
            'success' => true,
            'data' => [
                'balance' => $wallet->balance,
                'total_earned' => $wallet->total_earned,
                'total_spent' => $wallet->total_spent,
                'transactions' => $transactions,
            ],
        ]);
    }

    /**
     * GET /api/v1/points/leaderboard — Top 20 students by total_earned this month.
     */
    public function leaderboard(): JsonResponse
    {
        $leaders = PointWallet::with('user:id,name,avatar_url')
            ->where('total_earned', '>', 0)
            ->orderByDesc('total_earned')
            ->limit(20)
            ->get()
            ->map(fn ($pw) => [
                'user_id' => $pw->user_id,
                'name' => $pw->user?->name ?? 'User',
                'avatar_url' => $pw->user?->avatar_url,
                'total_earned' => $pw->total_earned,
                'balance' => $pw->balance,
            ]);

        return response()->json([
            'success' => true,
            'data' => $leaders,
        ]);
    }
}
