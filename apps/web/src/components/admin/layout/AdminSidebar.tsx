'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  LayoutDashboard, 
  FileText, 
  BarChart3, 
  Settings, 
  ShieldCheck, 
  PieChart,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  GraduationCap,
  BookOpen
} from 'lucide-react';
import { useAdminStore } from '@/store/useAdminStore';
import { useAuthStore } from '@/store/useAuthStore';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const menuItems = [
  {
    category: 'Main',
    items: [
      { title: 'Dashboard', view: 'dashboard', icon: LayoutDashboard },
      { title: 'Analytics', view: 'finance', icon: PieChart },
    ]
  },
  {
    category: 'Management',
    items: [
      { title: 'Users', view: 'users', icon: Users },
      { title: 'Roles & Permissions', view: 'roles', icon: ShieldCheck },
    ]
  },
  {
    category: 'Education',
    items: [
      { title: 'Programs', view: 'programs', icon: BookOpen },
      { title: 'Mentors', view: 'mentors', icon: GraduationCap },
    ]
  },
  {
    category: 'Content',
    items: [
      { title: 'Blog Posts', view: 'cms-posts', icon: FileText },
      { title: 'Pages', view: 'cms-pages', icon: FileText },
    ]
  },
  {
    category: 'System',
    items: [
      { title: 'Settings', view: 'settings', icon: Settings },
    ]
  }
];

export function AdminSidebar() {
  const { addTab, sidebarOpen, setSidebarOpen, toggleSidebar } = useAdminStore();
  const { logout } = useAuthStore();

  React.useEffect(() => {
    // Ensure sidebar is open on desktop by default
    const checkScreenSize = () => {
      if (window.innerWidth >= 768) {
        setSidebarOpen(true);
      }
    };

    // Check on mount
    checkScreenSize();

    // Optional: if we want to force open when resizing to desktop
    // window.addEventListener('resize', checkScreenSize);
    // return () => window.removeEventListener('resize', checkScreenSize);
  }, [setSidebarOpen]);

  const handleLogout = async () => {
    await logout();
    window.location.href = '/auth/login';
  };

  const handleMenuClick = (item: any) => {
    addTab({
      title: item.title,
      view: item.view,
      icon: item.icon.displayName
    });
  };

  return (
    <>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ 
          width: sidebarOpen ? 280 : 80,
          x: sidebarOpen ? 0 : 0
        }}
        className={cn(
          "fixed left-0 top-0 h-screen bg-card border-r z-50 flex flex-col transition-all duration-300 shadow-xl",
          !sidebarOpen && "items-center" // Center items when collapsed
        )}
      >
        {/* Header */}
      <div className={cn("h-16 flex items-center border-b", sidebarOpen ? "px-6 justify-between" : "justify-center")}>
        {sidebarOpen ? (
          <>
            <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                A
              </div>
              <span>Arkanin<span className="text-muted-foreground font-normal">.Admin</span></span>
            </Link>
            <Button variant="ghost" size="icon" className="hidden md:flex" onClick={toggleSidebar}>
              <Menu className="h-5 w-5" />
            </Button>
          </>
        ) : (
          <Button variant="ghost" size="icon" className="hidden md:flex" onClick={toggleSidebar}>
            <Menu className="h-5 w-5" />
          </Button>
        )}
        
        {/* Mobile Header Content when sidebar is open (overlay mode) */}
        <div className="md:hidden flex items-center gap-2 font-bold text-xl text-primary">
             {!sidebarOpen && (
               <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                 A
               </div>
             )}
        </div>
      </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto py-4 space-y-6">
          {menuItems.map((group, i) => (
            <div key={i} className="px-4">
              {sidebarOpen && (
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2">
                  {group.category}
                </h3>
              )}
              <div className="space-y-1">
                {group.items.map((item) => (
                  <Button
                    key={item.title}
                    variant="ghost"
                    size={sidebarOpen ? "default" : "icon"}
                    className={cn(
                      "w-full justify-start",
                      !sidebarOpen && "justify-center px-0"
                    )}
                    onClick={() => handleMenuClick(item)}
                  >
                    <item.icon className={cn("h-5 w-5", sidebarOpen && "mr-3")} />
                    {sidebarOpen && <span>{item.title}</span>}
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t space-y-2">
          <Button
            variant="outline"
            size={sidebarOpen ? "default" : "icon"}
            className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
            onClick={handleLogout}
          >
            <LogOut className={cn("h-5 w-5", sidebarOpen && "mr-3")} />
            {sidebarOpen && "Logout"}
          </Button>
        </div>
      </motion.aside>
    </>
  );
}
