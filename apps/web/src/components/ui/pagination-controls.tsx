import React from 'react';
import {
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type PaginationControlsProps = {
    currentPage: number;
    lastPage: number;
    total: number;
    from?: number | null;
    to?: number | null;
    onPageChange: (page: number) => void;
    /**
     * Noun used in the summary text, e.g. "users", "programs", "transactions".
     * Shown as: "Menampilkan 1-10 dari 42 {itemLabel}".
     */
    itemLabel: string;
    /** Full message shown when there is nothing to paginate. */
    emptyLabel?: string;
    className?: string;
    isLoading?: boolean;
};

type NavButtonProps = {
    onClick: () => void;
    disabled: boolean;
    icon: LucideIcon;
    label: string;
};

function NavButton({
    onClick,
    disabled,
    icon: Icon,
    label,
}: Readonly<NavButtonProps>) {
    return (
        <Button
            type="button"
            variant="outline"
            size="icon"
            disabled={disabled}
            onClick={onClick}
            className="h-8 w-8 bg-transparent border-white/10 hover:bg-white/5"
        >
            <Icon className="size-4" />
            <span className="sr-only">{label}</span>
        </Button>
    );
}

export function PaginationControls({
    currentPage,
    lastPage,
    total,
    from,
    to,
    onPageChange,
    itemLabel,
    emptyLabel,
    className,
    isLoading,
}: Readonly<PaginationControlsProps>) {
    const hasRange = total > 0 && from !== undefined && to !== undefined && from !== null && to !== null;
    const canGoBack = currentPage > 1;
    const canGoForward = currentPage < lastPage;

    const summary = hasRange
        ? `Menampilkan ${from}-${to} dari ${total} ${itemLabel}`
        : (emptyLabel ?? `Tidak ada ${itemLabel} untuk ditampilkan`);

    return (
        <div
            className={cn(
                'flex flex-col gap-4 border-t border-white/5 pt-4 lg:flex-row lg:items-center lg:justify-between text-xs text-muted-foreground',
                className,
            )}
        >
            <p>{summary}</p>

            <div className="flex items-center gap-2 self-start lg:self-auto">
                <NavButton
                    onClick={() => onPageChange(1)}
                    disabled={!canGoBack || !!isLoading}
                    icon={ChevronsLeft}
                    label="Halaman pertama"
                />
                <NavButton
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={!canGoBack || !!isLoading}
                    icon={ChevronLeft}
                    label="Halaman sebelumnya"
                />

                <div className="min-w-28 text-center text-sm">
                    Halaman {currentPage} dari {lastPage}
                </div>

                <NavButton
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={!canGoForward || !!isLoading}
                    icon={ChevronRight}
                    label="Halaman berikutnya"
                />
                <NavButton
                    onClick={() => onPageChange(lastPage)}
                    disabled={!canGoForward || !!isLoading}
                    icon={ChevronsRight}
                    label="Halaman terakhir"
                />
            </div>
        </div>
    );
}
