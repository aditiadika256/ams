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
  const isExamSession = pathname?.startsWith('/exams/session');
  const isHomePage = pathname === '/';
  const isAdminPage = pathname?.startsWith('/admin');

  return (
    <div className="relative flex min-h-screen flex-col font-sans antialiased selection:bg-primary/20">
      {!isAuthPage && !isExamSession && !isAdminPage && <TopBar />}
      <main className="flex-1 w-full">
        {isHomePage || isExamSession || isAdminPage ? (
          children
        ) : (
          <div className="w-full pt-20 pb-8 md:pt-24 md:pb-16">
            <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </div>
        )}
      </main>
      {!isAuthPage && !isExamSession && !isAdminPage && <BottomNavigation />}
    </div>
  );
};

export default MainLayout;
