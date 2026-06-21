'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import TopBar from './TopBar';
import BottomNavigation from './BottomNavigation';
import { Footer } from './Footer';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const isAuthPage = pathname?.startsWith('/auth');
  const isExamSession = pathname?.startsWith('/exams/session');
  const isHomePage = pathname === '/';
  const isAdminPage = pathname?.startsWith('/admin');

  const showNavigation = !isAuthPage && !isExamSession && !isAdminPage;

  return (
    <div className="relative flex min-h-screen flex-col font-sans antialiased selection:bg-primary/20">
      {showNavigation && <TopBar />}
      <main className="flex-1 w-full flex flex-col">
        {isHomePage || isExamSession || isAdminPage || isAuthPage ? (
          children
        ) : (
          <div className="w-full flex-1 pt-24 md:pt-28">
            <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 pb-32">
              {children}
            </div>
          </div>
        )}
      </main>
      {showNavigation && <Footer />}
      {showNavigation && <BottomNavigation />}
    </div>
  );
};

export default MainLayout;
