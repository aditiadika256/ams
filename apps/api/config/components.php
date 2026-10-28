<?php

return [
    'media' => [
        'disk' => env('COMPONENT_MEDIA_DISK', 'component-media-local'),
        'max_kilobytes' => (int) env('COMPONENT_MEDIA_MAX_KILOBYTES', 102400),
        'allowed_extensions' => [
            'pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'csv', 'txt',
            'jpg', 'jpeg', 'png', 'webp', 'gif', 'mp3', 'm4a', 'wav', 'mp4', 'webm',
        ],
        'cloudflare' => [
            'enabled' => (bool) env('CLOUDFLARE_R2_ENABLED', false),
            'account_id' => env('CLOUDFLARE_R2_ACCOUNT_ID', '13186a6d991d58c1204634129a35ea3c'),
            'endpoint' => env('CLOUDFLARE_R2_ENDPOINT', 'https://13186a6d991d58c1204634129a35ea3c.r2.cloudflarestorage.com'),
            'region' => env('CLOUDFLARE_R2_REGION', 'auto'),
            'public_bucket' => env('CLOUDFLARE_R2_PUBLIC_BUCKET', 'public-files'),
            'public_url' => env('CLOUDFLARE_R2_PUBLIC_URL', 'https://pub-043d267920b64ff7b8d21410e443f7ee.r2.dev'),
            'private_bucket' => env('CLOUDFLARE_R2_PRIVATE_BUCKET', 'private-files'),
            'private_url' => env('CLOUDFLARE_R2_PRIVATE_URL', 'https://13186a6d991d58c1204634129a35ea3c.r2.cloudflarestorage.com/private-files'),
            'cdn_url' => env('CLOUDFLARE_CDN_URL', env('CLOUDFLARE_R2_PUBLIC_URL', 'https://pub-043d267920b64ff7b8d21410e443f7ee.r2.dev')),
            'disk' => env('CLOUDFLARE_R2_DISK', 'cloudflare-r2-private'),
            'public_disk' => env('CLOUDFLARE_R2_PUBLIC_DISK', 'cloudflare-r2-public'),
            'private_disk' => env('CLOUDFLARE_R2_PRIVATE_DISK', 'cloudflare-r2-private'),
        ],
    ],
    'content' => [
        'max_payload_bytes' => (int) env('COMPONENT_CONTENT_MAX_PAYLOAD_BYTES', 65536),
        'max_payload_depth' => (int) env('COMPONENT_CONTENT_MAX_PAYLOAD_DEPTH', 8),
        'max_form_fields' => (int) env('COMPONENT_FORM_MAX_FIELDS', 50),
    ],
    'iframe_allowed_hosts' => array_values(array_filter(array_map(
        'trim',
        explode(',', (string) env('COMPONENT_IFRAME_ALLOWED_HOSTS', '')),
    ))),
];
