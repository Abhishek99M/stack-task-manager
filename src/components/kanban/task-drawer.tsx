"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import { TaskPriority, TaskStatus } from "@prisma/client";
import { toast } from "sonner";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { initials } from "@/lib/utils";
import type { KanbanMember, KanbanTask } from "./kanban-board";

const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: "TODO", label: "Todo" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "DONE", label: "Done" },
];

const PRIORITY_OPTIONS: { value: TaskPriority; label: string; tone: string }[] = [
  { value: "LOW", label: "Low", tone: "text-zinc-400" },
  { value: "MEDIUM", label: "Medium", tone: "text-sky-400" },
  { value: "HIGH", label: "High", tone: "text-amber-400" },
  { value: "URGENT", label: "Urgent", tone: "text-rose-400" },
];

const UNASSIGNED = "__unassigned__";

function toDateInputValue(date: Date | string | null | undefined) {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function TaskDrawer({
  task,
  members,
  currentUserId,
  isAdmin,
  onClose,
  onUpdate,
  onDelete,
}: {
  task: KanbanTask | null;
  members: KanbanMember[];
  currentUserId: string;
  isAdmin: boolean;
  onClose: () => void;
  onUpdate: (task: KanbanTask) => void;
  onDelete: (taskId: string) => void;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(task?.title ?? "");
  const [description, setDescription] = useState(task?.description ?? "");
  const [status, setStatus] = useState<TaskStatus>(task?.status ?? "TODO");
  const [priority, setPriority] = useState<TaskPriority>(task?.priority ?? "MEDIUM");
  const [dueDate, setDueDate] = useState(toDateInputValue(task?.dueDate));
  const [assigneeId, setAssigneeId] = useState<string>(task?.assigneeId ?? UNASSIGNED);
  const [saving, startSave] = useTransition();
  const [deleting, startDelete] = useTransition();

  void currentUserId;
  void isAdmin;

  useEffect(() => {
    if (!task) return;
    setTitle(task.title);
    setDescription(task.description ?? "");
    setStatus(task.status);
    setPriority(task.priority);
    setDueDate(toDateInputValue(task.dueDate));
    setAssigneeId(task.assigneeId ?? UNASSIGNED);
  }, [task]);

  if (!task) return <Sheet open={false} onOpenChange={() => onClose()} />;

  const handleSave = () => {
    if (!title.trim()) {
      toast.error("Title can't be empty.");
      return;
    }
    const payload = {
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      assigneeId: assigneeId === UNASSIGNED ? null : assigneeId,
    };
    startSave(async () => {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error("Couldn't save task", { description: data.error });
        return;
      }
      onUpdate(data.task);
      toast.success("Task updated");
      router.refresh();
      onClose();
    });
  };

  const handleDelete = () => {
    startDelete(async () => {
      const res = await fetch(`/api/tasks/${task.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error("Couldn't delete task", { description: data.error });
        return;
      }
      onDelete(task.id);
      toast.success("Task deleted");
      router.refresh();
    });
  };

  return (
    <Sheet open onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full px-6 py-6 sm:max-w-md sm:px-6">
        <SheetHeader className="px-0">
          <SheetTitle>Edit task</SheetTitle>
          <SheetDescription>
            Update the task details. Changes save when you press Save.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-4 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="task-title">Title</Label>
            <Input
              id="task-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={200}
              placeholder="What needs to get done?"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="task-description">Description</Label>
            <Textarea
              id="task-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              maxLength={2000}
              placeholder="Add more context, links, or acceptance criteria…"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as TaskStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as TaskPriority)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITY_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      <span className={o.tone}>{o.label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="task-due">Due date</Label>
              <Input
                id="task-due"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Assignee</Label>
              <Select value={assigneeId} onValueChange={setAssigneeId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={UNASSIGNED}>
                    <span className="text-muted-foreground">Unassigned</span>
                  </SelectItem>
                  {members.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      <span className="flex items-center gap-2">
                        <Avatar className="size-5">
                          <AvatarFallback className="bg-violet-500/15 text-[9px] font-medium text-violet-300">
                            {initials(m.name)}
                          </AvatarFallback>
                        </Avatar>
                        {m.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <SheetFooter className="mt-6 flex-row items-center justify-between px-0">
          <Button variant="ghost" size="sm" onClick={handleDelete} disabled={deleting} className="text-destructive hover:bg-destructive/10 hover:text-destructive">
            {deleting ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
            Delete
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving} className="shadow-lg shadow-violet-600/20">
              {saving && <Loader2 className="size-4 animate-spin" />}
              {saving ? "Saving…" : "Save"}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
