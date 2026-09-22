<?php

use App\Domain\Finance\WalletService;
use App\Enums\WalletType;
use App\Exceptions\DomainConflictException;
use App\Models\User;
use App\Models\Wallet;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('creates wallet and accurately credits balance', function () {
    $user = User::factory()->create();
    $service = app(WalletService::class);

    $wallet = $service->getOrCreateWallet($user, WalletType::Student);
    expect((float) $wallet->balance)->toBe(0.0);

    $service->credit($wallet, 50000.00, 'manual_credit', '1', 'Topup saldo');

    $wallet->refresh();
    expect((float) $wallet->balance)->toBe(50000.00);
});

it('prevents debit when balance is insufficient', function () {
    $user = User::factory()->create();
    $service = app(WalletService::class);

    $wallet = $service->getOrCreateWallet($user, WalletType::Student);
    $service->credit($wallet, 20000.00, 'manual_credit', '1', 'Saldo awal');

    expect(fn () => $service->debit($wallet, 50000.00, 'purchase', '2', 'Beli buku'))
        ->toThrow(DomainConflictException::class);

    $wallet->refresh();
    expect((float) $wallet->balance)->toBe(20000.00);
});

it('locks out user after 3 consecutive wrong PIN attempts for 30 minutes', function () {
    $user = User::factory()->create();
    $service = app(WalletService::class);

    $service->setPin($user, '123456');

    // Attempt 1: wrong PIN
    expect(fn () => $service->verifyPin($user, '000000'))
        ->toThrow(DomainConflictException::class);
    $user->refresh();
    expect($user->pin_failed_attempts)->toBe(1);

    // Attempt 2: wrong PIN
    expect(fn () => $service->verifyPin($user, '000000'))
        ->toThrow(DomainConflictException::class);
    $user->refresh();
    expect($user->pin_failed_attempts)->toBe(2);

    // Attempt 3: wrong PIN -> locks out
    expect(fn () => $service->verifyPin($user, '000000'))
        ->toThrow(DomainConflictException::class);
    $user->refresh();
    expect($user->isPinLocked())->toBeTrue()
        ->and($user->pin_locked_until)->not->toBeNull();

    // 4th attempt immediately rejected as PIN_LOCKED
    expect(fn () => $service->verifyPin($user, '123456'))
        ->toThrow(DomainConflictException::class);
});
