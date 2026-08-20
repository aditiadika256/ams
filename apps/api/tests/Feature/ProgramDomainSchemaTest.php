<?php

use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

uses(RefreshDatabase::class);

it('installs the modular program schema without legacy lookup tables', function () {
    expect(Schema::hasTable('program_levels'))->toBeFalse()
        ->and(Schema::hasTable('program_types'))->toBeFalse();

    $expectedTables = [
        'programs',
        'tags',
        'program_tag',
        'component_definitions',
        'program_components',
        'program_relations',
        'program_batches',
        'program_sessions',
        'session_mentor_assignments',
        'program_accesses',
        'access_events',
        'access_codes',
        'access_code_redemptions',
    ];

    foreach ($expectedTables as $table) {
        expect(Schema::hasTable($table))->toBeTrue("Missing table: {$table}");
    }
});

it('provides the required program and entitlement fields', function () {
    expect(Schema::hasColumns('programs', [
        'name',
        'slug',
        'short_description',
        'description',
        'thumbnail_url',
        'cover_url',
        'base_price',
        'currency',
        'visibility',
        'status',
        'completion_rule',
        'published_at',
        'archived_at',
    ]))->toBeTrue();

    expect(Schema::hasColumns('program_accesses', [
        'user_id',
        'program_id',
        'program_batch_id',
        'parent_program_access_id',
        'source_type',
        'source_id',
        'grant_key',
        'status',
        'starts_at',
        'ends_at',
        'activated_at',
        'completed_at',
        'suspended_at',
        'revoked_at',
        'archived_at',
        'last_accessed_at',
        'metadata',
        'created_by',
        'updated_by',
    ]))->toBeTrue();

    expect(Schema::hasColumns('order_items', [
        'program_batch_id',
        'program_name',
        'program_slug',
        'batch_name',
        'batch_code',
        'unit_price',
    ]))->toBeTrue();
});

it('enforces unique program slugs', function () {
    $now = now();

    $program = [
        'name' => 'Program Satu',
        'slug' => 'program-satu',
        'base_price' => '100000.00',
        'currency' => 'IDR',
        'visibility' => 'PUBLIC',
        'status' => 'DRAFT',
        'created_at' => $now,
        'updated_at' => $now,
    ];

    DB::table('programs')->insert($program);

    expect(fn () => DB::table('programs')->insert($program))
        ->toThrow(QueryException::class);
});

it('enforces unique access grant keys', function () {
    $now = now();

    $userId = DB::table('users')->insertGetId([
        'name' => 'Schema User',
        'email' => 'schema@example.com',
        'password' => 'hashed',
        'created_at' => $now,
        'updated_at' => $now,
    ]);
    $programId = DB::table('programs')->insertGetId([
        'name' => 'Program Akses',
        'slug' => 'program-akses',
        'base_price' => '100000.00',
        'currency' => 'IDR',
        'visibility' => 'PUBLIC',
        'status' => 'DRAFT',
        'created_at' => $now,
        'updated_at' => $now,
    ]);

    $access = [
        'user_id' => $userId,
        'program_id' => $programId,
        'source_type' => 'ADMIN_GRANT',
        'grant_key' => 'schema-grant-key',
        'status' => 'ACTIVE',
        'created_at' => $now,
        'updated_at' => $now,
    ];

    DB::table('program_accesses')->insert($access);

    expect(fn () => DB::table('program_accesses')->insert($access))
        ->toThrow(QueryException::class);
});
