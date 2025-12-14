
import { Bell, User } from 'lucide-react';
import React from 'react';

const TopBar = () => {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center px-4 sm:px-6 lg:px-8">
        <div className="flex-1">
          {/* TODO: Replace with actual Logo component */}
          <span className="font-bold">Arkanin</span>
        </div>
        <div className="flex items-center space-x-4">
          <button className="p-2 rounded-full hover:bg-accent">
            <Bell className="h-5 w-5" />
          </button>
          <button className="p-2 rounded-full hover:bg-accent">
            <User className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
