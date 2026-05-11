import { FolderKanban } from "lucide-react";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NewProjectButton } from "@/components/projects/new-project-button";
import { ProjectCard } from "@/components/projects/project-card";

export const metadata = { title: "Projects · Stack" };
export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const projects = await prisma.project.findMany({
    where: { memberships: { some: { userId: session.user.id } } },
    orderBy: { updatedAt: "desc" },
    include: {
      _count: { select: { tasks: true, memberships: true } },
      memberships: {
        where: { userId: session.user.id },
        select: { role: true },
        take: 1,
      },
    },
  });

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">All projects you can access</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">Projects</h1>
        </div>
        <NewProjectButton />
      </header>

      {projects.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p, i) => (
            <ProjectCard
              key={p.id}
              index={i}
              project={{
                id: p.id,
                name: p.name,
                description: p.description,
                color: p.color,
                taskCount: p._count.tasks,
                memberCount: p._count.memberships,
                myRole: p.memberships[0]?.role ?? "MEMBER",
                updatedAt: p.updatedAt,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card/20 p-10 text-center">
      <div className="mx-auto mb-4 inline-flex size-12 items-center justify-center rounded-full bg-violet-500/10 text-violet-300 ring-1 ring-violet-500/20">
        <FolderKanban className="size-5" />
      </div>
      <h2 className="text-base font-semibold">No projects yet</h2>
      <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
        Create your first project to start tracking tasks. You&apos;ll be the admin and
        can invite teammates.
      </p>
      <div className="mt-5">
        <NewProjectButton />
      </div>
    </div>
  );
}
