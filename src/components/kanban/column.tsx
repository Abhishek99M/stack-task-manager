"use client";

import { useDroppable } from "@dnd-kit/core";
import { TaskStatus } from "@prisma/client";

import { cn } from "@/lib/utils";

const statusAccent: Record<TaskStatus, string> = {
  TODO: "bg-zinc-500",
  IN_PROGRESS: "bg-violet-500",
  DONE: "bg-emerald-500",
};

export function Column({
  id,
  label,
  hint,
  count,
  children,
}: {
  id: TaskStatus;
  label: string;
  hint: string;
  count: number;
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex flex-col rounded-xl border bg-card/30 p-3 transition-all",
        isOver ? "border-violet-500/40 bg-card/50 ring-2 ring-violet-500/15" : "border-border",
      )}
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={cn("size-2 rounded-full", statusAccent[id])} />
          <h3 className="text-sm font-semibold">{label}</h3>
          <span className="text-xs text-muted-foreground">·</span>
          <span className="text-xs text-muted-foreground">{hint}</span>
        </div>
        <span className="rounded-md bg-accent px-2 py-0.5 text-xs font-medium text-muted-foreground">
          {count}
        </span>
      </div>
      {children}
    </div>
  );
}
