"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { TaskStatus, TaskPriority } from "@prisma/client";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, arrayMove } from "@dnd-kit/sortable";
import { toast } from "sonner";

import { NewTaskInline } from "@/components/kanban/new-task-inline";
import { TaskCard } from "@/components/kanban/task-card";
import { Column } from "@/components/kanban/column";
import { TaskDrawer } from "@/components/kanban/task-drawer";

export type KanbanTask = {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: Date | string | null;
  order: number;
  assigneeId: string | null;
  assignee: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  } | null;
  createdAt: Date | string;
  updatedAt: Date | string;
};

export type KanbanMember = {
  id: string;
  name: string;
  email: string;
  image: string | null;
};

const COLUMNS: { id: TaskStatus; label: string; hint: string }[] = [
  { id: "TODO", label: "Todo", hint: "Not started" },
  { id: "IN_PROGRESS", label: "In Progress", hint: "Currently working" },
  { id: "DONE", label: "Done", hint: "Completed" },
];

export function KanbanBoard({
  projectId,
  initialTasks,
  members,
  isAdmin,
  currentUserId,
}: {
  projectId: string;
  initialTasks: KanbanTask[];
  members: KanbanMember[];
  isAdmin: boolean;
  currentUserId: string;
}) {
  const [tasks, setTasks] = useState<KanbanTask[]>(initialTasks);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [openTaskId, setOpenTaskId] = useState<string | null>(null);
  const previousTasksRef = useRef<KanbanTask[]>(initialTasks);

  useEffect(() => {
    setTasks(initialTasks);
    previousTasksRef.current = initialTasks;
  }, [initialTasks]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const grouped = useMemo(() => {
    const groups: Record<TaskStatus, KanbanTask[]> = {
      TODO: [],
      IN_PROGRESS: [],
      DONE: [],
    };
    for (const t of [...tasks].sort(
      (a, b) => a.order - b.order || +new Date(a.createdAt) - +new Date(b.createdAt),
    )) {
      groups[t.status].push(t);
    }
    return groups;
  }, [tasks]);

  const activeTask = activeId ? tasks.find((t) => t.id === activeId) ?? null : null;
  const openTask = openTaskId ? tasks.find((t) => t.id === openTaskId) ?? null : null;

  const findColumn = (id: string): TaskStatus | null => {
    if (id === "TODO" || id === "IN_PROGRESS" || id === "DONE") return id;
    const task = tasks.find((t) => t.id === id);
    return task?.status ?? null;
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
    previousTasksRef.current = tasks;
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;
    const activeIdStr = String(active.id);
    const overIdStr = String(over.id);
    if (activeIdStr === overIdStr) return;

    const activeColumn = findColumn(activeIdStr);
    const overColumn = findColumn(overIdStr);
    if (!activeColumn || !overColumn) return;
    if (activeColumn === overColumn) return;

    setTasks((prev) => {
      const activeIndex = prev.findIndex((t) => t.id === activeIdStr);
      if (activeIndex < 0) return prev;
      const next = [...prev];
      next[activeIndex] = { ...next[activeIndex], status: overColumn };
      return next;
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over) {
      setTasks(previousTasksRef.current);
      return;
    }
    const activeIdStr = String(active.id);
    const overIdStr = String(over.id);

    const activeColumn = findColumn(activeIdStr);
    const overColumn = findColumn(overIdStr);
    if (!activeColumn || !overColumn) return;

    let updatedTasks = tasks;

    if (activeColumn === overColumn && activeIdStr !== overIdStr) {
      const colTasks = grouped[activeColumn];
      const fromIndex = colTasks.findIndex((t) => t.id === activeIdStr);
      const toIndex = colTasks.findIndex((t) => t.id === overIdStr);
      if (fromIndex >= 0 && toIndex >= 0) {
        const reordered = arrayMove(colTasks, fromIndex, toIndex);
        const updates = reordered.map((t, i) => ({ ...t, order: (i + 1) * 1000 }));
        const otherTasks = tasks.filter((t) => t.status !== activeColumn);
        updatedTasks = [...otherTasks, ...updates];
        setTasks(updatedTasks);
      }
    } else {
      const targetCol = grouped[overColumn];
      const overIndexInCol = targetCol.findIndex((t) => t.id === overIdStr);
      const others = tasks.filter(
        (t) => t.status !== overColumn && t.id !== activeIdStr,
      );
      const activeTaskNow = tasks.find((t) => t.id === activeIdStr);
      if (!activeTaskNow) return;
      const activeUpdated = { ...activeTaskNow, status: overColumn };
      const newTargetCol = targetCol.filter((t) => t.id !== activeIdStr);
      const insertAt = overIndexInCol >= 0 ? overIndexInCol : newTargetCol.length;
      newTargetCol.splice(insertAt, 0, activeUpdated);
      const updates = newTargetCol.map((t, i) => ({ ...t, order: (i + 1) * 1000 }));
      updatedTasks = [...others, ...updates];
      setTasks(updatedTasks);
    }

    // Persist
    const dirty = updatedTasks
      .filter((t) => {
        const old = previousTasksRef.current.find((p) => p.id === t.id);
        return !old || old.status !== t.status || old.order !== t.order;
      })
      .map((t) => ({ id: t.id, status: t.status, order: t.order }));

    if (dirty.length === 0) return;

    const snapshot = previousTasksRef.current;
    fetch("/api/tasks/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId, updates: dirty }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error ?? "Couldn't save task order.");
        }
      })
      .catch((err) => {
        toast.error("Couldn't save changes", { description: err.message });
        setTasks(snapshot);
      });
  };

  const handleDragCancel = () => {
    setActiveId(null);
    setTasks(previousTasksRef.current);
  };

  const handleTaskUpdate = (updated: KanbanTask) => {
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? { ...t, ...updated } : t)));
  };

  const handleTaskDelete = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  const handleTaskCreate = (task: KanbanTask) => {
    setTasks((prev) => [...prev, task]);
  };

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div className="grid gap-4 md:grid-cols-3">
          {COLUMNS.map((col) => {
            const colTasks = grouped[col.id];
            return (
              <Column key={col.id} id={col.id} label={col.label} hint={col.hint} count={colTasks.length}>
                <SortableContext id={col.id} items={colTasks.map((t) => t.id)}>
                  <div className="flex-1 space-y-2">
                    {colTasks.length === 0 ? (
                      <div className="rounded-md border border-dashed border-border/70 px-3 py-6 text-center text-xs text-muted-foreground">
                        Drop tasks here
                      </div>
                    ) : (
                      colTasks.map((task) => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          onOpen={() => setOpenTaskId(task.id)}
                        />
                      ))
                    )}
                  </div>
                </SortableContext>
                <div className="pt-2">
                  <NewTaskInline
                    projectId={projectId}
                    status={col.id}
                    onCreated={handleTaskCreate}
                  />
                </div>
              </Column>
            );
          })}
        </div>

        <DragOverlay dropAnimation={{ duration: 200, easing: "cubic-bezier(0.18, 0.67, 0.32, 1.27)" }}>
          {activeTask ? <TaskCard task={activeTask} dragOverlay /> : null}
        </DragOverlay>
      </DndContext>

      <TaskDrawer
        task={openTask}
        members={members}
        currentUserId={currentUserId}
        isAdmin={isAdmin}
        onClose={() => setOpenTaskId(null)}
        onUpdate={handleTaskUpdate}
        onDelete={(id) => {
          handleTaskDelete(id);
          setOpenTaskId(null);
        }}
      />
    </>
  );
}
