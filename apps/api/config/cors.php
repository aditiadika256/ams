<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie', 'login', 'logout'],

    'allowed_methods' => ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],

    'allowed_origins' => ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000', 'https://ams-nine-pi.vercel.app/', 'https://ams-lc58.onrender.com/'],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['Content-Type', 'Authorization', 'X-Requested-With', 'X-CSRF-TOKEN', 'Accept', 'Origin'],

    'exposed_headers' => ['Authorization'],

    'max_age' => 86400,

    'supports_credentials' => false,
];
