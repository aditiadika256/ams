'use client';

import { apiClient } from '@/lib/api';
import { LookupMasterView } from '@/components/admin/views/ProgramMaster/LookupMasterView';
import type { ProgramMasterResourceConfig } from '@/components/admin/views/ProgramMaster/LookupMasterView';

const config: ProgramMasterResourceConfig = {
  title: 'Master Jenjang / Level',
  description:
    'Kelola jenjang yang tersedia sebagai pilihan pada data Program.',
  singularLabel: 'Jenjang',
  pluralLabel: 'jenjang',
  api: apiClient.admin.programLevels,
};

export default function ProgramLevelsView() {
  return <LookupMasterView config={config} />;
}
