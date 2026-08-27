'use client';

import React from 'react';
import { X, LayoutDashboard, FileText, PieChart, Users, ShieldCheck, Settings, Home, Blocks, Menu as MenuIcon } from 'lucide-react';
import { useAdminStore } from '@/store/useAdminStore';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

// Map icon names to components for rendering
const IconMap: Record<string, any> = {
  LayoutDashboard,
  FileText,
  PieChart,
  Users,
  ShieldCheck,
  Settings,
  Home,
  Blocks,
  Menu: MenuIcon
};

export function AdminTabs() {
  const { tabs, activeTabId, setActiveTab, closeTab } = useAdminStore();

  return (
    <div className="flex items-center w-full overflow-x-auto bg-muted/30 border-b border-border/20 px-2 pt-2 scrollbar-hide backdrop-blur-sm">
      <AnimatePresence>
        {tabs.map((tab) => {
           // Default icon if none or not found
           const Icon = (tab.icon && IconMap[tab.icon]) || LayoutDashboard;
           const isActive = tab.id === activeTabId;

           return (
             <motion.div
               key={tab.id}
               initial={{ opacity: 0, y: 10, width: 0 }}
               animate={{ opacity: 1, y: 0, width: 'auto' }}
               exit={{ opacity: 0, scale: 0.9, width: 0 }}
               className={cn(
                 "group relative flex items-center gap-2 px-4 py-2 mr-1 rounded-t-lg border-t border-l border-r text-sm font-medium cursor-pointer transition-all select-none min-w-[150px] max-w-[200px]",
                 isActive 
                   ? "bg-background text-foreground border-border/30 shadow-sm z-10 backdrop-blur-sm" 
                   : "bg-muted/20 text-muted-foreground border-transparent hover:bg-muted/40 hover:text-foreground"
               )}
               onClick={() => setActiveTab(tab.id)}
             >
               <Icon className="h-4 w-4 shrink-0" />
               <span className="truncate flex-1">{tab.title}</span>
               
               <button
                 onClick={(e) => {
                   e.stopPropagation();
                   closeTab(tab.id);
                 }}
                 className={cn(
                   "opacity-0 group-hover:opacity-100 p-0.5 rounded-md hover:bg-destructive/20 hover:text-destructive transition-opacity",
                   isActive && "opacity-100" // Always show close on active tab
                 )}
               >
                 <X className="h-3 w-3" />
               </button>

               {/* Active Indicator Line */}
               {isActive && (
                 <motion.div 
                   layoutId="activeTabIndicator"
                   className="absolute top-0 left-0 right-0 h-0.5 bg-primary shadow-[0_0_10px_var(--color-primary-shadow,rgba(59,130,246,0.5))]"
                 />
               )}
             </motion.div>
           );
        })}
      </AnimatePresence>
    </div>
  );
}
