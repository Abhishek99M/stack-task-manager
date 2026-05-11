"use client";

import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import { TaskPriority } from "@prisma/client";
import { AlertOctagon, AlertTriangle, ArrowDown, Calendar, Equal, GripVertical } from "lucide-react";
import { motion } from "framer-motion";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn, formatRelative, initials, isOverdue } from "@/lib/utils";
import type { KanbanTask } from "@/components/kanban/kanban-board";

const priorityStyles: Record<
  TaskPriority,
  { icon: React.ReactNode; label: string; className: string }
> = {
  LOW: {
    icon: <ArrowDown className="size-3" />,
    label: "Low",
    className: "text-zinc-400",
  },
  MEDIUM: {
    icon: <Equal className="size-3" />,
    label: "Medium",
    className: "text-sky-400",
  },
  HIGH: {
    icon: <AlertTriangle className="size-3" />,
    label: "High",
    className: "text-amber-400",
  },
  URGENT: {
    icon: <AlertOctagon className="size-3" />,
    label: "Urgent",
    className: "text-rose-400",
  },
};

export function TaskCard({
  task,
  onOpen,
  dragOverlay,
}: {
  task: KanbanTask;
  onOpen?: () => void;
  dragOverlay?: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, disabled: dragOverlay });

  const style = dragOverlay
    ? undefined
    : {
        transform: CSS.Transform.toString(transform),
        transition,
      };

  const overdue = isOverdue(task.dueDate, task.status);
  const priority = priorityStyles[task.priority];

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      layout={!dragOverlay}
      initial={dragOverlay ? false : { opacity: 0, y: 4 }}
      animate={{ opacity: isDragging && !dragOverlay ? 0 : 1, y: 0 }}
      transition={{ type: "spring", stiffness: 380, damping: 30 }}
      onClick={() => !isDragging && onOpen?.()}
      className={cn(
        "group relative cursor-grab rounded-lg border bg-card p-3 transition-colors active:cursor-grabbing",
        dragOverlay
          ? "border-violet-500/40 shadow-2xl shadow-black/40 ring-2 ring-violet-500/20"
          : "border-border hover:border-border/80 hover:bg-card/80",
        isDragging && !dragOverlay && "opacity-30",
      )}
      {...attributes}
      {...listeners}
    >
      {/* drag handle visual */}
      <div className="absolute top-2 right-1.5 text-muted-foreground/40 opacity-0 transition-opacity group-hover:opacity-100">
        <GripVertical className="size-3.5" />
      </div>

      <div className="pr-4">
        <p className="text-sm font-medium leading-snug text-foreground">
          {task.title}
        </p>

        {task.description && (
          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
            {task.description}
          </p>
        )}
      </div>

      <div className="mt-2.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs">
          <span className={cn("inline-flex items-center gap-0.5 font-medium", priority.className)}>
            {priority.icon}
            <span className="hidden sm:inline">{priority.label}</span>
          </span>

          {task.dueDate && (
            <>
              <span className="text-muted-foreground/40">·</span>
              <span
                className={cn(
                  "inline-flex items-center gap-1 font-medium",
                  overdue ? "text-rose-400" : "text-muted-foreground",
                )}
              >
                <Calendar className="size-3" />
                {formatRelative(task.dueDate)}
              </span>
            </>
          )}
        </div>

        {task.assignee ? (
          <Avatar className="size-6 ring-2 ring-card">
            <AvatarFallback className="bg-violet-500/15 text-[10px] font-medium text-violet-300">
              {initials(task.assignee.name)}
            </AvatarFallback>
          </Avatar>
        ) : (
          <div className="size-6 rounded-full border border-dashed border-border" aria-hidden />
        )}
      </div>
    </motion.div>
  );
}
