<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
| API routes loaded by the RouteServiceProvider within the "api" middleware group.
*/

Route::prefix('v1')->group(function () {
    // auth
    Route::post('auth/login', [\App\Domain\Auth\AuthController::class, 'login']);
    Route::post('auth/logout', [\App\Domain\Auth\AuthController::class, 'logout'])->middleware('auth:sanctum');
    Route::get('auth/me', [\App\Domain\Auth\AuthController::class, 'me'])->middleware('auth:sanctum');

    // placeholder for other domain routes (will be included later)
});
