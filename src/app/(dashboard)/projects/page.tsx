import Link from "next/link";
import { ArrowRight, FolderKanban } from "lucide-react";

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { NewProjectButton } from "@/components/projects/new-project-button";
import { formatRelative } from "@/lib/utils";

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

      {projects.length === 0 ? <EmptyState /> : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <Link
              key={p.id}
              href={`/projects/${p.id}`}
              className="group relative overflow-hidden rounded-xl border border-border bg-card/40 p-5 transition-all hover:border-violet-500/30 hover:bg-card/70"
            >
              <div
                className="absolute inset-x-0 top-0 h-0.5"
                style={{ backgroundColor: p.color }}
              />
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-base font-semibold">{p.name}</h3>
                  {p.description ? (
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                      {p.description}
                    </p>
                  ) : (
                    <p className="mt-1 text-sm italic text-muted-foreground/70">
                      No description
                    </p>
                  )}
                </div>
                {p.memberships[0]?.role === Role.ADMIN && (
                  <Badge variant="secondary" className="shrink-0 bg-violet-500/15 text-violet-300 ring-1 ring-violet-500/20">
                    Admin
                  </Badge>
                )}
              </div>

              <div className="mt-5 flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-3">
                  <span>{p._count.tasks} task{p._count.tasks === 1 ? "" : "s"}</span>
                  <span className="size-1 rounded-full bg-border" />
                  <span>{p._count.memberships} member{p._count.memberships === 1 ? "" : "s"}</span>
                </div>
                <span>Updated {formatRelative(p.updatedAt)}</span>
              </div>

              <ArrowRight className="absolute right-4 bottom-4 size-4 text-muted-foreground/50 opacity-0 transition-all group-hover:opacity-100 group-hover:text-violet-300" />
            </Link>
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
