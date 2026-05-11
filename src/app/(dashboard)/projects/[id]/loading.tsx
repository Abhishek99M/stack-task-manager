import { SkeletonBlock } from "@/components/ui/skeleton-block";

export default function ProjectLoading() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-2">
          <SkeletonBlock className="h-7 w-56" />
          <SkeletonBlock className="h-4 w-80" />
        </div>
        <SkeletonBlock className="h-8 w-8" />
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="min-w-0">
          <div className="mb-4 flex items-center justify-between">
            <SkeletonBlock className="h-4 w-16" />
            <SkeletonBlock className="h-3 w-14" />
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, col) => (
              <div
                key={col}
                className="rounded-xl border border-border bg-card/30 p-3"
              >
                <SkeletonBlock className="mb-3 h-4 w-24" />
                <div className="space-y-2">
                  {Array.from({ length: 2 + col }).map((_, t) => (
                    <SkeletonBlock key={t} className="h-20 w-full" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <aside>
          <div className="rounded-xl border border-border bg-card/40 p-4">
            <div className="mb-3 flex items-center justify-between">
              <SkeletonBlock className="h-4 w-16" />
              <SkeletonBlock className="h-7 w-16" />
            </div>
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <SkeletonBlock key={i} className="h-10 w-full" />
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
