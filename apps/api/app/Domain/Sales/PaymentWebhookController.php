<?php

namespace App\Domain\Sales;

use App\Actions\Access\ConfirmPaidOrder;
use App\Exceptions\PaymentSignatureException;
use App\Http\Controllers\Controller;
use App\Http\Requests\Access\PaymentWebhookRequest;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use OpenApi\Attributes as OA;

#[OA\Tag(
    name: 'Payments',
    description: 'Payment webhook endpoints'
)]
class PaymentWebhookController extends Controller
{
    #[OA\Post(
        path: '/api/v1/payments/webhook',
        summary: 'Handle payment notification webhook',
        tags: ['Payments'],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'order_id', type: 'string'),
                    new OA\Property(property: 'transaction_status', type: 'string'),
                    new OA\Property(property: 'fraud_status', type: 'string'),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Notification processed'),
            new OA\Response(response: 400, description: 'Invalid signature or order not found'),
        ]
    )]
    public function handle(PaymentWebhookRequest $request, ConfirmPaidOrder $action): JsonResponse
    {
        if (! $request->hasValidSignature()) {
            throw new PaymentSignatureException;
        }

        $payload = $request->validated();
        Log::info('Payment webhook received.', [
            'order_id' => $payload['order_id'],
            'status_code' => $payload['status_code'],
            'transaction_status' => $payload['transaction_status'],
            'fraud_status' => $payload['fraud_status'] ?? null,
        ]);
        $order = Order::query()->where('payment_reference', $payload['order_id'])->firstOrFail();
        $isPaid = $payload['transaction_status'] === 'settlement'
            || ($payload['transaction_status'] === 'capture'
                && ($payload['fraud_status'] ?? 'accept') === 'accept');

        if ($isPaid) {
            $action->handle($order, (string) $payload['gross_amount']);
        } elseif (in_array($payload['transaction_status'], ['deny', 'expire', 'cancel'], true)) {
            $action->mark($order, 'failed');
        } else {
            $action->mark($order, 'pending');
        }

        return $this->successResponse(null, 'Notification processed');
    }
}
