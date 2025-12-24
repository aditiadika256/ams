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
    Route::post('auth/login', [\App\Domain\Auth\AuthController::class, 'login']);
    Route::post('auth/logout', [\App\Domain\Auth\AuthController::class, 'logout'])->middleware('auth:sanctum');
    Route::get('auth/me', [\App\Domain\Auth\AuthController::class, 'me'])->middleware('auth:sanctum');

    // Programs
    Route::get('programs', [\App\Domain\Sales\ProgramController::class, 'index']);
    Route::get('programs/{program}', [\App\Domain\Sales\ProgramController::class, 'show']);
    Route::post('programs', [\App\Domain\Sales\ProgramController::class, 'store'])->middleware('auth:sanctum');
    Route::put('programs/{program}', [\App\Domain\Sales\ProgramController::class, 'update'])->middleware('auth:sanctum');
    Route::delete('programs/{program}', [\App\Domain\Sales\ProgramController::class, 'destroy'])->middleware('auth:sanctum');

    // Orders
    Route::get('orders', [\App\Domain\Sales\OrderController::class, 'index'])->middleware('auth:sanctum');
    Route::get('orders/{order}', [\App\Domain\Sales\OrderController::class, 'show'])->middleware('auth:sanctum');
    Route::post('orders', [\App\Domain\Sales\OrderController::class, 'store'])->middleware('auth:sanctum');

    // Payments
    Route::post('payments/webhook', [\App\Domain\Sales\PaymentWebhookController::class, 'handle']);

    // CBT
    Route::get('exams/packages', [\App\Domain\CBT\ExamController::class, 'index'])->middleware('auth:sanctum');
    Route::get('exams/packages/{id}', [\App\Domain\CBT\ExamController::class, 'show'])->middleware('auth:sanctum');
    Route::post('exams/start', [\App\Domain\CBT\ExamController::class, 'start'])->middleware('auth:sanctum');
    Route::get('exams/{attempt}/questions', [\App\Domain\CBT\ExamController::class, 'getQuestions'])->middleware('auth:sanctum');
    Route::post('exams/{attempt}/answers', [\App\Domain\CBT\ExamController::class, 'saveAnswer'])->middleware('auth:sanctum');
    Route::post('exams/{attempt}/submit', [\App\Domain\CBT\ExamController::class, 'submit'])->middleware('auth:sanctum');
    Route::get('exams/{attempt}/result', [\App\Domain\CBT\ExamController::class, 'getResult'])->middleware('auth:sanctum');
    
    // Proctoring
    Route::post('exams/{attempt}/log', [\App\Domain\CBT\ProctorController::class, 'logEvent'])->middleware('auth:sanctum');
    Route::post('exams/{attempt}/heartbeat', [\App\Domain\CBT\ProctorController::class, 'heartbeat'])->middleware('auth:sanctum');
});
