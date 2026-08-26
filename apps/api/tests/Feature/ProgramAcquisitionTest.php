<?php

use App\Enums\AccessStatus;
use App\Enums\CodeType;
use App\Enums\ProgramStatus;
use App\Models\AccessCode;
use App\Models\Order;
use App\Models\Program;
use App\Models\ProgramAccess;
use App\Models\ProgramBatch;
use App\Models\User;
use Database\Seeders\RolesSeeder;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Illuminate\Support\Facades\Log;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;

uses(LazilyRefreshDatabase::class);

beforeEach(function (): void {
    $this->seed(RolesSeeder::class);
    app(PermissionRegistrar::class)->forgetCachedPermissions();
    config()->set('services.payment.webhook_secret', 'test-server-key');

    $this->authenticate = function (array $permissions = []): User {
        $user = User::factory()->create();

        foreach ($permissions as $permission) {
            $user->givePermissionTo(Permission::findByName($permission, 'web'));
        }

        Sanctum::actingAs($user);

        return $user;
    };

    $this->paymentPayload = function (Order $order, string $status = 'settlement'): array {
        $statusCode = '200';
        $grossAmount = $order->total;

        return [
            'order_id' => $order->payment_reference,
            'status_code' => $statusCode,
            'gross_amount' => $grossAmount,
            'transaction_status' => $status,
            'fraud_status' => 'accept',
            'signature_key' => hash(
                'sha512',
                $order->payment_reference.$statusCode.$grossAmount.'test-server-key',
            ),
        ];
    };
});

it('creates an order from published programs with immutable program and batch snapshots', function () {
    $user = ($this->authenticate)();
    $program = Program::factory()->published()->create([
        'name' => 'Kelas Intensif',
        'slug' => 'kelas-intensif',
        'base_price' => '150000.00',
    ]);
    $batch = ProgramBatch::factory()->for($program)->create([
        'name' => 'Batch September',
        'code' => 'SEP-26',
        'price_override' => '125000.00',
    ]);

    $orderId = $this->postJson('/api/v1/orders', [
        'programs' => [['id' => $program->id, 'batch_id' => $batch->id, 'quantity' => 1]],
        'payment_provider' => 'midtrans',
    ])->assertCreated()
        ->assertJsonPath('data.total', '125000.00')
        ->json('data.id');

    $this->assertDatabaseHas('orders', ['id' => $orderId, 'user_id' => $user->id]);
    $this->assertDatabaseHas('order_items', [
        'order_id' => $orderId,
        'program_id' => $program->id,
        'program_batch_id' => $batch->id,
        'program_name' => 'Kelas Intensif',
        'program_slug' => 'kelas-intensif',
        'batch_name' => 'Batch September',
        'batch_code' => 'SEP-26',
        'unit_price' => '125000.00',
        'currency' => 'IDR',
    ]);

    $program->update(['name' => 'Nama Baru']);
    $batch->update(['name' => 'Batch Baru']);
    $this->getJson("/api/v1/orders/{$orderId}")
        ->assertOk()
        ->assertJsonPath('data.items.0.program_name', 'Kelas Intensif')
        ->assertJsonPath('data.items.0.batch_name', 'Batch September');

    Program::factory()->create(['status' => ProgramStatus::Draft]);
    $this->postJson('/api/v1/orders', [
        'programs' => [['id' => Program::query()->latest('id')->value('id')]],
    ])->assertUnprocessable()->assertJsonValidationErrors('programs');
});

it('rejects an invalid payment signature without changing order or granting access', function () {
    $program = Program::factory()->published()->create();
    $order = Order::query()->create([
        'user_id' => User::factory()->create()->id,
        'status' => 'pending',
        'total' => '100000.00',
        'payment_reference' => 'PAYMENT-INVALID-SIGNATURE',
    ]);
    $order->items()->create([
        'program_id' => $program->id,
        'program_name' => $program->name,
        'program_slug' => $program->slug,
        'unit_price' => '100000.00',
        'currency' => 'IDR',
        'quantity' => 1,
    ]);
    $payload = ($this->paymentPayload)($order);
    $payload['signature_key'] = 'invalid';

    $this->postJson('/api/v1/payments/webhook', $payload)
        ->assertUnauthorized()
        ->assertJsonPath('code', 'PAYMENT_SIGNATURE_INVALID');

    expect($order->fresh()->status)->toBe('pending');
    $this->assertDatabaseCount('program_accesses', 0);
});

