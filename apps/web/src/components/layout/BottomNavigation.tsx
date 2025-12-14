
import { Home, LayoutGrid, Package, ShoppingCart, User } from 'lucide-react';
import React from 'react';

const navItems = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/products', icon: LayoutGrid, label: 'Products' },
  { href: '/orders', icon: Package, label: 'Orders' },
  { href: '/cart', icon: ShoppingCart, label: 'Cart' },
  { href: '/profile', icon: User, label: 'Profile' },
];

const BottomNavigation = () => {
  return (
    <nav className="fixed bottom-0 z-40 w-full border-t bg-background">
      <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-around px-4 sm:px-6 lg:px-8">
        {navItems.map((item) => (
          <a
            key={item.label}
            href={item.href}
            className="flex flex-col items-center justify-center text-muted-foreground hover:text-primary"
          >
            <item.icon className="h-6 w-6 mb-1" />
            <span className="text-xs tracking-tight">{item.label}</span>
          </a>
        ))}
      </div>
    </nav>
  );
};

export default BottomNavigation;
