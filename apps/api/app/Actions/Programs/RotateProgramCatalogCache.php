<?php

namespace App\Actions\Programs;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class RotateProgramCatalogCache
{
    public function handle(): void
    {
        Cache::forever('programs:cache_version', (string) Str::uuid());
    }
}
