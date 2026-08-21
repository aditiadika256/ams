<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
| API routes loaded by the RouteServiceProvider within the "api" middleware group.
*/

Route::prefix('v1')->group(function () {
    Route::post('auth/register', [\App\Domain\Auth\AuthController::class, 'register'])->middleware('throttle:10,1');
    Route::post('auth/login', [\App\Domain\Auth\AuthController::class, 'login'])->middleware('throttle:10,1');
    Route::post('auth/logout', [\App\Domain\Auth\AuthController::class, 'logout'])->middleware('auth:sanctum');
    Route::get('auth/me', [\App\Domain\Auth\AuthController::class, 'me'])->middleware('auth:sanctum');
    Route::get('auth/google', [\App\Domain\Auth\AuthController::class, 'googleRedirect']);
    Route::get('auth/google/callback', [\App\Domain\Auth\AuthController::class, 'googleCallback']);

    // Programs
    Route::get('programs', [\App\Domain\Sales\ProgramController::class, 'index']);
    Route::get('programs/{program}', [\App\Domain\Sales\ProgramController::class, 'show']);

    // Orders
    Route::get('orders', [\App\Domain\Sales\OrderController::class, 'index'])->middleware('auth:sanctum');
    Route::get('orders/{order}', [\App\Domain\Sales\OrderController::class, 'show'])->middleware('auth:sanctum');
    Route::post('orders', [\App\Domain\Sales\OrderController::class, 'store'])->middleware('auth:sanctum');

    // Payments
    Route::post('payments/webhook', [\App\Domain\Sales\PaymentWebhookController::class, 'handle']);

    // Access acquisition
    Route::prefix('access')->middleware('auth:sanctum')->group(function () {
        Route::post('free-enrollments', [\App\Domain\Access\FreeEnrollmentController::class, 'store']);
        Route::post('redeem-voucher', [\App\Domain\Access\CodeRedemptionController::class, 'voucher']);
        Route::post('redeem-enrollment-code', [\App\Domain\Access\CodeRedemptionController::class, 'enrollment']);
    });

    Route::prefix('workspace')->middleware('auth:sanctum')->group(function () {
        Route::get('/', [\App\Domain\Workspace\WorkspaceController::class, 'index']);
        Route::get('accesses/{programAccess}', [\App\Domain\Workspace\WorkspaceController::class, 'show']);
        Route::post('accesses/{programAccess}/archive', [\App\Domain\Workspace\WorkspaceController::class, 'archive']);
        Route::post('accesses/{programAccess}/restore', [\App\Domain\Workspace\WorkspaceController::class, 'restore']);
        Route::get('accesses/{programAccess}/curriculum', \App\Domain\Workspace\WorkspaceCurriculumController::class);
        Route::post('accesses/{programAccess}/lessons/{lesson}/complete', [\App\Domain\Workspace\WorkspaceActivityController::class, 'completeLesson']);
        Route::get('accesses/{programAccess}/media-assets/{mediaAsset}', [\App\Domain\Workspace\WorkspaceMediaController::class, 'show']);
        Route::post('accesses/{programAccess}/sessions/{session}/mentor-reservations', [\App\Domain\Workspace\WorkspaceMentorReservationController::class, 'store']);
        Route::get('session-updates', [\App\Domain\Workspace\WorkspaceSessionUpdateController::class, 'index']);
        Route::post('session-updates/{sessionUpdate}/acknowledge', [\App\Domain\Workspace\WorkspaceSessionUpdateController::class, 'acknowledge']);
    });

    Route::get('mentor/sessions/{session}/participants', \App\Domain\Learning\MentorSessionParticipantController::class)
        ->middleware('auth:sanctum');

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

    // CMS
    Route::prefix('cms')->middleware(['auth:sanctum', 'permission:manage_global_settings'])->group(function () {
        Route::apiResource('posts', \App\Domain\CMS\PostController::class);
        Route::apiResource('pages', \App\Domain\CMS\PageController::class);
    });

    // Public Menus
    Route::get('menus', [\App\Domain\System\MenuController::class, 'index']);

    // Theme & Settings (public for frontend)
    Route::prefix('theme')->group(function () {
        Route::get('palettes/active', [\App\Domain\System\ColorPaletteController::class, 'active']);
    });

    // Admin
    Route::prefix('admin')->middleware(['auth:sanctum'])->group(function () {
        Route::get('mentor-options', [\App\Domain\Admin\SessionMentorAssignmentController::class, 'options']);
        Route::post('program-accesses/grant', [\App\Domain\Admin\ProgramAccessController::class, 'grant']);
        Route::post('program-accesses/{programAccess}/activate', [\App\Domain\Admin\ProgramAccessController::class, 'activate']);
        Route::post('program-accesses/{programAccess}/suspend', [\App\Domain\Admin\ProgramAccessController::class, 'suspend']);
        Route::post('program-accesses/{programAccess}/restore', [\App\Domain\Admin\ProgramAccessController::class, 'restore']);
        Route::post('program-accesses/{programAccess}/revoke', [\App\Domain\Admin\ProgramAccessController::class, 'revoke']);
        Route::post('program-accesses/{programAccess}/extend', [\App\Domain\Admin\ProgramAccessController::class, 'extend']);
        Route::apiResource('tags', \App\Domain\Admin\TagController::class);
        Route::post('component-definitions/{componentDefinition}/restore', [\App\Domain\Admin\ComponentDefinitionController::class, 'restore'])
            ->withTrashed();
        Route::delete('component-definitions/{componentDefinition}/force', [\App\Domain\Admin\ComponentDefinitionController::class, 'forceDelete'])
            ->withTrashed();
        Route::apiResource('component-definitions', \App\Domain\Admin\ComponentDefinitionController::class)
            ->parameters(['component-definitions' => 'componentDefinition']);
        Route::post('programs/{program}/media-assets', [\App\Domain\Admin\MediaAssetController::class, 'store']);
        Route::scopeBindings()->delete('programs/{program}/media-assets/{mediaAsset}', [\App\Domain\Admin\MediaAssetController::class, 'destroy']);
        Route::put('programs/{program}/tags', [\App\Domain\Admin\ProgramTagController::class, 'update']);
        Route::put('programs/{program}/components', [\App\Domain\Admin\ProgramComponentController::class, 'update']);
        Route::scopeBindings()->group(function () {
            Route::post('programs/{program}/components/{programComponent}/contents/{content}/restore', [\App\Domain\Admin\ProgramComponentContentController::class, 'restore'])
                ->withTrashed();
            Route::apiResource('programs.components.contents', \App\Domain\Admin\ProgramComponentContentController::class)
                ->parameters([
                    'programs' => 'program',
                    'components' => 'programComponent',
                    'contents' => 'content',
                ]);
        });
        Route::put('programs/{program}/relations', [\App\Domain\Admin\ProgramRelationController::class, 'update']);
        Route::scopeBindings()->group(function () {
            Route::get('programs/{program}/batches', [\App\Domain\Admin\ProgramBatchController::class, 'index']);
            Route::post('programs/{program}/batches', [\App\Domain\Admin\ProgramBatchController::class, 'store']);
            Route::get('programs/{program}/batches/{batch}', [\App\Domain\Admin\ProgramBatchController::class, 'show']);
            Route::put('programs/{program}/batches/{batch}', [\App\Domain\Admin\ProgramBatchController::class, 'update']);
            Route::delete('programs/{program}/batches/{batch}', [\App\Domain\Admin\ProgramBatchController::class, 'destroy']);
            Route::post('programs/{program}/batches/{batch}/transition', [\App\Domain\Admin\ProgramBatchController::class, 'transition']);

            Route::get('programs/{program}/batches/{batch}/sessions', [\App\Domain\Admin\ProgramSessionController::class, 'index']);
            Route::post('programs/{program}/batches/{batch}/sessions', [\App\Domain\Admin\ProgramSessionController::class, 'store']);
            Route::get('programs/{program}/batches/{batch}/sessions/{session}', [\App\Domain\Admin\ProgramSessionController::class, 'show']);
            Route::put('programs/{program}/batches/{batch}/sessions/{session}', [\App\Domain\Admin\ProgramSessionController::class, 'update']);
            Route::delete('programs/{program}/batches/{batch}/sessions/{session}', [\App\Domain\Admin\ProgramSessionController::class, 'destroy']);
            Route::post('programs/{program}/batches/{batch}/sessions/{session}/transition', [\App\Domain\Admin\ProgramSessionController::class, 'transition']);

            Route::post('programs/{program}/batches/{batch}/sessions/{session}/mentor-assignments', [\App\Domain\Admin\SessionMentorAssignmentController::class, 'store']);
            Route::delete('programs/{program}/batches/{batch}/sessions/{session}/mentor-assignments/{mentorAssignment}', [\App\Domain\Admin\SessionMentorAssignmentController::class, 'destroy']);
        });
        Route::post('programs/{program}/publish', [\App\Domain\Admin\ProgramController::class, 'publish']);
        Route::post('programs/{program}/unpublish', [\App\Domain\Admin\ProgramController::class, 'unpublish']);
        Route::post('programs/{program}/archive', [\App\Domain\Admin\ProgramController::class, 'archive']);
        Route::post('programs/{program}/restore', [\App\Domain\Admin\ProgramController::class, 'restore']);
        Route::post('programs/{program}/clone', [\App\Domain\Admin\ProgramController::class, 'clone']);
        Route::apiResource('programs', \App\Domain\Admin\ProgramController::class);

        // Users & Roles
        Route::get('branches', [\App\Domain\Admin\UserController::class, 'branches']);
        Route::apiResource('users', \App\Domain\Admin\UserController::class)->middleware('permission:manage_users_global|manage_users_branch');
        Route::apiResource('roles', \App\Domain\Admin\RoleController::class)->middleware('permission:manage_roles');
        Route::get('permissions', [\App\Domain\Admin\RoleController::class, 'permissions'])->middleware('permission:view_permissions');

        // Dashboard
        Route::get('dashboard/stats', [\App\Domain\Admin\DashboardController::class, 'stats'])->middleware('permission:view_dashboard_admin|view_dashboard_finance|view_dashboard_learning');

        // Menu Management
        Route::apiResource('menus', \App\Domain\Admin\MenuController::class)->middleware('permission:manage_menus');

        // Color Palette Management
        Route::prefix('theme')->middleware('permission:manage_global_settings')->group(function () {
            Route::get('palettes', [\App\Domain\System\ColorPaletteController::class, 'index']);
            Route::post('palettes', [\App\Domain\System\ColorPaletteController::class, 'store']);
            Route::get('palettes/{id}', [\App\Domain\System\ColorPaletteController::class, 'show']);
            Route::put('palettes/{id}', [\App\Domain\System\ColorPaletteController::class, 'update']);
            Route::post('palettes/{id}/default', [\App\Domain\System\ColorPaletteController::class, 'setDefault']);
            Route::delete('palettes/{id}', [\App\Domain\System\ColorPaletteController::class, 'destroy']);
        });
    });

    // Learning
    Route::prefix('learning')->middleware(['auth:sanctum', 'permission:view_dashboard_learning|manage_learning_content|program-content.view|program-content.manage'])->group(function () {
        // Mentors
        Route::get('mentor-candidates', [\App\Domain\Learning\MentorController::class, 'candidates'])
            ->middleware('permission:manage_learning_content');
        Route::apiResource('mentors', \App\Domain\Learning\MentorController::class)
            ->only(['index', 'show']);
        Route::apiResource('mentors', \App\Domain\Learning\MentorController::class)
            ->only(['store', 'update', 'destroy'])
            ->middleware('permission:manage_learning_content');

        // Schedules
        Route::get('schedules', [\App\Domain\Learning\ScheduleController::class, 'studentSchedules']);
        Route::get('mentors/{mentor}/schedules', [\App\Domain\Learning\ScheduleController::class, 'index']);
        Route::post('mentors/{mentor}/schedules', [\App\Domain\Learning\ScheduleController::class, 'store']);
        Route::put('mentors/{mentor}/schedules/{schedule}', [\App\Domain\Learning\ScheduleController::class, 'update']);
        Route::delete('mentors/{mentor}/schedules/{schedule}', [\App\Domain\Learning\ScheduleController::class, 'destroy']);

        // Curriculum
        Route::get('programs/{program}/curriculum', [\App\Domain\Learning\CurriculumController::class, 'index']);

        // Modules
        Route::post('programs/{program}/modules', [\App\Domain\Learning\CurriculumController::class, 'storeModule'])->middleware('permission:program-content.manage');
        Route::put('modules/{module}', [\App\Domain\Learning\CurriculumController::class, 'updateModule'])->middleware('permission:program-content.manage');
        Route::delete('modules/{module}', [\App\Domain\Learning\CurriculumController::class, 'destroyModule'])->middleware('permission:program-content.manage');

        // Lessons
        Route::post('modules/{module}/lessons', [\App\Domain\Learning\CurriculumController::class, 'storeLesson'])->middleware('permission:program-content.manage');
        Route::put('lessons/{lesson}', [\App\Domain\Learning\CurriculumController::class, 'updateLesson'])->middleware('permission:program-content.manage');
        Route::delete('lessons/{lesson}', [\App\Domain\Learning\CurriculumController::class, 'destroyLesson'])->middleware('permission:program-content.manage');
    });

    // Finance
    Route::prefix('finance')->middleware(['auth:sanctum', 'permission:view_dashboard_finance|view_finance_reports|view_finance_analytics'])->group(function () {
        Route::apiResource('transactions', \App\Domain\Finance\TransactionController::class);
        Route::get('transactions/stats/summary', [\App\Domain\Finance\TransactionController::class, 'stats']);

        Route::apiResource('invoices', \App\Domain\Finance\InvoiceController::class);

        // Reports
        Route::get('reports/custom', [\App\Domain\Finance\ReportController::class, 'custom'])->middleware('permission:view_finance_reports');
        Route::get('revenue/daily', [\App\Domain\Finance\ReportController::class, 'dailyRevenue'])->middleware('permission:view_finance_reports');
        Route::get('revenue/summary', [\App\Domain\Finance\ReportController::class, 'summary'])->middleware('permission:view_finance_reports');
    });

    // Analytics
    Route::prefix('analytics')->middleware(['auth:sanctum', 'permission:view_student_progress|view_finance_analytics|view_dashboard_learning'])->group(function () {
        Route::get('exams/{id}', [\App\Domain\Analytics\AnalyticsController::class, 'examAnalytics']);
        Route::get('user/progress', [\App\Domain\Analytics\AnalyticsController::class, 'userProgress']);
        Route::get('user/performance', [\App\Domain\Analytics\AnalyticsController::class, 'performanceMetrics']);
        Route::get('recommendations', [\App\Domain\Analytics\AnalyticsController::class, 'recommendations']);
    });
});
