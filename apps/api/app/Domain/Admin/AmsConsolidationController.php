<?php

namespace App\Domain\Admin;

use App\Http\Controllers\Controller;
use App\Models\Branch;
use App\Models\Order;
use App\Models\ProgramAccess;
use App\Models\ProgramCertificate;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AmsConsolidationController extends Controller
{
    /**
     * GET /api/v1/admin/ams/consolidation
     * Super Admin AMS Global Consolidation & Multi-Branch Performance Dashboard.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        // Ensure user is authorized for central AMS consolidation
        if (! $user->hasRole(['superadmin', 'super_admin']) && $user->branch_id !== null) {
            return response()->json([
                'success' => false,
                'message' => 'Hanya Super Admin AMS Pusat yang memiliki akses ke konsolidasi multi-cabang.',
            ], 403);
        }

        // 1. Global Metrics
        $totalRevenue = (float) Order::withoutGlobalScopes()->where('status', 'paid')->sum('total');
        $totalOrders = Order::withoutGlobalScopes()->where('status', 'paid')->count();
        $totalStudents = User::whereHas('roles', fn ($q) => $q->where('name', 'user'))->count();
        if ($totalStudents === 0) {
            $totalStudents = User::count();
        }
        $totalCertificates = ProgramCertificate::count();
        $totalBranches = Branch::count();

        // Multi-program retention metric: % of users with > 1 program access
        $multiEnrolledCount = ProgramAccess::select('user_id')
            ->groupBy('user_id')
            ->havingRaw('count(id) > 1')
            ->get()
            ->count();
        $totalEnrolledStudents = ProgramAccess::distinct('user_id')->count('user_id');
        $retentionRate = $totalEnrolledStudents > 0
            ? round(($multiEnrolledCount / $totalEnrolledStudents) * 100, 1)
            : 0.0;

        // 2. Per-Branch Performance Breakdown
        $branches = Branch::all()->map(function ($branch) {
            $studentCount = User::where('branch_id', $branch->id)->count();
            $branchRevenue = (float) Order::withoutGlobalScopes()
                ->where('branch_id', $branch->id)
                ->where('status', 'paid')
                ->sum('total');
            $branchOrders = Order::withoutGlobalScopes()
                ->where('branch_id', $branch->id)
                ->where('status', 'paid')
                ->count();
            $branchCertificates = ProgramCertificate::whereHas('programAccess.batch', function ($q) use ($branch) {
                $q->withoutGlobalScopes()->where('branch_id', $branch->id);
            })->count();

            return [
                'id' => $branch->id,
                'name' => $branch->name,
                'code' => $branch->code ?? "BR-{$branch->id}",
                'total_students' => $studentCount,
                'total_revenue' => $branchRevenue,
                'total_orders' => $branchOrders,
                'total_certificates' => $branchCertificates,
            ];
        });

        // 3. Monthly Revenue Trend (Last 6 Months)
        $monthlyTrend = Order::withoutGlobalScopes()
            ->where('status', 'paid')
            ->where('created_at', '>=', now()->subMonths(6)->startOfMonth())
            ->select(
                DB::raw("TO_CHAR(created_at, 'YYYY-MM') as month"),
                DB::raw('SUM(total) as revenue'),
                DB::raw('COUNT(id) as orders_count')
            )
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'global' => [
                    'total_revenue' => $totalRevenue,
                    'total_orders' => $totalOrders,
                    'total_students' => $totalStudents,
                    'total_branches' => $totalBranches,
                    'total_certificates' => $totalCertificates,
                    'retention_rate' => $retentionRate,
                ],
                'branches' => $branches,
                'monthly_trend' => $monthlyTrend,
            ],
        ]);
    }
}
