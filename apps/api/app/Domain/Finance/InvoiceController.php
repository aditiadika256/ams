<?php

namespace App\Domain\Finance;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use Illuminate\Http\Request;

/**
 * @OA\Tag(
 *     name="Finance - Invoices",
 *     description="Invoice Management System"
 * )
 */
class InvoiceController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/v1/finance/invoices",
     *     tags={"Finance - Invoices"},
     *     summary="List invoices",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="status", in="query", required=false, @OA\Schema(type="string", enum={"draft", "sent", "paid", "overdue", "cancelled"})),
     *     @OA\Response(response=200, description="List of invoices")
     * )
     */
    public function index(Request $request)
    {
        $query = Invoice::query()->with('user:id,name,email');

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        return response()->json($query->latest()->paginate(20));
    }

    /**
     * @OA\Post(
     *     path="/api/v1/finance/invoices",
     *     tags={"Finance - Invoices"},
     *     summary="Create new invoice",
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"user_id", "issue_date", "due_date", "items"},
     *             @OA\Property(property="user_id", type="integer"),
     *             @OA\Property(property="issue_date", type="string", format="date"),
     *             @OA\Property(property="due_date", type="string", format="date"),
     *             @OA\Property(property="items", type="array", @OA\Items(
     *                 @OA\Property(property="description", type="string"),
     *                 @OA\Property(property="quantity", type="number"),
     *                 @OA\Property(property="unit_price", type="number")
     *             )),
     *             @OA\Property(property="notes", type="string")
     *         )
     *     ),
     *     @OA\Response(response=201, description="Invoice created")
     * )
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'issue_date' => 'required|date',
            'due_date' => 'required|date|after_or_equal:issue_date',
            'items' => 'required|array',
            'items.*.description' => 'required|string',
            'items.*.quantity' => 'required|numeric|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
            'notes' => 'nullable|string'
        ]);

        // Calculate totals
        $subtotal = 0;
        foreach ($validated['items'] as &$item) {
            $item['total'] = $item['quantity'] * $item['unit_price'];
            $subtotal += $item['total'];
        }

        $validated['subtotal'] = $subtotal;
        $validated['tax'] = 0; // Can be enhanced later
        $validated['total_amount'] = $subtotal;
        $validated['status'] = 'draft';
        $validated['invoice_number'] = 'INV-' . time();

        $invoice = Invoice::create($validated);

        return response()->json($invoice, 201);
    }

    /**
     * @OA\Get(
     *     path="/api/v1/finance/invoices/{id}",
     *     tags={"Finance - Invoices"},
     *     summary="Get invoice details",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Invoice details")
     * )
     */
    public function show(Invoice $invoice)
    {
        return response()->json($invoice->load('user'));
    }

    /**
     * @OA\Put(
     *     path="/api/v1/finance/invoices/{id}",
     *     tags={"Finance - Invoices"},
     *     summary="Update invoice status",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\RequestBody(
     *         @OA\JsonContent(
     *             required={"status"},
     *             @OA\Property(property="status", type="string", enum={"draft", "sent", "paid", "overdue", "cancelled"})
     *         )
     *     ),
     *     @OA\Response(response=200, description="Invoice updated")
     * )
     */
    public function update(Request $request, Invoice $invoice)
    {
        $validated = $request->validate([
            'status' => 'required|in:draft,sent,paid,overdue,cancelled',
        ]);

        $invoice->update($validated);

        return response()->json($invoice);
    }
}
