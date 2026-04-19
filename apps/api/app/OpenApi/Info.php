<?php

namespace App\OpenApi;

use OpenApi\Attributes as OA;

#[OA\Info(
    version: '1.0.0',
    title: 'Edutech Platform API',
    description: 'API documentation for Edutech Platform - Bimbel & Tryout Platform',
    contact: new OA\Contact(
        name: 'Edutech Team',
        email: 'api@edutech.example.com'
    ),
    license: new OA\License(
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
    )
)]
#[OA\Server(
    url: '/api/v1',
    description: 'API v1'
)]
#[OA\SecurityScheme(
    securityScheme: 'bearerAuth',
    type: 'http',
    name: 'Authorization',
    in: 'header',
    scheme: 'bearer',
    bearerFormat: 'JWT'
)]
class Info
{
}

