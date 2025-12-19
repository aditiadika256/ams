'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import TopBar from './TopBar';
import BottomNavigation from './BottomNavigation';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const isAuthPage = pathname?.startsWith('/auth');
  const isHomePage = pathname === '/';

  return (
    <div className="relative flex min-h-screen flex-col bg-background font-sans antialiased selection:bg-primary/20">
      {!isAuthPage && <TopBar />}
      <main className="flex-1 w-full">
        {isHomePage ? (
          children
        ) : (
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </div>
        )}
      </main>
      {!isAuthPage && <BottomNavigation />}
    </div>
  );
};

export default MainLayout;
