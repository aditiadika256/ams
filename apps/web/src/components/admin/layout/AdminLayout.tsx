'use client';

import React from 'react';
import { useAdminStore } from '@/store/useAdminStore';
import { useAuthStore } from '@/store/useAuthStore';
import { cn } from '@/lib/utils';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';

// View Imports
import DashboardView from '../views/DashboardView';
import UsersView from '../views/UsersView';
import FinanceView from '../views/FinanceView';
import CMSPostsView from '../views/CMSPostsView';
import MentorsView from '../views/MentorsView';
import ProgramsView from '../views/ProgramsView';
import CurriculumBuilderView from '../views/CurriculumBuilderView';

const ViewMap: Record<string, React.ComponentType<any>> = {
  'dashboard': DashboardView,
  'users': UsersView,
  'finance': FinanceView,
  'cms-posts': CMSPostsView,
  'mentors': MentorsView,
  'programs': ProgramsView,
  'curriculum-builder': CurriculumBuilderView,
  // Fallbacks or others
  'roles': () => <div>Roles View (Placeholder)</div>,
  'cms-pages': () => <div>Pages View (Placeholder)</div>,
  'settings': () => <div>Settings View (Placeholder)</div>,
};

const ViewPermissions: Record<string, string[]> = {
  'dashboard': ['view_dashboard_global', 'view_dashboard_branch', 'view_dashboard_finance', 'view_dashboard_learning'],
  'users': ['manage_users_global', 'manage_users_branch'],
  'finance': ['view_finance_analytics'],
  'cms-posts': ['manage_global_settings'],
  'mentors': ['manage_students', 'view_dashboard_learning'],
  'programs': ['manage_learning_content', 'view_dashboard_learning'],
  'curriculum-builder': ['manage_learning_content'],
  'roles': ['manage_roles'],
  'cms-pages': ['manage_global_settings'],
  'settings': ['manage_global_settings'],
};

export default function AdminLayout() {
  const { sidebarOpen, tabs, activeTabId } = useAdminStore();
  const { hasPermission } = useAuthStore();
  
  // Find the active tab definition
  const activeTab = tabs.find(t => t.id === activeTabId);
  const ActiveView = activeTab ? ViewMap[activeTab.view] : DashboardView;

  // Check permissions for active view
  const isAllowed = React.useMemo(() => {
    if (!activeTab) return true; // Default or empty state
    const requiredPermissions = ViewPermissions[activeTab.view];
    if (!requiredPermissions) return true; // No specific permissions required (safe default? or strict?)
    // Let's assume strict: if view is in map, check it.
    return hasPermission(requiredPermissions);
  }, [activeTab, hasPermission]);

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar />
      
      <div 
        className={cn(
          "flex-1 flex flex-col transition-all duration-300 min-h-screen",
          sidebarOpen ? "ml-[280px]" : "ml-[80px]",
          "max-w-[100vw]" // Prevent overflow on mobile initially
        )}
      >
        <AdminHeader />
        
        <main className="flex-1 p-6 md:p-8 overflow-y-auto bg-muted/10">
          <div className="max-w-7xl mx-auto w-full">
            {activeTab ? (
               isAllowed ? (
                 <ActiveView data={activeTab.data} />
               ) : (
                 <div className="flex flex-col items-center justify-center h-[50vh] text-destructive">
                   <h3 className="text-xl font-bold">Unauthorized Access</h3>
                   <p>You do not have permission to view this page.</p>
                 </div>
               )
            ) : (
               <div className="flex flex-col items-center justify-center h-[50vh] text-muted-foreground">
                 <p>No tabs open</p>
               </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
