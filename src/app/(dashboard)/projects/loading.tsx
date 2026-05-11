import { SkeletonBlock } from "@/components/ui/skeleton-block";

export default function ProjectsLoading() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <SkeletonBlock className="h-4 w-44" />
          <SkeletonBlock className="mt-2 h-7 w-32" />
        </div>
        <SkeletonBlock className="h-9 w-32" />
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-border bg-card/40 p-5"
          >
            <SkeletonBlock className="h-1 w-full" />
            <div className="mt-4 space-y-2">
              <SkeletonBlock className="h-5 w-2/3" />
              <SkeletonBlock className="h-4 w-full" />
              <SkeletonBlock className="h-4 w-4/5" />
            </div>
            <div className="mt-5 flex items-center justify-between">
              <SkeletonBlock className="h-3 w-24" />
              <SkeletonBlock className="h-3 w-20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
