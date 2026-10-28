<?php

namespace App\Providers;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Model::preventLazyLoading(! app()->isProduction());

        Gate::before(function ($user, $ability) {
            if ($user->hasRole(['superadmin', 'super_admin', 'direktur'])
                || $user->hasRole('superadmin', 'web')
                || $user->hasRole('superadmin', 'sanctum')) {
                return true;
            }

            return null;
        });

        \App\Models\Menu::observe(\App\Observers\MenuObserver::class);
    }
}
