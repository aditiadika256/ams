<?php

namespace App\Domain\Finance;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * @OA\Tag(
 *     name="Finance - Transactions",
 *     description="Financial Transaction Management"
 * )
 */
class TransactionController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/v1/finance/transactions",
     *     tags={"Finance - Transactions"},
     *     summary="List transactions",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="type", in="query", required=false, @OA\Schema(type="string", enum={"income", "expense"})),
     *     @OA\Parameter(name="status", in="query", required=false, @OA\Schema(type="string", enum={"pending", "completed", "cancelled"})),
     *     @OA\Parameter(name="start_date", in="query", required=false, @OA\Schema(type="string", format="date")),
     *     @OA\Parameter(name="end_date", in="query", required=false, @OA\Schema(type="string", format="date")),
     *     @OA\Response(response=200, description="List of transactions")
     * )
     */
    public function index(Request $request)
    {
        $query = Transaction::query()->with('user:id,name,email');

        if ($request->has('type')) {
            $query->where('type', $request->type);
        }
        
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('start_date') && $request->has('end_date')) {
            $query->whereBetween('transaction_date', [$request->start_date, $request->end_date]);
        }

        return response()->json($query->latest()->paginate(20));
    }

    /**
     * @OA\Post(
     *     path="/api/v1/finance/transactions",
     *     tags={"Finance - Transactions"},
     *     summary="Create new transaction",
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"type", "category", "amount", "transaction_date"},
     *             @OA\Property(property="type", type="string", enum={"income", "expense"}),
     *             @OA\Property(property="category", type="string"),
     *             @OA\Property(property="amount", type="number"),
     *             @OA\Property(property="transaction_date", type="string", format="date"),
     *             @OA\Property(property="description", type="string"),
     *             @OA\Property(property="payment_method", type="string"),
     *             @OA\Property(property="status", type="string", enum={"pending", "completed", "cancelled"})
     *         )
     *     ),
     *     @OA\Response(response=201, description="Transaction created")
     * )
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'type' => 'required|in:income,expense',
            'category' => 'required|string',
            'amount' => 'required|numeric|min:0',
            'transaction_date' => 'required|date',
            'description' => 'nullable|string',
            'payment_method' => 'nullable|string',
            'status' => 'nullable|in:pending,completed,cancelled'
        ]);

        // Generate reference number
        $validated['reference_number'] = 'TRX-' . time() . '-' . rand(100, 999);
        $validated['user_id'] = auth()->id();

        $transaction = Transaction::create($validated);

        return response()->json($transaction, 201);
    }

    /**
     * @OA\Get(
     *     path="/api/v1/finance/transactions/{id}",
     *     tags={"Finance - Transactions"},
     *     summary="Get transaction details",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Transaction details")
     * )
     */
    public function show(Transaction $transaction)
    {
        return response()->json($transaction->load('user'));
    }

    /**
     * @OA\Put(
     *     path="/api/v1/finance/transactions/{id}",
     *     tags={"Finance - Transactions"},
     *     summary="Update transaction",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\RequestBody(
     *         @OA\JsonContent(
     *             @OA\Property(property="category", type="string"),
     *             @OA\Property(property="amount", type="number"),
     *             @OA\Property(property="transaction_date", type="string", format="date"),
     *             @OA\Property(property="description", type="string"),
     *             @OA\Property(property="status", type="string", enum={"pending", "completed", "cancelled"})
     *         )
     *     ),
     *     @OA\Response(response=200, description="Transaction updated")
     * )
     */
    public function update(Request $request, Transaction $transaction)
    {
        $validated = $request->validate([
            'category' => 'sometimes|string',
            'amount' => 'sometimes|numeric|min:0',
            'transaction_date' => 'sometimes|date',
            'description' => 'nullable|string',
            'status' => 'sometimes|in:pending,completed,cancelled'
        ]);

        $transaction->update($validated);

        return response()->json($transaction);
    }

    /**
     * @OA\Delete(
     *     path="/api/v1/finance/transactions/{id}",
     *     tags={"Finance - Transactions"},
     *     summary="Delete transaction",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Transaction deleted")
     * )
     */
    public function destroy(Transaction $transaction)
    {
        $transaction->delete();
        return response()->json(['message' => 'Transaction deleted']);
    }

    /**
     * @OA\Get(
     *     path="/api/v1/finance/transactions/stats/summary",
     *     tags={"Finance - Transactions"},
     *     summary="Get transaction statistics",
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(response=200, description="Transaction statistics")
     * )
     */
    public function stats()
    {
        $income = Transaction::where('type', 'income')->where('status', 'completed')->sum('amount');
        $expense = Transaction::where('type', 'expense')->where('status', 'completed')->sum('amount');
        
        return response()->json([
            'total_income' => $income,
            'total_expense' => $expense,
            'net_profit' => $income - $expense,
            'recent_transactions' => Transaction::latest()->take(5)->get()
        ]);
    }
}
