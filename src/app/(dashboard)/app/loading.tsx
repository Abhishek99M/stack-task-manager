import { SkeletonBlock } from "@/components/ui/skeleton-block";

export default function DashboardLoading() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <SkeletonBlock className="h-4 w-44" />
          <SkeletonBlock className="mt-2 h-7 w-32" />
        </div>
        <SkeletonBlock className="h-9 w-32" />
      </header>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-border bg-card/40 p-4"
          >
            <div className="flex items-center justify-between">
              <SkeletonBlock className="h-3 w-20" />
              <SkeletonBlock className="size-7" />
            </div>
            <SkeletonBlock className="mt-3 h-8 w-12" />
          </div>
        ))}
      </section>

      <div className="grid gap-4 lg:grid-cols-3">
        <SkeletonBlock className="h-64 lg:col-span-1" />
        <SkeletonBlock className="h-64 lg:col-span-2" />
        <SkeletonBlock className="h-64 lg:col-span-2" />
        <SkeletonBlock className="h-64 lg:col-span-1" />
      </div>
    </div>
  );
}
