import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Kanban,
  LayoutDashboard,
  Lock,
  Users,
  Zap,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { auth } from "@/auth";

export default async function HomePage() {
  const session = await auth();
  const isLoggedIn = !!session?.user;

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-radial-violet" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-grid opacity-30 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-noise opacity-[0.3]" />

      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Logo />
        <nav className="flex items-center gap-2">
          {isLoggedIn ? (
            <Button asChild size="sm">
              <Link href="/app">
                Open app <ArrowRight className="ml-1 size-4" />
              </Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/login">Sign in</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/signup">
                  Get started <ArrowRight className="ml-1 size-4" />
                </Link>
              </Button>
            </>
          )}
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-6 pb-24">
        <section className="pt-20 pb-24 text-center">
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/5 px-3 py-1 text-xs font-medium text-violet-300">
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-400 opacity-75" />
              <span className="relative inline-flex size-1.5 rounded-full bg-violet-400" />
            </span>
            New — drag-and-drop Kanban
          </div>

          <h1 className="text-balance text-5xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-6xl md:text-7xl">
            Task management,
            <br />
            <span className="bg-gradient-to-br from-violet-300 via-violet-400 to-violet-600 bg-clip-text text-transparent">
              built for momentum.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-balance text-base text-muted-foreground sm:text-lg">
            Stack is a clean, fast task manager for small teams. Projects, tasks, and a
            beautiful Kanban — all wrapped in a dark interface that gets out of your way.
          </p>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" className="h-11 px-6 shadow-lg shadow-violet-600/25">
              <Link href={isLoggedIn ? "/app" : "/signup"}>
                Start for free <ArrowRight className="ml-1 size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-11 px-6">
              <Link href={isLoggedIn ? "/app" : "/login"}>
                {isLoggedIn ? "Go to dashboard" : "Sign in"}
              </Link>
            </Button>
          </div>

          <p className="mt-6 text-xs text-muted-foreground">
            No credit card. Built end-to-end in two days.
          </p>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Feature
            icon={<Kanban className="size-5" />}
            title="Drag-and-drop Kanban"
            description="Move tasks between Todo, In Progress, and Done with buttery-smooth animation."
          />
          <Feature
            icon={<Users className="size-5" />}
            title="Teams + roles"
            description="Invite members, assign tasks, and control access with Admin/Member roles."
          />
          <Feature
            icon={<LayoutDashboard className="size-5" />}
            title="Dashboard at a glance"
            description="See your tasks, overdue work, and project status — all in one place."
          />
          <Feature
            icon={<Zap className="size-5" />}
            title="Optimistic UI"
            description="Every interaction feels instant. No waiting on the network."
          />
          <Feature
            icon={<Lock className="size-5" />}
            title="Secure by default"
            description="Hashed credentials, JWT sessions, route-level RBAC. Production-grade auth."
          />
          <Feature
            icon={<CheckCircle2 className="size-5" />}
            title="Stay on top of deadlines"
            description="Due dates with overdue highlighting, so nothing slips through the cracks."
          />
        </section>
      </main>

      <footer className="mx-auto max-w-6xl border-t border-border/60 px-6 py-8 text-xs text-muted-foreground">
        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
          <div className="flex items-center gap-2">
            <Logo showWord={false} />
            <span>Stack — Built with Next.js, Postgres, and good intentions.</span>
          </div>
          <span>© {new Date().getFullYear()}</span>
        </div>
      </footer>
    </div>
  );
}

function Feature({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-border bg-card/40 p-5 transition-colors hover:border-violet-500/30 hover:bg-card/70">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-violet-500/[0.04] to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
      <div className="mb-3 inline-flex size-9 items-center justify-center rounded-md bg-violet-500/10 text-violet-300 ring-1 ring-violet-500/20">
        {icon}
      </div>
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{description}</p>
    </div>
  );
}
