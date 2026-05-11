import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { LandingHero } from "@/components/landing/landing-hero";
import { FeatureGrid } from "@/components/landing/feature-grid";
import { auth } from "@/auth";

export default async function HomePage() {
  const session = await auth();
  const isLoggedIn = !!session?.user;

  return (
    <div className="relative min-h-screen overflow-hidden">
      <FloatingGlow />
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
        <LandingHero isLoggedIn={isLoggedIn} />
        <FeatureGrid />
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

function FloatingGlow() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div
        className="absolute left-1/2 top-0 size-[1000px] -translate-x-1/2 -translate-y-1/2 animate-[slow-float_18s_ease-in-out_infinite]"
        style={{
          background:
            "radial-gradient(circle at center, hsl(263 75% 50% / 0.22), transparent 60%)",
        }}
      />
    </div>
  );
}
