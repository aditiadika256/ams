<?php

namespace App\Domain\Store;

use App\Domain\Gamification\PointService;
use App\Http\Controllers\Controller;
use App\Models\StoreOrder;
use App\Models\StoreProduct;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class StoreAdminController extends Controller
{
    public function __construct(
        private readonly PointService $pointService,
    ) {}

    // ── Products CRUD ──────────────────────────────────────

    public function productIndex(Request $request): JsonResponse
    {
        $query = StoreProduct::query()->withTrashed()->orderByDesc('id');

        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        if ($request->filled('search')) {
            $query->where('name', 'ilike', "%{$request->search}%");
        }

        return response()->json([
            'success' => true,
            'data' => $query->paginate(20),
        ]);
    }

    public function productStore(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:200',
            'description' => 'nullable|string|max:2000',
            'image_url' => 'nullable|string|max:500',
            'price_points' => 'required|integer|min:0',
            'price_cash' => 'nullable|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'is_active' => 'boolean',
            'category' => 'nullable|string|in:book,merchandise,module',
        ]);

        $validated['slug'] = Str::slug($validated['name']) . '-' . Str::random(4);

        $product = StoreProduct::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Produk berhasil ditambahkan.',
            'data' => $product,
        ], 201);
    }

    public function productUpdate(Request $request, int $id): JsonResponse
    {
        $product = StoreProduct::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:200',
            'description' => 'nullable|string|max:2000',
            'image_url' => 'nullable|string|max:500',
            'price_points' => 'sometimes|integer|min:0',
            'price_cash' => 'nullable|numeric|min:0',
            'stock' => 'sometimes|integer|min:0',
            'is_active' => 'boolean',
            'category' => 'nullable|string|in:book,merchandise,module',
        ]);

        $product->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Produk berhasil diperbarui.',
            'data' => $product->fresh(),
        ]);
    }

    public function productDestroy(int $id): JsonResponse
    {
        $product = StoreProduct::findOrFail($id);
        $product->delete();

        return response()->json([
            'success' => true,
            'message' => 'Produk berhasil dihapus.',
        ]);
    }

    // ── Orders Management ──────────────────────────────────

    public function orderIndex(Request $request): JsonResponse
    {
        $query = StoreOrder::with(['user:id,name,email', 'items'])->latest('id');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        return response()->json([
            'success' => true,
            'data' => $query->paginate(20),
        ]);
    }

    public function orderUpdateStatus(Request $request, int $id): JsonResponse
    {
        $order = StoreOrder::with('items')->findOrFail($id);

        $validated = $request->validate([
            'status' => 'required|in:confirmed,shipped,completed,cancelled',
            'tracking_number' => 'nullable|string|max:100',
        ]);

        $newStatus = $validated['status'];

        // Refund points if cancelling a paid order
        if ($newStatus === 'cancelled' && $order->status !== 'cancelled' && $order->total_points > 0) {
            $user = $order->user;
            if ($user) {
                $wallet = $this->pointService->getOrCreateWallet($user);
                $this->pointService->refund(
                    $wallet,
                    $order->total_points,
                    'store_refund',
                    (string) $order->id,
                    "Refund poin pesanan Store #{$order->order_number}"
                );
            }

            // Restore stock
            foreach ($order->items as $item) {
                $item->product?->increment('stock', $item->quantity);
            }
        }

        $order->update([
            'status' => $newStatus,
            'tracking_number' => $validated['tracking_number'] ?? $order->tracking_number,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Status pesanan berhasil diperbarui.',
            'data' => $order->fresh(['items']),
        ]);
    }
}
