import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted/60 ring-1 ring-inset ring-border/10", className)}
      {...props}
    />
  )
}

export { Skeleton }