it('rejects a signed callback with a mismatched amount and logs only allowlisted fields', function () {
    Log::spy();
    $program = Program::factory()->published()->create();
    $order = Order::query()->create([
        'user_id' => User::factory()->create()->id,
        'status' => 'pending',
        'total' => '100000.00',
        'payment_reference' => 'PAYMENT-AMOUNT-MISMATCH',
    ]);
    $order->items()->create([
        'program_id' => $program->id,
        'program_name' => $program->name,
        'program_slug' => $program->slug,
        'unit_price' => '100000.00',
        'currency' => 'IDR',
        'quantity' => 1,
    ]);
    $payload = ($this->paymentPayload)($order);
    $payload['gross_amount'] = '1.00';
    $payload['signature_key'] = hash(
        'sha512',
        $order->payment_reference.$payload['status_code'].$payload['gross_amount'].'test-server-key',
    );
    $payload['card_number'] = '4111111111111111';

    $this->postJson('/api/v1/payments/webhook', $payload)
        ->assertConflict()
        ->assertJsonPath('code', 'PAYMENT_AMOUNT_MISMATCH');

    expect($order->fresh()->status)->toBe('pending');
    $this->assertDatabaseCount('program_accesses', 0);
    Log::shouldHaveReceived('info')->once()->withArgs(function (string $message, array $context): bool {
        return $message === 'Payment webhook received.'
            && ! array_key_exists('signature_key', $context)
            && ! array_key_exists('card_number', $context);
    });
});

it('confirms a paid order once and grants each item idempotently on webhook retries', function () {
    $program = Program::factory()->published()->create();
    $order = Order::query()->create([
        'user_id' => User::factory()->create()->id,
        'status' => 'pending',
        'total' => '100000.00',
        'currency' => 'IDR',
        'payment_reference' => 'PAYMENT-RETRY-1',
    ]);
    $item = $order->items()->create([
        'program_id' => $program->id,
        'program_name' => $program->name,
        'program_slug' => $program->slug,
        'unit_price' => '100000.00',
        'currency' => 'IDR',
        'quantity' => 1,
    ]);
    $payload = ($this->paymentPayload)($order);

    $this->postJson('/api/v1/payments/webhook', $payload)->assertOk();
    $this->postJson('/api/v1/payments/webhook', $payload)->assertOk();

    expect($order->fresh()->status)->toBe('paid')
        ->and($order->fresh()->paid_at)->not->toBeNull();
    $this->assertDatabaseHas('program_accesses', [
        'user_id' => $order->user_id,
        'program_id' => $program->id,
        'source_type' => 'PAYMENT',
        'source_id' => (string) $order->id,
        'grant_key' => "payment:order:{$order->id}:item:{$item->id}",
    ]);
    $this->assertDatabaseCount('program_accesses', 1);
    $this->assertDatabaseCount('access_events', 1);
});

it('marks a denied payment failed without creating entitlement', function () {
    $order = Order::query()->create([
        'user_id' => User::factory()->create()->id,
        'status' => 'pending',
        'total' => '50000.00',
        'payment_reference' => 'PAYMENT-DENIED-1',
    ]);

    $this->postJson('/api/v1/payments/webhook', ($this->paymentPayload)($order, 'deny'))
        ->assertOk();

    expect($order->fresh()->status)->toBe('failed');
    $this->assertDatabaseCount('program_accesses', 0);
});

it('enrolls a user into a published free program through the grant service', function () {
    $user = ($this->authenticate)();
    $free = Program::factory()->published()->create(['base_price' => '0.00']);
    $paid = Program::factory()->published()->create(['base_price' => '10000.00']);

    $this->postJson('/api/v1/access/free-enrollments', [
        'program_id' => $free->id,
    ])->assertCreated()
        ->assertJsonPath('data.user_id', $user->id)
        ->assertJsonPath('data.source_type', 'FREE_ENROLLMENT');

    $this->postJson('/api/v1/access/free-enrollments', [
        'program_id' => $free->id,
    ])->assertOk();
    $this->assertDatabaseCount('program_accesses', 1);

    $this->postJson('/api/v1/access/free-enrollments', [
        'program_id' => $paid->id,
    ])->assertUnprocessable()->assertJsonPath('code', 'PROGRAM_NOT_FREE');
});

