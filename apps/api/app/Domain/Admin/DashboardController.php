<?php

namespace App\Domain\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Order;
use App\Models\ExamAttempt;
use App\Models\Program;
use Illuminate\Http\Request;

/**
 * @OA\Tag(
 *     name="Admin - Dashboard",
 *     description="Admin Dashboard Analytics"
 * )
 */
class DashboardController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/v1/admin/dashboard/stats",
     *     tags={"Admin - Dashboard"},
     *     summary="Get dashboard statistics",
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(response=200, description="Dashboard statistics")
     * )
     */
    public function stats(Request $request)
    {
        // Branch Scoping
        $branchId = null;
        if ($request->user()->hasRole('manajer_cabang') && !$request->user()->hasRole('superadmin')) {
            $branchId = $request->user()->branch_id;
        }

        // Users Count
        $usersQuery = User::query();
        if ($branchId) {
            $usersQuery->where('branch_id', $branchId);
        }
        $totalUsers = $usersQuery->count();

        // Orders/Revenue
        // Assuming Order has user relationship and total_amount
        $ordersQuery = Order::query()->where('status', 'paid');
        if ($branchId) {
            $ordersQuery->whereHas('user', function($q) use ($branchId) {
                $q->where('branch_id', $branchId);
            });
        }
        $totalRevenue = $ordersQuery->sum('total_amount');
        $totalOrders = $ordersQuery->count();

        // Exam Attempts
        $attemptsQuery = ExamAttempt::query();
        if ($branchId) {
            $attemptsQuery->whereHas('user', function($q) use ($branchId) {
                $q->where('branch_id', $branchId);
            });
        }
        $totalAttempts = $attemptsQuery->count();

        // Active Programs
        $totalPrograms = Program::where('is_active', true)->count();

        return $this->successResponse([
            'total_users' => $totalUsers,
            'total_revenue' => $totalRevenue,
            'total_orders' => $totalOrders,
            'total_exam_attempts' => $totalAttempts,
            'total_programs' => $totalPrograms,
        ], 'Dashboard stats retrieved successfully');
    }
}
