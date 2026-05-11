import { cn } from "@/lib/utils";

export function SkeletonBlock({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-accent/60", className)}
      {...props}
    />
  );
}
