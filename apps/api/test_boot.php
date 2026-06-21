<?php
require 'vendor/autoload.php';
try {
    $app = require_once 'bootstrap/app.php';
    echo "Bootstrapped App successfully!\n";
    $kernel = $app->make(\Illuminate\Contracts\Console\Kernel::class);
    $status = $kernel->handle(new \Symfony\Component\Console\Input\ArgvInput(['artisan', 'package:discover']), new \Symfony\Component\Console\Output\ConsoleOutput());
    echo "Kernel handle returned: " . $status . "\n";
} catch (\Throwable $e) {
    echo "FATAL ERROR: " . $e->getMessage() . "\n";
}
