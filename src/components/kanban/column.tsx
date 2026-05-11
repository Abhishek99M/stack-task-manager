"use client";

import { useDroppable } from "@dnd-kit/core";
import { TaskStatus } from "@prisma/client";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

const statusAccent: Record<TaskStatus, string> = {
  TODO: "bg-zinc-500",
  IN_PROGRESS: "bg-violet-500",
  DONE: "bg-emerald-500",
};

const statusGlow: Record<TaskStatus, string> = {
  TODO: "shadow-[0_0_8px_hsl(0_0%_60%/0.5)]",
  IN_PROGRESS: "shadow-[0_0_8px_hsl(263_75%_60%/0.6)]",
  DONE: "shadow-[0_0_8px_hsl(160_70%_50%/0.5)]",
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
    <motion.div
      ref={setNodeRef}
      animate={
        isOver
          ? { scale: 1.005, transition: { duration: 0.18 } }
          : { scale: 1, transition: { duration: 0.18 } }
      }
      className={cn(
        "relative flex flex-col rounded-xl border bg-card/30 p-3 transition-colors",
        isOver
          ? "border-violet-500/40 bg-violet-500/[0.04] ring-2 ring-violet-500/20"
          : "border-border",
      )}
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={cn("size-2 rounded-full", statusAccent[id], statusGlow[id])} />
          <h3 className="text-sm font-semibold">{label}</h3>
          <span className="text-xs text-muted-foreground">·</span>
          <span className="text-xs text-muted-foreground">{hint}</span>
        </div>
        <span className="rounded-md bg-accent px-2 py-0.5 text-xs font-medium text-muted-foreground tabular-nums">
          {count}
        </span>
      </div>
      {children}
    </motion.div>
  );
}
