'use client';

import React from 'react';
import { useAdminStore } from '@/store/useAdminStore';
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

export default function AdminLayout() {
  const { sidebarOpen, tabs, activeTabId } = useAdminStore();
  
  // Find the active tab definition
  const activeTab = tabs.find(t => t.id === activeTabId);
  const ActiveView = activeTab ? ViewMap[activeTab.view] : DashboardView;

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
               <ActiveView data={activeTab.data} />
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
