<?php

namespace App\Domain\Finance;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * @OA\Tag(
 *     name="Finance - Reports",
 *     description="Finance Reports & Analytics"
 * )
 */
class ReportController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/v1/finance/reports/custom",
     *     tags={"Finance - Reports"},
     *     summary="Generate custom report",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="start_date", in="query", required=true, @OA\Schema(type="string", format="date")),
     *     @OA\Parameter(name="end_date", in="query", required=true, @OA\Schema(type="string", format="date")),
     *     @OA\Parameter(name="type", in="query", required=true, @OA\Schema(type="string", enum={"revenue", "orders"})),
     *     @OA\Parameter(name="group_by", in="query", required=false, @OA\Schema(type="string", enum={"day", "month"})),
     *     @OA\Response(response=200, description="Custom report data")
     * )
     */
    public function custom(Request $request)
    {
        $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'type' => 'required|in:revenue,orders',
            'group_by' => 'sometimes|in:day,month'
        ]);

        $query = Order::where('status', 'paid')
            ->whereBetween('created_at', [
                $request->start_date . ' 00:00:00',
                $request->end_date . ' 23:59:59'
            ]);

        $groupBy = $request->group_by ?? 'day';
        
        // SQLite uses strftime, MySQL uses DATE_FORMAT.
        if ($groupBy === 'month') {
            $selectDate = "strftime('%Y-%m', created_at) as date"; // SQLite
            if (config('database.default') === 'mysql') {
                $selectDate = "DATE_FORMAT(created_at, '%Y-%m') as date";
            }
        } else {
            $selectDate = "DATE(created_at) as date";
        }

        if ($request->type === 'revenue') {
            $data = $query->select(
                DB::raw($selectDate),
                DB::raw('SUM(total_amount) as value'),
                DB::raw('COUNT(*) as count')
            );
        } else {
            $data = $query->select(
                DB::raw($selectDate),
                DB::raw('COUNT(*) as value')
            );
        }

        $results = $data->groupBy('date')
            ->orderBy('date')
            ->get();

        return $this->successResponse($results, 'Custom report generated successfully');
    }

    /**
     * @OA\Get(
     *     path="/api/v1/finance/revenue/daily",
     *     tags={"Finance - Reports"},
     *     summary="Get daily revenue report",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(name="start_date", in="query", required=true, @OA\Schema(type="string", format="date")),
     *     @OA\Parameter(name="end_date", in="query", required=true, @OA\Schema(type="string", format="date")),
     *     @OA\Response(response=200, description="Daily revenue report")
     * )
     */
    public function dailyRevenue(Request $request)
    {
        $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);

        $revenue = Order::where('status', 'paid')
            ->whereBetween('created_at', [
                $request->start_date . ' 00:00:00',
                $request->end_date . ' 23:59:59'
            ])
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('SUM(total_amount) as revenue'),
                DB::raw('COUNT(*) as count')
            )
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return $this->successResponse($revenue, 'Daily revenue report retrieved successfully');
    }

    /**
     * @OA\Get(
     *     path="/api/v1/finance/revenue/summary",
     *     tags={"Finance - Reports"},
     *     summary="Get revenue summary",
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(response=200, description="Revenue summary")
     * )
     */
    public function summary(Request $request)
    {
        $today = Order::where('status', 'paid')
            ->whereDate('created_at', today())
            ->sum('total_amount');

        $thisMonth = Order::where('status', 'paid')
            ->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->sum('total_amount');

        $thisYear = Order::where('status', 'paid')
            ->whereYear('created_at', now()->year)
            ->sum('total_amount');

        return $this->successResponse([
            'today' => $today,
            'this_month' => $thisMonth,
            'this_year' => $thisYear,
        ], 'Revenue summary retrieved successfully');
    }
}
