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
  const isAuthPage = pathname.startsWith('/auth');

  return (
    <div className="relative flex min-h-screen flex-col bg-muted/30">
      {!isAuthPage && <TopBar />}
      <main className="flex-1">
        <div className="mx-auto flex w-full max-w-5xl flex-col px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
      {!isAuthPage && <BottomNavigation />}
    </div>
  );
};

export default MainLayout;
