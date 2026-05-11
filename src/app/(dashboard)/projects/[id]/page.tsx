import { notFound, redirect } from "next/navigation";
import { Role } from "@prisma/client";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MembersPanel } from "@/components/projects/members-panel";
import { ProjectActions } from "@/components/projects/project-actions";
import { KanbanBoard } from "@/components/kanban/kanban-board";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Params) {
  const { id } = await params;
  const project = await prisma.project.findUnique({
    where: { id },
    select: { name: true },
  });
  return { title: `${project?.name ?? "Project"} · Stack` };
}

export default async function ProjectPage({ params }: Params) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      memberships: {
        orderBy: { joinedAt: "asc" },
        include: {
          user: { select: { id: true, name: true, email: true, image: true } },
        },
      },
      tasks: {
        orderBy: [{ status: "asc" }, { order: "asc" }, { createdAt: "asc" }],
        include: {
          assignee: { select: { id: true, name: true, email: true, image: true } },
        },
      },
    },
  });

  if (!project) notFound();

  const myMembership = project.memberships.find((m) => m.userId === session.user.id);
  if (!myMembership) notFound();

  const isAdmin = myMembership.role === Role.ADMIN;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2.5">
            <span
              className="size-2.5 rounded-full"
              style={{
                backgroundColor: project.color,
                boxShadow: `0 0 12px ${project.color}66`,
              }}
            />
            <h1 className="truncate text-2xl font-semibold tracking-tight">
              {project.name}
            </h1>
            {isAdmin && (
              <Badge variant="secondary" className="bg-violet-500/15 text-violet-300 ring-1 ring-violet-500/20">
                Admin
              </Badge>
            )}
          </div>
          {project.description && (
            <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">
              {project.description}
            </p>
          )}
        </div>

        {isAdmin && <ProjectActions projectId={project.id} projectName={project.name} />}
      </header>

      <Separator />

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <section className="min-w-0 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-muted-foreground">Board</h2>
            <span className="text-xs text-muted-foreground">
              {project.tasks.length} task{project.tasks.length === 1 ? "" : "s"}
            </span>
          </div>
          <KanbanBoard
            projectId={project.id}
            initialTasks={project.tasks}
            members={project.memberships.map((m) => m.user)}
            isAdmin={isAdmin}
            currentUserId={session.user.id}
          />
        </section>

        <aside className="space-y-6 lg:sticky lg:top-20 lg:self-start">
          <MembersPanel
            projectId={project.id}
            initialMembers={project.memberships}
            isAdmin={isAdmin}
            currentUserId={session.user.id}
          />
        </aside>
      </div>
    </div>
  );
}
