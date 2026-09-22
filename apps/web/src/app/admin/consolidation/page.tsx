'use client';

import React, { useEffect } from 'react';
import { useAdminStore } from '@/store/useAdminStore';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminLayout from '@/components/admin/layout/AdminLayout';

export default function AmsConsolidationPage() {
  const addTab = useAdminStore((state) => state.addTab);

  useEffect(() => {
    addTab({
      title: 'Konsolidasi Cabang (AMS)',
      view: 'consolidation',
      icon: 'Network',
    });
  }, [addTab]);

  return (
    <ProtectedRoute>
      <AdminLayout />
    </ProtectedRoute>
  );
}
