<?php

namespace Database\Seeders;

use App\Models\ColorPalette;
use Illuminate\Database\Seeder;

class ColorPaletteSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create default color palette - matches light mode from globals.css :root
        ColorPalette::create([
            'name' => 'Default Blue',
            'is_default' => true,
            'primary' => '#5b61f5',                  // HSL(243.8, 90.5%, 58.2%)
            'secondary' => '#eaf2fd',                // HSL(210, 40%, 96.1%)
            'destructive' => '#f93a3a',              // HSL(0, 84.2%, 60.2%)
            'muted' => '#b0b9d1',                    // Gray
            'accent' => '#06b6d4',                   // Cyan
            'foreground' => '#0f1419',               // HSL(222.2, 84%, 4.9%)
            'background' => '#f5fafd',               // HSL(210, 40%, 98%)
            'card' => '#ffffff',                     // HSL(0, 0%, 100%)
            'card_foreground' => '#0f1419',          // Match foreground
            'popover' => '#ffffff',                  // White
            'popover_foreground' => '#0f1419',       // Match foreground
            'border' => '#dce5ed',                   // HSL(214.3, 31.8%, 91.4%)
            'input' => '#dce5ed',                    // HSL(214.3, 31.8%, 91.4%)
            'ring' => '#5b61f5',                     // HSL(243.8, 90.5%, 58.2%) - same as primary
            'chart_one' => '#5b61f5',                // Primary
            'chart_two' => '#a855f7',                // Purple
            'chart_three' => '#ec4899',              // Pink
            'chart_four' => '#f59e0b',               // Amber
            'chart_five' => '#10b981',               // Emerald
        ]);

        // Create dark mode palette - matches dark mode from globals.css .dark
        ColorPalette::create([
            'name' => 'Dark Mode',
            'is_default' => false,
            'primary' => '#a855f7',                  // HSL(263.4, 70%, 50.4%)
            'secondary' => '#1e293b',                // HSL(217.2, 32.6%, 17.5%)
            'destructive' => '#ef4444',              // Keep light for dark bg
            'muted' => '#475569',                    // Slate gray
            'accent' => '#22d3ee',                   // Cyan
            'foreground' => '#f5fafd',               // HSL(210, 40%, 98%)
            'background' => '#0f1419',               // HSL(224, 71%, 4%)
            'card' => '#0f1419',                     // HSL(222.2, 84%, 4.9%)
            'card_foreground' => '#f5fafd',          // Light foreground
            'popover' => '#0f1419',                  // Dark background
            'popover_foreground' => '#f5fafd',       // Light foreground
            'border' => '#1e293b',                   // HSL(217.2, 32.6%, 17.5%)
            'input' => '#1e293b',                    // Dark input
            'ring' => '#a855f7',                     // HSL(263.4, 70%, 50.4%) - same as primary
            'chart_one' => '#a855f7',                // Primary
            'chart_two' => '#60a5fa',                // Light blue
            'chart_three' => '#f472b6',              // Light pink
            'chart_four' => '#fbbf24',               // Light amber
            'chart_five' => '#34d399',               // Light emerald
        ]);
    }
}
