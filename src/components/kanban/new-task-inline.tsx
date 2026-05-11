"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Plus, Loader2 } from "lucide-react";
import { TaskStatus } from "@prisma/client";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { KanbanTask } from "./kanban-board";

export function NewTaskInline({
  projectId,
  status,
  onCreated,
}: {
  projectId: string;
  status: TaskStatus;
  onCreated: (task: KanbanTask) => void;
}) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [pending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const close = () => {
    setOpen(false);
    setTitle("");
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      close();
      return;
    }
    startTransition(async () => {
      const res = await fetch(`/api/projects/${projectId}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), status }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error("Couldn't create task", { description: data.error });
        return;
      }
      onCreated(data.task);
      setTitle("");
      // keep open so user can keep adding
      inputRef.current?.focus();
    });
  };

  if (!open) {
    return (
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => setOpen(true)}
        className="w-full justify-start text-muted-foreground hover:bg-accent/40 hover:text-foreground"
      >
        <Plus className="size-3.5" />
        Add task
      </Button>
    );
  }

  return (
    <form
      onSubmit={submit}
      onKeyDown={(e) => {
        if (e.key === "Escape") close();
      }}
      className={cn(
        "rounded-md border border-violet-500/30 bg-card p-2 ring-2 ring-violet-500/15",
      )}
    >
      <Input
        ref={inputRef}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Task title…"
        className="h-8 border-0 bg-transparent px-1 shadow-none focus-visible:ring-0"
        maxLength={200}
        disabled={pending}
      />
      <div className="mt-2 flex items-center justify-end gap-1">
        <Button type="button" size="sm" variant="ghost" onClick={close} disabled={pending}>
          Cancel
        </Button>
        <Button type="submit" size="sm" disabled={pending || !title.trim()}>
          {pending && <Loader2 className="size-3.5 animate-spin" />}
          {pending ? "Adding…" : "Add"}
        </Button>
      </div>
    </form>
  );
}
