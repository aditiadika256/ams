'use client';

import { apiClient } from '@/lib/api';
import { LookupMasterView } from '@/components/admin/views/ProgramMaster/LookupMasterView';
import type { ProgramMasterResourceConfig } from '@/components/admin/views/ProgramMaster/LookupMasterView';

const config: ProgramMasterResourceConfig = {
  title: 'Master Tipe Program',
  description:
    'Kelola tipe yang tersedia sebagai pilihan pada data Program.',
  singularLabel: 'Tipe Program',
  pluralLabel: 'tipe program',
  api: apiClient.admin.programTypes,
};

export default function ProgramTypesView() {
  return <LookupMasterView config={config} />;
}
