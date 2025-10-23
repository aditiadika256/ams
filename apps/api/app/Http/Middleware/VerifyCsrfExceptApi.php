<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken as Middleware;

class VerifyCsrfExceptApi extends Middleware
{
    protected $except = [
        'api/*',
    ];
}
