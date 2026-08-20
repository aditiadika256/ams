<?php

namespace App\Domain\Sales;

use App\Actions\Orders\CreateOrder;
use App\Http\Controllers\Controller;
use App\Http\Requests\Sales\OrderIndexRequest;
use App\Http\Requests\Sales\OrderStoreRequest;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

#[OA\Tag(
    name: 'Orders',
    description: 'Sales orders endpoints'
)]
class OrderController extends Controller
{
    #[OA\Get(
        path: '/api/v1/orders',
        summary: 'List authenticated user orders',
        tags: ['Orders'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\QueryParameter(name: 'status', description: 'Filter status (pending|paid|expired|failed)', required: false, schema: new OA\Schema(type: 'string')),
            new OA\QueryParameter(name: 'page', required: false, schema: new OA\Schema(type: 'integer', format: 'int32')),
            new OA\QueryParameter(name: 'per_page', required: false, schema: new OA\Schema(type: 'integer', format: 'int32')),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Orders list'),
            new OA\Response(response: 401, description: 'Unauthenticated'),
        ]
    )]
    public function index(OrderIndexRequest $request): JsonResponse
    {
        $filters = $request->validated();
        $user = $request->user();

        $query = Order::query()
            ->forUser($user->id)
            ->with('items');

        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        $perPage = $filters['per_page'] ?? 15;

        $orders = $query
            ->orderByDesc('created_at')
            ->paginate($perPage);

        return $this->successResponse(
            OrderResource::collection($orders),
            'Orders retrieved successfully'
        );
    }

    #[OA\Get(
        path: '/api/v1/orders/{id}',
        summary: 'Get order detail for authenticated user',
        tags: ['Orders'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\PathParameter(name: 'id', schema: new OA\Schema(type: 'integer')),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Order detail'),
            new OA\Response(response: 403, description: 'Forbidden'),
            new OA\Response(response: 404, description: 'Order not found'),
            new OA\Response(response: 401, description: 'Unauthenticated'),
        ]
    )]
    public function show(Request $request, Order $order): JsonResponse
    {
        $user = $request->user();

        if ($order->user_id !== $user->id) {
            return $this->forbiddenResponse('You are not allowed to view this order');
        }

        $order->load('items');

        return $this->successResponse(
            new OrderResource($order),
            'Order retrieved successfully'
        );
    }

    #[OA\Post(
        path: '/api/v1/orders',
        summary: 'Create new order for authenticated user',
        tags: ['Orders'],
        security: [['bearerAuth' => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['programs'],
                properties: [
                    new OA\Property(
                        property: 'programs',
                        type: 'array',
                        items: new OA\Items(
                            type: 'object',
                            properties: [
                                new OA\Property(property: 'id', type: 'integer', example: 1),
                                new OA\Property(property: 'quantity', type: 'integer', example: 1),
                            ]
                        )
                    ),
                    new OA\Property(property: 'payment_provider', type: 'string', example: 'midtrans'),
                    new OA\Property(property: 'payment_reference', type: 'string', example: 'INV-2025-0001'),
                    new OA\Property(property: 'meta', type: 'object'),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 201, description: 'Order created'),
            new OA\Response(response: 422, description: 'Validation or program error'),
            new OA\Response(response: 401, description: 'Unauthenticated'),
        ]
    )]
    public function store(OrderStoreRequest $request, CreateOrder $action): JsonResponse
    {
        $order = $action->handle($request->validated(), $request->user());

        return $this->createdResponse(
            new OrderResource($order),
            'Order created successfully'
        );
    }
}
