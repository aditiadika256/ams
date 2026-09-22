<?php

namespace App\Domain\Store;

use App\Domain\Gamification\PointService;
use App\Http\Controllers\Controller;
use App\Models\StoreOrder;
use App\Models\StoreOrderItem;
use App\Models\StoreProduct;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class StoreController extends Controller
{
    public function __construct(
        private readonly PointService $pointService,
    ) {}

    /**
     * GET /api/v1/store/products — Public product catalog.
     */
    public function products(Request $request): JsonResponse
    {
        $query = StoreProduct::active()->orderByDesc('id');

        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where('name', 'ilike', "%{$search}%");
        }

        $products = $query->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $products,
        ]);
    }

    /**
     * GET /api/v1/store/products/{slug} — Product detail.
     */
    public function showProduct(string $slug): JsonResponse
    {
        $product = StoreProduct::active()->where('slug', $slug)->firstOrFail();

        return response()->json([
            'success' => true,
            'data' => $product,
        ]);
    }

    /**
     * POST /api/v1/store/orders — Create store order (checkout).
     */
    public function createOrder(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|integer|exists:store_products,id',
            'items.*.quantity' => 'required|integer|min:1|max:10',
            'payment_method' => 'required|in:points,cash,mixed',
            'shipping_name' => 'required|string|max:150',
            'shipping_phone' => 'required|string|max:30',
            'shipping_address' => 'required|string|max:500',
            'shipping_city' => 'nullable|string|max:100',
            'shipping_postal_code' => 'nullable|string|max:10',
            'notes' => 'nullable|string|max:500',
        ]);

        $order = DB::transaction(function () use ($user, $validated) {
            $totalPoints = 0;
            $totalCash = 0;
            $lineItems = [];

            // Validate stock and calculate totals
            foreach ($validated['items'] as $item) {
                $product = StoreProduct::lockForUpdate()->findOrFail($item['product_id']);

                if (! $product->is_active) {
                    throw ValidationException::withMessages([
                        'items' => "Produk \"{$product->name}\" tidak tersedia.",
                    ]);
                }

                if ($product->stock < $item['quantity']) {
                    throw ValidationException::withMessages([
                        'items' => "Stok produk \"{$product->name}\" tidak mencukupi. Tersedia: {$product->stock}.",
                    ]);
                }

                // Decrement stock
                $product->decrement('stock', $item['quantity']);

                $itemPoints = $product->price_points * $item['quantity'];
                $itemCash = (float) ($product->price_cash ?? 0) * $item['quantity'];
                $totalPoints += $itemPoints;
                $totalCash += $itemCash;

                $lineItems[] = [
                    'store_product_id' => $product->id,
                    'product_name' => $product->name,
                    'quantity' => $item['quantity'],
                    'points_each' => $product->price_points,
                    'cash_each' => $product->price_cash ?? 0,
                ];
            }

            // Deduct points if paying with points
            $paymentMethod = $validated['payment_method'];
            if (in_array($paymentMethod, ['points', 'mixed']) && $totalPoints > 0) {
                $wallet = $this->pointService->getOrCreateWallet($user);
                $this->pointService->spend(
                    $wallet,
                    $totalPoints,
                    'store_purchase',
                    null, // will update after order created
                    'Pembelian produk di Store'
                );
            }

            // Create order
            $orderNumber = 'STR-' . date('Ymd') . '-' . strtoupper(Str::random(6));
            $order = StoreOrder::create([
                'user_id' => $user->id,
                'order_number' => $orderNumber,
                'status' => 'pending',
                'total_points' => $totalPoints,
                'total_cash' => $totalCash,
                'payment_method' => $paymentMethod,
                'shipping_name' => $validated['shipping_name'],
                'shipping_phone' => $validated['shipping_phone'],
                'shipping_address' => $validated['shipping_address'],
                'shipping_city' => $validated['shipping_city'] ?? null,
                'shipping_postal_code' => $validated['shipping_postal_code'] ?? null,
                'notes' => $validated['notes'] ?? null,
            ]);

            foreach ($lineItems as $line) {
                $order->items()->create($line);
            }

            return $order->load('items');
        });

        return response()->json([
            'success' => true,
            'message' => 'Pesanan Store berhasil dibuat.',
            'data' => $order,
        ], 201);
    }

    /**
     * GET /api/v1/store/orders — User's store order history.
     */
    public function orders(Request $request): JsonResponse
    {
        $user = $request->user();

        $orders = StoreOrder::with('items')
            ->where('user_id', $user->id)
            ->latest('id')
            ->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $orders,
        ]);
    }

    /**
     * GET /api/v1/store/orders/{id} — Order detail.
     */
    public function showOrder(Request $request, int $id): JsonResponse
    {
        $order = StoreOrder::with('items.product')
            ->where('user_id', $request->user()->id)
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $order,
        ]);
    }
}
