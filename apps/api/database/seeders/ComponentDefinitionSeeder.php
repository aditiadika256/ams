<?php

namespace Database\Seeders;

use App\Enums\ComponentHandlerTemplate;
use App\Models\ComponentDefinition;
use Illuminate\Database\Seeder;

class ComponentDefinitionSeeder extends Seeder
{
    public function run(): void
    {
        $definitions = [
            ['code' => 'material', 'name' => 'Material', 'description' => 'Materi belajar terstruktur.', 'template' => ComponentHandlerTemplate::Native, 'key' => 'material', 'available' => true, 'icon' => 'BookOpen'],
            ['code' => 'video', 'name' => 'Video', 'description' => 'Video on-demand dan rekaman.', 'template' => ComponentHandlerTemplate::Video, 'key' => null, 'available' => true, 'icon' => 'Video'],
            ['code' => 'meeting', 'name' => 'Meeting', 'description' => 'Pertemuan online atau offline.', 'template' => ComponentHandlerTemplate::Native, 'key' => 'meeting', 'available' => true, 'icon' => 'CalendarDays'],
            ['code' => 'attendance', 'name' => 'Attendance', 'description' => 'Presensi manual.', 'template' => ComponentHandlerTemplate::Native, 'key' => 'attendance', 'available' => false, 'icon' => 'ClipboardCheck'],
            ['code' => 'qr_attendance', 'name' => 'QR Attendance', 'description' => 'Presensi menggunakan QR.', 'template' => ComponentHandlerTemplate::Native, 'key' => 'qr_attendance', 'available' => false, 'icon' => 'QrCode'],
            ['code' => 'assessment', 'name' => 'Assessment', 'description' => 'Tryout, kuis, atau ujian.', 'template' => ComponentHandlerTemplate::Native, 'key' => 'assessment', 'available' => true, 'icon' => 'FileCheck2'],
            ['code' => 'assignment', 'name' => 'Assignment', 'description' => 'Tugas dan submission.', 'template' => ComponentHandlerTemplate::Native, 'key' => 'assignment', 'available' => false, 'icon' => 'NotebookPen'],
            ['code' => 'certificate', 'name' => 'Certificate', 'description' => 'Penerbitan sertifikat.', 'template' => ComponentHandlerTemplate::Native, 'key' => 'certificate', 'available' => true, 'icon' => 'Award'],
            ['code' => 'discussion', 'name' => 'Discussion', 'description' => 'Forum diskusi Program.', 'template' => ComponentHandlerTemplate::Native, 'key' => 'discussion', 'available' => false, 'icon' => 'MessagesSquare'],
            ['code' => 'download', 'name' => 'Download', 'description' => 'File unduhan privat.', 'template' => ComponentHandlerTemplate::FileDownload, 'key' => null, 'available' => true, 'icon' => 'FolderDown'],
            ['code' => 'shipping', 'name' => 'Shipping', 'description' => 'Pemenuhan produk fisik.', 'template' => ComponentHandlerTemplate::Native, 'key' => 'shipping', 'available' => false, 'icon' => 'Package'],
            ['code' => 'consultation', 'name' => 'Consultation', 'description' => 'Konsultasi terjadwal.', 'template' => ComponentHandlerTemplate::Native, 'key' => 'consultation', 'available' => false, 'icon' => 'MessagesSquare'],
            ['code' => 'ai_tutor', 'name' => 'AI Tutor', 'description' => 'Pendamping belajar berbasis AI.', 'template' => ComponentHandlerTemplate::Native, 'key' => 'ai_tutor', 'available' => false, 'icon' => 'Bot'],
            ['code' => 'live_chat', 'name' => 'Live Chat', 'description' => 'Percakapan langsung.', 'template' => ComponentHandlerTemplate::Native, 'key' => 'live_chat', 'available' => false, 'icon' => 'MessageCircle'],
        ];

        foreach ($definitions as $index => $definition) {
            $model = ComponentDefinition::withTrashed()->firstOrNew(['code' => $definition['code']]);

            if (! $model->exists) {
                $model->fill([
                    'name' => $definition['name'],
                    'description' => $definition['description'],
                    'sort_order' => $index + 1,
                ]);
            }

            $model->fill([
                'handler_template' => $definition['template'],
                'handler_key' => $definition['key'],
                'icon' => $model->icon ?? $definition['icon'],
                'config_schema' => $this->schemaFor($definition['code']),
                'is_system' => true,
                'is_available' => $definition['available'],
            ]);
            $model->deleted_at = null;
            $model->save();
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
