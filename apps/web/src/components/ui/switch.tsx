'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface SwitchProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

export const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  ({ className, checked: controlledChecked, defaultChecked = false, onCheckedChange, disabled, onClick, ...props }, ref) => {
    const isControlled = controlledChecked !== undefined;
    const [uncontrolledChecked, setUncontrolledChecked] = React.useState(defaultChecked);
    const checked = isControlled ? controlledChecked : uncontrolledChecked;

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled) return;
      if (!isControlled) {
        setUncontrolledChecked(!checked);
      }
      onCheckedChange?.(!checked);
      onClick?.(e);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        handleClick(e as unknown as React.MouseEvent<HTMLButtonElement>);
      }
    };

    return (
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        data-state={checked ? 'checked' : 'unchecked'}
        disabled={disabled}
        ref={ref}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className={cn(
          'peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50',
          checked
            ? 'bg-primary shadow-[0_0_12px_rgba(var(--primary-rgb,59,130,246),0.4)]'
            : 'bg-zinc-200 dark:bg-zinc-800',
          className
        )}
        {...props}
      >
        <span
          data-state={checked ? 'checked' : 'unchecked'}
          className={cn(
            'pointer-events-none block size-5 rounded-full bg-white shadow-lg ring-0 transition-transform duration-200 dark:bg-zinc-100',
            checked ? 'translate-x-5' : 'translate-x-0'
          )}
        />
      </button>
    );
  }
);

Switch.displayName = 'Switch';
