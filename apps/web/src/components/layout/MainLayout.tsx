
import React from 'react';
import TopBar from './TopBar';
import BottomNavigation from './BottomNavigation';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="relative flex min-h-screen flex-col bg-muted/30">
      <TopBar />
      <main className="flex-1">
        <div className="mx-auto flex w-full max-w-5xl flex-col px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
      <BottomNavigation />
    </div>
  );
};

export default MainLayout;
