<?php

namespace App\Domain\Sales;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
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
    public function handle(Request $request): JsonResponse
    {
        // Log the incoming request for debugging
        Log::info('Payment Webhook Received', $request->all());

        $payload = $request->all();

        // NOTE: In a real implementation (e.g., Midtrans), you must verify the signature key here.
        // $signatureKey = $payload['signature_key'];
        // $mySignature = hash('sha512', $payload['order_id'] . $payload['status_code'] . $payload['gross_amount'] . config('services.midtrans.server_key'));
        // if ($signatureKey !== $mySignature) {
        //     return response()->json(['message' => 'Invalid signature'], 400);
        // }

        // Strategy: We try to find the order by payment_reference
        // Assuming payment_reference matches 'order_id' from the payload.
        $paymentReference = $payload['order_id'] ?? null;
        $transactionStatus = $payload['transaction_status'] ?? null;

        if (!$paymentReference || !$transactionStatus) {
            return response()->json(['message' => 'Invalid payload'], 400);
        }

        $order = Order::where('payment_reference', $paymentReference)->first();

        if (!$order) {
            return response()->json(['message' => 'Order not found'], 404);
        }

        switch ($transactionStatus) {
            case 'capture':
            case 'settlement':
                $order->update(['status' => 'paid']);
                break;
            case 'deny':
            case 'expire':
            case 'cancel':
                $order->update(['status' => 'failed']);
                break;
            case 'pending':
                $order->update(['status' => 'pending']);
                break;
        }

        return response()->json(['message' => 'Notification processed']);
    }
}