it('redeems an enrollment code atomically and enforces its final quota', function () {
    $user = ($this->authenticate)();
    $program = Program::factory()->published()->create();
    $plainCode = 'JOIN-ARKANIN-2026';
    $code = AccessCode::query()->create([
        'code_hash' => hash('sha256', $plainCode),
        'code_hint' => '2026',
        'type' => CodeType::EnrollmentCode,
        'program_id' => $program->id,
        'max_redemptions' => 1,
        'starts_at' => now()->subDay(),
        'ends_at' => now()->addDay(),
        'is_active' => true,
    ]);

    $this->postJson('/api/v1/access/redeem-enrollment-code', [
        'code' => $plainCode,
        'idempotency_key' => 'redeem-user-one',
    ])->assertCreated()->assertJsonPath('data.program_id', $program->id);

    expect($code->fresh()->redemptions_count)->toBe(1);
    $this->assertDatabaseHas('access_code_redemptions', [
        'access_code_id' => $code->id,
        'user_id' => $user->id,
        'idempotency_key' => 'redeem-user-one',
    ]);

    ($this->authenticate)();
    $this->postJson('/api/v1/access/redeem-enrollment-code', [
        'code' => $plainCode,
        'idempotency_key' => 'redeem-user-two',
    ])->assertConflict()->assertJsonPath('code', 'ACCESS_CODE_QUOTA_EXHAUSTED');
    $this->assertDatabaseCount('access_code_redemptions', 1);
});

it('replays an existing code redemption after expiry and rejects new acquisition for a draft program', function () {
    $user = ($this->authenticate)();
    $program = Program::factory()->published()->create();
    $plainCode = 'REPLAY-AFTER-EXPIRY';
    $code = AccessCode::query()->create([
        'code_hash' => hash('sha256', $plainCode),
        'code_hint' => 'PIRY',
        'type' => CodeType::EnrollmentCode,
        'program_id' => $program->id,
        'starts_at' => now()->subDay(),
        'ends_at' => now()->addDay(),
        'is_active' => true,
    ]);

    $accessId = $this->postJson('/api/v1/access/redeem-enrollment-code', [
        'code' => $plainCode,
        'idempotency_key' => 'replay-expired-code',
    ])->assertCreated()->json('data.id');

    $code->update(['ends_at' => now()->subMinute(), 'is_active' => false]);
    $this->postJson('/api/v1/access/redeem-enrollment-code', [
        'code' => $plainCode,
        'idempotency_key' => 'replay-expired-code',
    ])->assertOk()->assertJsonPath('data.id', $accessId);

    expect(ProgramAccess::query()->where('user_id', $user->id)->count())->toBe(1);

    $draft = Program::factory()->create();
    $draftCode = 'DRAFT-PROGRAM-CODE';
    AccessCode::query()->create([
        'code_hash' => hash('sha256', $draftCode),
        'code_hint' => 'CODE',
        'type' => CodeType::EnrollmentCode,
        'program_id' => $draft->id,
        'is_active' => true,
    ]);

    $this->postJson('/api/v1/access/redeem-enrollment-code', [
        'code' => $draftCode,
        'idempotency_key' => 'draft-program-code',
    ])->assertUnprocessable()->assertJsonPath('code', 'PROGRAM_NOT_AVAILABLE');
});

it('requires granular permission and reason for admin grant and lifecycle actions', function () {
    $member = User::factory()->create();
    $program = Program::factory()->create();

    $this->postJson('/api/v1/admin/program-accesses/grant', [])->assertUnauthorized();

    ($this->authenticate)();
    $this->postJson('/api/v1/admin/program-accesses/grant', [
        'user_id' => $member->id,
        'program_id' => $program->id,
        'reason' => 'Grant tanpa permission.',
        'idempotency_key' => 'admin-grant-no-permission',
    ])->assertForbidden();

    ($this->authenticate)(['program-access.grant']);
    $accessId = $this->postJson('/api/v1/admin/program-accesses/grant', [
        'user_id' => $member->id,
        'program_id' => $program->id,
        'reason' => 'Memberikan akses dari admin.',
        'idempotency_key' => 'admin-grant-member-one',
    ])->assertCreated()->json('data.id');

    ($this->authenticate)(['program-access.suspend']);
    $this->postJson("/api/v1/admin/program-accesses/{$accessId}/suspend", [
        'reason' => 'Menangguhkan akses sementara.',
    ])->assertOk()->assertJsonPath('data.status', 'SUSPENDED');

    $this->assertDatabaseHas('access_events', [
        'program_access_id' => $accessId,
        'action' => 'access.suspended',
        'reason' => 'Menangguhkan akses sementara.',
    ]);
    expect(ProgramAccess::query()->findOrFail($accessId)->status)->toBe(AccessStatus::Suspended);
});
