import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function ProgramCardSkeleton() {
  return (
    <Card className="flex flex-col h-full overflow-hidden border-muted/60 shadow-sm">
      <CardHeader className="p-0">
        <Skeleton className="aspect-video w-full rounded-none" />
      </CardHeader>
      <CardContent className="p-6 flex-1 space-y-4">
        <div className="flex gap-2">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <div className="grid grid-cols-2 gap-4 pt-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </div>
      </CardContent>
      <CardFooter className="p-6 pt-0 flex justify-between items-center">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-10 w-28 rounded-full" />
      </CardFooter>
    </Card>
  );
}
