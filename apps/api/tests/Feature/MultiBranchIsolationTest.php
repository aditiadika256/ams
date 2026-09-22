<?php

use App\Models\Branch;
use App\Models\Order;
use App\Models\Program;
use App\Models\ProgramBatch;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Role;

uses(RefreshDatabase::class);

it('isolates orders and batches across different branches', function () {
    // 1. Setup Branches
    $branchA = Branch::create(['name' => 'Cabang Jakarta', 'code' => 'JKT', 'is_active' => true]);
    $branchB = Branch::create(['name' => 'Cabang Surabaya', 'code' => 'SBY', 'is_active' => true]);

    // 2. Setup Users
    $staffRole = Role::firstOrCreate(['name' => 'staff', 'guard_name' => 'web']);
    $superadminRole = Role::firstOrCreate(['name' => 'superadmin', 'guard_name' => 'web']);

    $staffA = User::factory()->create(['branch_id' => $branchA->id]);
    $staffA->assignRole($staffRole);

    $staffB = User::factory()->create(['branch_id' => $branchB->id]);
    $staffB->assignRole($staffRole);

    $superAdmin = User::factory()->create(['branch_id' => null]);
    $superAdmin->assignRole($superadminRole);

    // 3. Create records for Branch A and Branch B
    $orderA = Order::withoutGlobalScopes()->create([
        'branch_id' => $branchA->id,
        'user_id' => $staffA->id,
        'status' => 'paid',
        'total' => 150000.00,
        'currency' => 'IDR',
    ]);

    $orderB = Order::withoutGlobalScopes()->create([
        'branch_id' => $branchB->id,
        'user_id' => $staffB->id,
        'status' => 'paid',
        'total' => 250000.00,
        'currency' => 'IDR',
    ]);

    // 4. Test Staff A perspective
    Sanctum::actingAs($staffA);
    $ordersSeenByStaffA = Order::all();
    expect($ordersSeenByStaffA->pluck('id'))->toContain($orderA->id)
        ->and($ordersSeenByStaffA->pluck('id'))->not->toContain($orderB->id);

    // 5. Test Staff B perspective
    Sanctum::actingAs($staffB);
    $ordersSeenByStaffB = Order::all();
    expect($ordersSeenByStaffB->pluck('id'))->toContain($orderB->id)
        ->and($ordersSeenByStaffB->pluck('id'))->not->toContain($orderA->id);

    // 6. Test Super Admin perspective (sees all branches)
    Sanctum::actingAs($superAdmin);
    $ordersSeenBySuperAdmin = Order::all();
    expect($ordersSeenBySuperAdmin->pluck('id'))->toContain($orderA->id)
        ->and($ordersSeenBySuperAdmin->pluck('id'))->toContain($orderB->id);
});

it('automatically attaches the active user branch_id when creating models', function () {
    $branch = Branch::create(['name' => 'Cabang Bandung', 'code' => 'BDG', 'is_active' => true]);
    $staff = User::factory()->create(['branch_id' => $branch->id]);

    Sanctum::actingAs($staff);

    $order = Order::create([
        'user_id' => $staff->id,
        'status' => 'pending',
        'total' => 50000.00,
        'currency' => 'IDR',
    ]);

    expect($order->branch_id)->toBe($branch->id);
});
