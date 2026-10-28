<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Default Filesystem Disk
    |--------------------------------------------------------------------------
    |
    | Here you may specify the default filesystem disk that should be used
    | by the framework. The "local" disk, as well as a variety of cloud
    | based disks are available to your application for file storage.
    |
    */

    'default' => env('FILESYSTEM_DISK', 'local'),

    /*
    |--------------------------------------------------------------------------
    | Filesystem Disks
    |--------------------------------------------------------------------------
    |
    | Below you may configure as many filesystem disks as necessary, and you
    | may even configure multiple disks for the same driver. Examples for
    | most supported storage drivers are configured here for reference.
    |
    | Supported drivers: "local", "ftp", "sftp", "s3"
    |
    */

    'disks' => [

        'local' => [
            'driver' => 'local',
            'root' => storage_path('app/private'),
            'serve' => true,
            'throw' => false,
            'report' => false,
        ],

        'public' => [
            'driver' => 'local',
            'root' => storage_path('app/public'),
            'url' => env('APP_URL').'/storage',
            'visibility' => 'public',
            'throw' => false,
            'report' => false,
        ],

        's3' => [
            'driver' => 's3',
            'key' => env('AWS_ACCESS_KEY_ID'),
            'secret' => env('AWS_SECRET_ACCESS_KEY'),
            'region' => env('AWS_DEFAULT_REGION'),
            'bucket' => env('AWS_BUCKET'),
            'url' => env('AWS_URL'),
            'endpoint' => env('AWS_ENDPOINT'),
            'use_path_style_endpoint' => env('AWS_USE_PATH_STYLE_ENDPOINT', false),
            'throw' => false,
            'report' => false,
        ],

        'component-media-local' => [
            'driver' => 'local',
            'root' => storage_path('app/private/components'),
            'visibility' => 'private',
            'throw' => true,
            'report' => true,
        ],

        'component-media-s3' => [
            'driver' => 's3',
            'key' => env('COMPONENT_MEDIA_ACCESS_KEY_ID', env('AWS_ACCESS_KEY_ID')),
            'secret' => env('COMPONENT_MEDIA_SECRET_ACCESS_KEY', env('AWS_SECRET_ACCESS_KEY')),
            'region' => env('COMPONENT_MEDIA_REGION', env('AWS_DEFAULT_REGION', 'us-east-1')),
            'bucket' => env('COMPONENT_MEDIA_BUCKET', env('AWS_BUCKET')),
            'endpoint' => env('COMPONENT_MEDIA_ENDPOINT', env('AWS_ENDPOINT')),
            'use_path_style_endpoint' => env('COMPONENT_MEDIA_PATH_STYLE', env('AWS_USE_PATH_STYLE_ENDPOINT', false)),
            'visibility' => 'private',
            'throw' => true,
            'report' => true,
        ],

        'cloudflare-r2-public' => [
            'driver' => 's3',
            'key' => env('CLOUDFLARE_R2_ACCESS_KEY_ID', env('AWS_ACCESS_KEY_ID')),
            'secret' => env('CLOUDFLARE_R2_SECRET_ACCESS_KEY', env('AWS_SECRET_ACCESS_KEY')),
            'region' => env('CLOUDFLARE_R2_REGION', 'auto'),
            'bucket' => env('CLOUDFLARE_R2_PUBLIC_BUCKET', 'public-files'),
            'url' => env('CLOUDFLARE_R2_PUBLIC_URL', 'https://pub-043d267920b64ff7b8d21410e443f7ee.r2.dev'),
            'endpoint' => env('CLOUDFLARE_R2_ENDPOINT', 'https://13186a6d991d58c1204634129a35ea3c.r2.cloudflarestorage.com'),
            'use_path_style_endpoint' => env('CLOUDFLARE_R2_PATH_STYLE', false),
            'visibility' => 'public',
            'throw' => true,
            'report' => true,
        ],

        'cloudflare-r2-private' => [
            'driver' => 's3',
            'key' => env('CLOUDFLARE_R2_ACCESS_KEY_ID', env('AWS_ACCESS_KEY_ID')),
            'secret' => env('CLOUDFLARE_R2_SECRET_ACCESS_KEY', env('AWS_SECRET_ACCESS_KEY')),
            'region' => env('CLOUDFLARE_R2_REGION', 'auto'),
            'bucket' => env('CLOUDFLARE_R2_PRIVATE_BUCKET', 'private-files'),
            'url' => env('CLOUDFLARE_R2_PRIVATE_URL'),
            'endpoint' => env('CLOUDFLARE_R2_ENDPOINT', 'https://13186a6d991d58c1204634129a35ea3c.r2.cloudflarestorage.com'),
            'use_path_style_endpoint' => env('CLOUDFLARE_R2_PATH_STYLE', false),
            'visibility' => 'private',
            'throw' => true,
            'report' => true,
        ],

        'cloudflare-r2' => [
            'driver' => 's3',
            'key' => env('CLOUDFLARE_R2_ACCESS_KEY_ID', env('AWS_ACCESS_KEY_ID')),
            'secret' => env('CLOUDFLARE_R2_SECRET_ACCESS_KEY', env('AWS_SECRET_ACCESS_KEY')),
            'region' => env('CLOUDFLARE_R2_REGION', 'auto'),
            'bucket' => env('CLOUDFLARE_R2_BUCKET', env('CLOUDFLARE_R2_PRIVATE_BUCKET', 'private-files')),
            'url' => env('CLOUDFLARE_CDN_URL'),
            'endpoint' => env('CLOUDFLARE_R2_ENDPOINT', 'https://13186a6d991d58c1204634129a35ea3c.r2.cloudflarestorage.com'),
            'use_path_style_endpoint' => env('CLOUDFLARE_R2_PATH_STYLE', false),
            'visibility' => 'private',
            'throw' => true,
            'report' => true,
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Symbolic Links
    |--------------------------------------------------------------------------
    |
    | Here you may configure the symbolic links that will be created when the
    | `storage:link` Artisan command is executed. The array keys should be
    | the locations of the links and the values should be their targets.
    |
    */

    'links' => [
        public_path('storage') => storage_path('app/public'),
    ],

];
