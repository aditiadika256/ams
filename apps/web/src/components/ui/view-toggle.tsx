import { LayoutGrid, List } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ViewMode = 'list' | 'grid';

export interface ViewToggleProps {
    view: ViewMode;
    onViewChange: (view: ViewMode) => void;
    className?: string;
}

export function ViewToggle({ view, onViewChange, className }: ViewToggleProps) {
    return (
        <div className={cn("inline-flex items-center rounded-lg border border-border bg-muted/50 p-1", className)}>
            <button
                type="button"
                onClick={() => onViewChange('list')}
                className={cn(
                    "inline-flex items-center justify-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-all",
                    view === 'list' 
                        ? "bg-background text-foreground shadow-sm ring-1 ring-border/10" 
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
                title="List View"
            >
                <List className="h-4 w-4" />
                <span className="sr-only sm:not-sr-only">List</span>
            </button>
            <button
                type="button"
                onClick={() => onViewChange('grid')}
                className={cn(
                    "inline-flex items-center justify-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-all",
                    view === 'grid' 
                        ? "bg-background text-foreground shadow-sm ring-1 ring-border/10" 
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
                title="Grid View"
            >
                <LayoutGrid className="h-4 w-4" />
                <span className="sr-only sm:not-sr-only">Grid</span>
            </button>
        </div>
    );
}
