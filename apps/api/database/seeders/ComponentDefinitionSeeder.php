<?php

namespace Database\Seeders;

use App\Models\ComponentDefinition;
use Illuminate\Database\Seeder;

class ComponentDefinitionSeeder extends Seeder
{
    public function run(): void
    {
        $definitions = [
            ['code' => 'material', 'name' => 'Material', 'description' => 'Materi belajar terstruktur.'],
            ['code' => 'video', 'name' => 'Video', 'description' => 'Video on-demand dan rekaman.'],
            ['code' => 'meeting', 'name' => 'Meeting', 'description' => 'Pertemuan online atau offline.'],
            ['code' => 'attendance', 'name' => 'Attendance', 'description' => 'Presensi manual.'],
            ['code' => 'qr_attendance', 'name' => 'QR Attendance', 'description' => 'Presensi menggunakan QR.'],
            ['code' => 'assessment', 'name' => 'Assessment', 'description' => 'Tryout, kuis, atau ujian.'],
            ['code' => 'assignment', 'name' => 'Assignment', 'description' => 'Tugas dan submission.'],
            ['code' => 'certificate', 'name' => 'Certificate', 'description' => 'Penerbitan sertifikat.'],
            ['code' => 'discussion', 'name' => 'Discussion', 'description' => 'Forum diskusi Program.'],
            ['code' => 'download', 'name' => 'Download', 'description' => 'File unduhan privat.'],
            ['code' => 'shipping', 'name' => 'Shipping', 'description' => 'Pemenuhan produk fisik.'],
            ['code' => 'consultation', 'name' => 'Consultation', 'description' => 'Konsultasi terjadwal.'],
            ['code' => 'ai_tutor', 'name' => 'AI Tutor', 'description' => 'Pendamping belajar berbasis AI.'],
            ['code' => 'live_chat', 'name' => 'Live Chat', 'description' => 'Percakapan langsung.'],
        ];

        foreach ($definitions as $index => $definition) {
            ComponentDefinition::query()->updateOrCreate(
                ['code' => $definition['code']],
                [
                    'name' => $definition['name'],
                    'description' => $definition['description'],
                    'config_schema' => $this->schemaFor($definition['code']),
                    'is_available' => true,
                    'sort_order' => $index + 1,
                ]
            );
        }
    }

    private function schemaFor(string $code): array
    {
        return match ($code) {
            'attendance' => ['dependencies' => ['any' => ['meeting', 'sessions']]],
            'qr_attendance' => ['dependencies' => ['all' => ['attendance']]],
            'certificate' => ['requires_completion_rule' => true],
            'shipping' => ['properties' => ['requires_address' => ['type' => 'boolean']]],
            'consultation' => ['dependencies' => ['any' => ['sessions']]],
            default => ['properties' => []],
        };
    }
}
