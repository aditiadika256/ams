<?php

namespace App\Traits;

use App\Models\Branch;
use App\Scopes\BranchScope;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Auth;

trait HasBranchScope
{
    public static function bootHasBranchScope(): void
    {
        static::addGlobalScope(new BranchScope);

        static::creating(function ($model) {
            if (! $model->branch_id && Auth::check() && Auth::user()->branch_id) {
                $model->branch_id = Auth::user()->branch_id;
            }
        });
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }
}
