'use client';

import React from 'react';
import {
  X,
  XCircle,
  Minimize2,
  CopyX,
  LayoutDashboard,
  FileText,
  PieChart,
  Users,
  ShieldCheck,
  Settings,
  Home,
  Blocks,
  Menu as MenuIcon,
  Activity,
  Archive,
  ArrowLeftRight,
  Award,
  BarChart3,
  Bookmark,
  BookOpen,
  Briefcase,
  Building2,
  Calendar,
  CalendarRange,
  CircleDollarSign,
  ClipboardCheck,
  Clock,
  Coins,
  Database,
  ExternalLink,
  FileCheck2,
  FileQuestion,
  FileSpreadsheet,
  FolderTree,
  Globe,
  GraduationCap,
  HardDrive,
  HelpCircle,
  Image,
  Layers,
  LifeBuoy,
  MapPin,
  MessageSquare,
  Network,
  Package,
  Palette,
  PanelsTopLeft,
  Receipt,
  ShoppingBag,
  Star,
  Tags,
  Ticket,
  Truck,
  UserCheck,
} from 'lucide-react';
import { useAdminStore } from '@/store/useAdminStore';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

// Map icon names to components for rendering
const IconMap: Record<string, any> = {
  Activity,
  Archive,
  ArrowLeftRight,
  Award,
  BarChart3,
  Blocks,
  Bookmark,
  BookOpen,
  Briefcase,
  Building2,
  Calendar,
  CalendarRange,
  CircleDollarSign,
  ClipboardCheck,
  Clock,
  Coins,
  Database,
  ExternalLink,
  FileCheck2,
  FileQuestion,
  FileSpreadsheet,
  FileText,
  FolderTree,
  Globe,
  GraduationCap,
  HardDrive,
  HelpCircle,
  Home,
  Image,
  Layers,
  LayoutDashboard,
  LifeBuoy,
  MapPin,
  Menu: MenuIcon,
  MessageSquare,
  Network,
  Package,
  Palette,
  PanelsTopLeft,
  PieChart,
  Receipt,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Star,
  Tags,
  Ticket,
  Truck,
  UserCheck,
  Users,
};

export function AdminTabs() {
  const {
    tabs,
    activeTabId,
    setActiveTab,
    closeTab,
    closeAllTabs,
    closeOtherTabs,
  } = useAdminStore();

  const canCloseTabs =
    tabs.length > 1 || (tabs.length === 1 && tabs[0]?.view !== 'dashboard');

  return (
    <div className="flex items-center justify-between w-full bg-muted/30 border-b border-border/20 px-2 pt-1.5 backdrop-blur-sm select-none">
      {/* Scrollable Tab List */}
      <div className="flex items-center flex-1 overflow-x-auto scrollbar-hide mr-2">
        <AnimatePresence initial={false}>
          {tabs.map((tab) => {
            const Icon = (tab.icon && IconMap[tab.icon]) || LayoutDashboard;
            const isActive = tab.id === activeTabId;

            return (
              <motion.div
                key={tab.id}
                initial={{ opacity: 0, y: 10, width: 0 }}
                animate={{ opacity: 1, y: 0, width: 'auto' }}
                exit={{ opacity: 0, scale: 0.9, width: 0 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  'group relative flex items-center gap-2 px-3.5 py-1.5 mr-1 rounded-t-lg border-t border-l border-r text-xs sm:text-sm font-medium cursor-pointer transition-all select-none min-w-[130px] max-w-[200px]',
                  isActive
                    ? 'bg-background text-foreground border-border/30 shadow-sm z-10 backdrop-blur-sm'
                    : 'bg-muted/20 text-muted-foreground border-transparent hover:bg-muted/40 hover:text-foreground'
                )}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="truncate flex-1">{tab.title}</span>

                {/* Close Individual Tab Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    closeTab(tab.id);
                  }}
                  className={cn(
                    'opacity-0 group-hover:opacity-100 p-0.5 rounded-md hover:bg-destructive/20 hover:text-destructive transition-opacity focus:outline-none focus:opacity-100',
                    isActive && 'opacity-100'
                  )}
                  title={`Tutup ${tab.title}`}
                  aria-label={`Tutup tab ${tab.title}`}
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

      {/* Global Tab Actions (Tutup Tab Lainnya & Tutup Semua dengan sliding title hover ala TopBar) */}
      {canCloseTabs && (
        <div className="flex items-center shrink-0 mb-1 gap-1 pl-1 border-l border-border/20">
          {tabs.length > 1 && (
            <button
              type="button"
              onClick={() => activeTabId && closeOtherTabs(activeTabId)}
              className="group relative flex items-center h-7 px-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all duration-300 ease-out select-none overflow-hidden cursor-pointer"
              title="Tutup tab lainnya"
              aria-label="Tutup tab lainnya"
            >
              <CopyX className="size-3.5 shrink-0 transition-transform duration-300 group-hover:scale-110" />
              <span className="overflow-hidden whitespace-nowrap text-xs font-medium transition-all duration-300 ease-out transform max-w-0 opacity-0 -translate-x-1 group-hover:max-w-[130px] group-hover:opacity-100 group-hover:ml-1.5 group-hover:translate-x-0">
                Tutup Tab Lainnya
              </span>
            </button>
          )}

          <button
            type="button"
            onClick={closeAllTabs}
            className="group relative flex items-center h-7 px-2 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-300 ease-out select-none overflow-hidden cursor-pointer"
            title="Tutup semua tab yang sedang terbuka"
            aria-label="Tutup semua tab"
          >
            <XCircle className="size-3.5 shrink-0 transition-transform duration-300 group-hover:scale-110" />
            <span className="overflow-hidden whitespace-nowrap text-xs font-medium transition-all duration-300 ease-out transform max-w-0 opacity-0 -translate-x-1 group-hover:max-w-[100px] group-hover:opacity-100 group-hover:ml-1.5 group-hover:translate-x-0">
              Tutup Semua
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
