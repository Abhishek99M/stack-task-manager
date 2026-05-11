import Link from "next/link";
import { redirect } from "next/navigation";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  FolderKanban,
  ListChecks,
} from "lucide-react";
import { TaskStatus } from "@prisma/client";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CountUp } from "@/components/ui/count-up";
import { Separator } from "@/components/ui/separator";
import { StatusBreakdown } from "@/components/dashboard/status-breakdown";
import { cn, formatRelative, isOverdue } from "@/lib/utils";

export const metadata = { title: "Dashboard · Stack" };
export const dynamic = "force-dynamic";

export default async function DashboardHomePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - 7);

  const [
    assignedToMe,
    overdueCount,
    completedThisWeek,
    projects,
    statusCounts,
    upcomingTasks,
    overdueTasks,
  ] = await Promise.all([
    prisma.task.count({
      where: { assigneeId: userId, status: { not: TaskStatus.DONE } },
    }),
    prisma.task.count({
      where: {
        assigneeId: userId,
        status: { not: TaskStatus.DONE },
        dueDate: { lt: new Date() },
      },
    }),
    prisma.task.count({
      where: {
        assigneeId: userId,
        status: TaskStatus.DONE,
        updatedAt: { gte: startOfWeek },
      },
    }),
    prisma.project.findMany({
      where: { memberships: { some: { userId } } },
      orderBy: { updatedAt: "desc" },
      take: 5,
      include: {
        _count: { select: { tasks: true } },
      },
    }),
    prisma.task.groupBy({
      by: ["status"],
      where: {
        project: { memberships: { some: { userId } } },
      },
      _count: { _all: true },
    }),
    prisma.task.findMany({
      where: {
        assigneeId: userId,
        status: { not: TaskStatus.DONE },
        dueDate: { gte: new Date() },
      },
      orderBy: { dueDate: "asc" },
      take: 5,
      include: {
        project: { select: { id: true, name: true, color: true } },
      },
    }),
    prisma.task.findMany({
      where: {
        assigneeId: userId,
        status: { not: TaskStatus.DONE },
        dueDate: { lt: new Date() },
      },
      orderBy: { dueDate: "asc" },
      take: 5,
      include: {
        project: { select: { id: true, name: true, color: true } },
      },
    }),
  ]);

  const statusMap: Record<TaskStatus, number> = {
    TODO: 0,
    IN_PROGRESS: 0,
    DONE: 0,
  };
  for (const row of statusCounts) statusMap[row.status] = row._count._all;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">
            Welcome back, {session.user.name?.split(" ")[0] ?? "there"}.
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">Dashboard</h1>
        </div>
        <Button asChild>
          <Link href="/projects">
            All projects <ArrowRight className="size-4" />
          </Link>
        </Button>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="My open tasks"
          value={assignedToMe}
          icon={<ListChecks className="size-4" />}
          tone="violet"
        />
        <StatCard
          label="Overdue"
          value={overdueCount}
          icon={<AlertTriangle className="size-4" />}
          tone={overdueCount > 0 ? "rose" : "muted"}
        />
        <StatCard
          label="Done this week"
          value={completedThisWeek}
          icon={<CheckCircle2 className="size-4" />}
          tone="emerald"
        />
        <StatCard
          label="My projects"
          value={projects.length}
          icon={<FolderKanban className="size-4" />}
          tone="sky"
        />
      </section>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel
          title="Tasks by status"
          subtitle="Across all your projects"
          className="lg:col-span-1"
        >
          <StatusBreakdown counts={statusMap} />
        </Panel>

        <Panel
          title="Upcoming"
          subtitle="Tasks assigned to you with a due date"
          className="lg:col-span-2"
        >
          {upcomingTasks.length === 0 ? (
            <EmptyPanel
              icon={<Clock className="size-4" />}
              line1="Nothing scheduled"
              line2="Tasks with due dates will appear here."
            />
          ) : (
            <ul className="-mx-2 -my-1 space-y-0.5">
              {upcomingTasks.map((t) => (
                <TaskRow key={t.id} task={t} />
              ))}
            </ul>
          )}
        </Panel>

        <Panel
          title="Overdue"
          subtitle="Past due and still open"
          className="lg:col-span-2"
          accent="rose"
        >
          {overdueTasks.length === 0 ? (
            <EmptyPanel
              icon={<CheckCircle2 className="size-4" />}
              line1="Nothing overdue"
              line2="Great — you&apos;re on top of things."
            />
          ) : (
            <ul className="-mx-2 -my-1 space-y-0.5">
              {overdueTasks.map((t) => (
                <TaskRow key={t.id} task={t} overdue />
              ))}
            </ul>
          )}
        </Panel>

        <Panel
          title="Recent projects"
          subtitle="Updated most recently"
          className="lg:col-span-1"
        >
          {projects.length === 0 ? (
            <EmptyPanel
              icon={<FolderKanban className="size-4" />}
              line1="No projects yet"
              line2="Create one to get started."
            />
          ) : (
            <ul className="-mx-2 -my-1 space-y-0.5">
              {projects.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/projects/${p.id}`}
                    className="group flex items-center gap-2.5 rounded-md p-2 transition-colors hover:bg-accent/50"
                  >
                    <span
                      className="size-2 rounded-full"
                      style={{ backgroundColor: p.color }}
                    />
                    <span className="min-w-0 flex-1 truncate text-sm font-medium">
                      {p.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {p._count.tasks}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  tone: "violet" | "rose" | "emerald" | "sky" | "muted";
}) {
  const tones: Record<string, { iconBg: string; glow: string }> = {
    violet: {
      iconBg: "bg-violet-500/10 text-violet-300 ring-violet-500/20",
      glow: "from-violet-500/[0.07] to-transparent",
    },
    rose: {
      iconBg: "bg-rose-500/10 text-rose-300 ring-rose-500/20",
      glow: "from-rose-500/[0.07] to-transparent",
    },
    emerald: {
      iconBg: "bg-emerald-500/10 text-emerald-300 ring-emerald-500/20",
      glow: "from-emerald-500/[0.07] to-transparent",
    },
    sky: {
      iconBg: "bg-sky-500/10 text-sky-300 ring-sky-500/20",
      glow: "from-sky-500/[0.07] to-transparent",
    },
    muted: {
      iconBg: "bg-accent text-muted-foreground ring-border",
      glow: "from-transparent to-transparent",
    },
  };
  const t = tones[tone];
  return (
    <div className="group relative overflow-hidden rounded-xl border border-border bg-card/40 p-4 transition-colors hover:border-border/80 hover:bg-card/60">
      <div className={cn("pointer-events-none absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity group-hover:opacity-100", t.glow)} />
      <div className="relative flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <span className={cn("inline-flex size-7 items-center justify-center rounded-md ring-1 transition-transform group-hover:scale-110", t.iconBg)}>
          {icon}
        </span>
      </div>
      <p className="relative mt-2 text-3xl font-semibold tabular-nums">
        <CountUp value={value} />
      </p>
    </div>
  );
}

function Panel({
  title,
  subtitle,
  children,
  className,
  accent,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  accent?: "rose";
}) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-card/40 p-4",
        accent === "rose" ? "border-rose-500/20" : "border-border",
        className,
      )}
    >
      <div className="mb-3 flex items-start justify-between">
        <div>
          <h3 className="text-sm font-semibold">{title}</h3>
          {subtitle && (
            <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
      </div>
      <Separator className="mb-3 opacity-50" />
      {children}
    </div>
  );
}

function EmptyPanel({
  icon,
  line1,
  line2,
}: {
  icon: React.ReactNode;
  line1: string;
  line2: string;
}) {
  return (
    <div className="rounded-md border border-dashed border-border/70 px-3 py-6 text-center">
      <div className="mx-auto mb-2 inline-flex size-7 items-center justify-center rounded-md bg-accent text-muted-foreground ring-1 ring-border">
        {icon}
      </div>
      <p className="text-sm font-medium">{line1}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">{line2}</p>
    </div>
  );
}

type DashTask = {
  id: string;
  title: string;
  status: TaskStatus;
  dueDate: Date | null;
  project: { id: string; name: string; color: string };
};

function TaskRow({ task, overdue }: { task: DashTask; overdue?: boolean }) {
  const isOver = overdue ?? isOverdue(task.dueDate, task.status);
  return (
    <li>
      <Link
        href={`/projects/${task.project.id}`}
        className="group flex items-center gap-2.5 rounded-md p-2 transition-colors hover:bg-accent/50"
      >
        <span
          className="size-2 shrink-0 rounded-full"
          style={{ backgroundColor: task.project.color }}
        />
        <span className="min-w-0 flex-1 truncate text-sm font-medium">
          {task.title}
        </span>
        <span className="hidden truncate text-xs text-muted-foreground sm:inline">
          {task.project.name}
        </span>
        <Badge
          variant="outline"
          className={cn(
            "shrink-0 text-[10px]",
            isOver && "border-rose-500/30 bg-rose-500/10 text-rose-300",
          )}
        >
          {formatRelative(task.dueDate)}
        </Badge>
      </Link>
    </li>
  );
}
