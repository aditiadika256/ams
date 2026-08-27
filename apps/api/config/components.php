<?php

return [
    'media' => [
        'disk' => env('COMPONENT_MEDIA_DISK', 'component-media-local'),
        'max_kilobytes' => (int) env('COMPONENT_MEDIA_MAX_KILOBYTES', 102400),
        'allowed_extensions' => [
            'pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'csv', 'txt',
            'jpg', 'jpeg', 'png', 'webp', 'gif', 'mp3', 'm4a', 'wav', 'mp4', 'webm',
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
