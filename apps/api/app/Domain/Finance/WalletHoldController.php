<?php

namespace App\Domain\Finance;

use App\Http\Controllers\Controller;
use App\Models\Wallet;
use App\Models\WalletHold;
use App\Models\WalletTransaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use OpenApi\Attributes as OA;

#[OA\Tag(
    name: 'Finance - Wallet Holds',
    description: 'Endpoints for managing hold balances, dispute escrow, and refund protections'
)]
class WalletHoldController extends Controller
{
    #[OA\Get(
        path: '/api/v1/admin/finance/holds',
        summary: 'List active and resolved wallet holds',
        tags: ['Finance - Wallet Holds'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'status', in: 'query', required: false, schema: new OA\Schema(type: 'string', enum: ['all', 'held', 'released', 'forfeited'])),
            new OA\Parameter(name: 'search', in: 'query', required: false, schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'page', in: 'query', required: false, schema: new OA\Schema(type: 'integer', default: 1)),
            new OA\Parameter(name: 'per_page', in: 'query', required: false, schema: new OA\Schema(type: 'integer', default: 15)),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Holds retrieved successfully'),
        ]
    )]
    public function index(Request $request): JsonResponse
    {
        $query = WalletHold::with(['user:id,name,email', 'wallet:id,balance,pending_balance'])
            ->where('row_status', 1);

        if ($request->filled('status') && $request->query('status') !== 'all') {
            $query->where('status', $request->query('status'));
        }

        if ($request->filled('search')) {
            $search = $request->query('search');
            $query->where(function ($q) use ($search) {
                $q->where('reason', 'ilike', "%{$search}%")
                  ->orWhereHas('user', function ($uq) use ($search) {
                      $uq->where('name', 'ilike', "%{$search}%")
                         ->orWhere('email', 'ilike', "%{$search}%");
                  });
            });
        }

        $holds = $query->latest()->paginate($request->query('per_page', 15));

        return response()->json([
            'success' => true,
            'message' => 'Wallet holds retrieved successfully',
            'data' => $holds->items(),
            'meta' => [
                'current_page' => $holds->currentPage(),
                'last_page' => $holds->lastPage(),
                'per_page' => $holds->perPage(),
                'total' => $holds->total(),
            ],
        ]);
    }

    #[OA\Post(
        path: '/api/v1/admin/finance/holds',
        summary: 'Hold funds in user wallet',
        tags: ['Finance - Wallet Holds'],
        security: [['bearerAuth' => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['user_id', 'amount', 'reason'],
                properties: [
                    new OA\Property(property: 'user_id', type: 'integer'),
                    new OA\Property(property: 'amount', type: 'number', example: 250000),
                    new OA\Property(property: 'reason', type: 'string', example: 'Penahanan saldo garansi refund program'),
                    new OA\Property(property: 'release_condition', type: 'string', example: 'Siswa menyelesaikan 80% modul atau 14 hari tanpa dispute'),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 201, description: 'Funds held successfully'),
            new OA\Response(response: 422, description: 'Insufficient balance or validation error'),
        ]
    )]
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'amount' => 'required|numeric|min:1000',
            'reason' => 'required|string|max:255',
            'release_condition' => 'nullable|string|max:255',
        ]);

        $wallet = Wallet::where('user_id', $validated['user_id'])->first();
        if (! $wallet) {
            return response()->json(['success' => false, 'message' => 'User does not have an active wallet'], 422);
        }

        if ($wallet->balance < $validated['amount']) {
            return response()->json([
                'success' => false,
                'message' => 'Saldo dompet tidak mencukupi untuk ditahan (Hold Balance)',
            ], 422);
        }

        $hold = DB::transaction(function () use ($wallet, $validated, $request) {
            $wallet->balance -= $validated['amount'];
            $wallet->pending_balance += $validated['amount'];
            $wallet->save();

            return WalletHold::create([
                'user_id' => $validated['user_id'],
                'wallet_id' => $wallet->id,
                'amount' => $validated['amount'],
                'reason' => $validated['reason'],
                'release_condition' => $validated['release_condition'] ?? null,
                'status' => 'held',
                'row_status' => 1,
            ]);
        });

        return response()->json([
            'success' => true,
            'message' => 'Funds held successfully',
            'data' => $hold->load('user:id,name,email'),
        ], 201);
    }

    #[OA\Post(
        path: '/api/v1/admin/finance/holds/{id}/release',
        summary: 'Release held funds back to wallet balance',
        tags: ['Finance - Wallet Holds'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Funds released successfully'),
        ]
    )]
    public function release(Request $request, $id): JsonResponse
    {
        $hold = WalletHold::with('wallet')->where('status', 'held')->find($id);
        if (! $hold) {
            return response()->json(['success' => false, 'message' => 'Held record not found or already resolved'], 404);
        }

        DB::transaction(function () use ($hold) {
            $wallet = $hold->wallet;
            $wallet->pending_balance -= $hold->amount;
            $wallet->balance += $hold->amount;
            $wallet->save();

            $hold->status = 'released';
            $hold->released_at = now();
            $hold->save();
        });

        return response()->json([
            'success' => true,
            'message' => 'Held funds released back to user wallet successfully',
            'data' => $hold,
        ]);
    }

    #[OA\Post(
        path: '/api/v1/admin/finance/holds/{id}/forfeit',
        summary: 'Forfeit held funds permanently (deducted due to dispute/claim)',
        tags: ['Finance - Wallet Holds'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Funds forfeited successfully'),
        ]
    )]
    public function forfeit(Request $request, $id): JsonResponse
    {
        $hold = WalletHold::with('wallet')->where('status', 'held')->find($id);
        if (! $hold) {
            return response()->json(['success' => false, 'message' => 'Held record not found or already resolved'], 404);
        }

        DB::transaction(function () use ($hold) {
            $wallet = $hold->wallet;
            $wallet->pending_balance -= $hold->amount;
            $wallet->save();

            $hold->status = 'forfeited';
            $hold->released_at = now();
            $hold->save();
        });

        return response()->json([
            'success' => true,
            'message' => 'Held funds forfeited permanently',
            'data' => $hold,
        ]);
    }
}
