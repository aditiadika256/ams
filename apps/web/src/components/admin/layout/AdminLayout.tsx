'use client';

import React from 'react';
import { useAdminStore } from '@/store/useAdminStore';
import { useAuthStore } from '@/store/useAuthStore';
import { cn } from '@/lib/utils';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';

// View Imports
import DashboardView from '../views/Dashboard/view';
import UsersView from '../views/Users/view';
import FinanceView from '../views/finance/view';
import CMSPostsView from '../views/CMSPosts/view';
import MentorsView from '../views/Mentors/view';
import ProgramsView from '../views/Programs/view';
import TagsView from '../views/Tags/view';
import ComponentsView from '../views/Components/view';
import CurriculumBuilderView from '../views/CurriculumBuilder/view';
import RolesPermissionsView from '../views/RolesPermissions/view';
import MenuManagementView from '../views/MenuManagement/view';
import ColorPaletteView from '../views/ColorPalette/view';

const ViewMap: Record<string, React.ComponentType<any>> = {
  'dashboard': DashboardView,
  'users': UsersView,
  'finance': FinanceView,
  'cms-posts': CMSPostsView,
  'mentors': MentorsView,
  'programs': ProgramsView,
  'tags': TagsView,
  'components': ComponentsView,
  'curriculum-builder': CurriculumBuilderView,
  'menus': MenuManagementView,
  'colorpalette': ColorPaletteView,// With hyphen
  // Fallbacks or others
  'roles': RolesPermissionsView,
  'cms-pages': () => <div>Pages View (Placeholder)</div>,
  'settings': () => <div>Settings View (Placeholder)</div>,
};

const ViewPermissions: Record<string, string[]> = {
  'dashboard': ['view_dashboard_global', 'view_dashboard_branch', 'view_dashboard_finance', 'view_dashboard_learning'],
  'users': ['manage_users_global', 'manage_users_branch'],
  'finance': ['view_finance_analytics'],
  'cms-posts': ['manage_global_settings'],
  'mentors': ['manage_students', 'view_dashboard_learning'],
  'programs': ['program.view', 'program.create', 'program.update'],
  'tags': ['program-tag.manage'],
  'components': ['component-definition.view'],
  'curriculum-builder': ['manage_learning_content'],
  'menus': ['manage_menus'],
  'colorpalette': ['manage_global_settings'],
  'roles': ['manage_roles'],
  'cms-pages': ['manage_global_settings'],
  'settings': ['manage_global_settings'],
};

export default function AdminLayout() {
  const { sidebarOpen, tabs, activeTabId } = useAdminStore();
  const user = useAuthStore((state) => state.user);
  
  // Find the active tab definition
  const activeTab = tabs.find(t => t.id === activeTabId);
  
  const ActiveView = activeTab ? (ViewMap[activeTab.view] || ViewMap['dashboard']) : DashboardView;

  // Check permissions for active view
  const isAllowed = (() => {
    if (!activeTab) return true;
    if (user?.roles?.some((role) => ['superadmin', 'direktur'].includes(role))) {
      return true;
    }

    const requiredPermissions = ViewPermissions[activeTab.view];
    if (!requiredPermissions) return true;

    return requiredPermissions.some((permission) =>
      user?.permissions?.includes(permission)
    );
  })();

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar />
      
      <div 
        className={cn(
          "flex flex-col transition-all duration-300 min-h-screen min-w-0",
          sidebarOpen ? "md:pl-[280px]" : "md:pl-[80px]"
        )}
      >
        <AdminHeader />
        
        <main className="flex-1 p-4 md:p-8 overflow-x-hidden">
          <div className="max-w-7xl mx-auto w-full min-w-0">
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
