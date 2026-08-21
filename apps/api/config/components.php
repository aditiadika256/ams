<?php

return [
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
