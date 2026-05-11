"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertOctagon, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="relative flex min-h-screen flex-col">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-radial-violet" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-noise opacity-[0.25]" />

      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
        <Link href="/" className="transition-opacity hover:opacity-80">
          <Logo />
        </Link>
      </header>

      <main className="flex flex-1 items-center justify-center px-6">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto mb-4 inline-flex size-12 items-center justify-center rounded-full bg-rose-500/10 text-rose-300 ring-1 ring-rose-500/20">
            <AlertOctagon className="size-5" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Something went wrong
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            We hit an unexpected error. Try again, or head back home if it keeps
            happening.
          </p>
          {error.digest && (
            <p className="mt-3 font-mono text-xs text-muted-foreground/60">
              Error ID: {error.digest}
            </p>
          )}
          <div className="mt-6 flex items-center justify-center gap-2">
            <Button variant="outline" onClick={() => reset()}>
              <RotateCcw className="size-4" />
              Try again
            </Button>
            <Button asChild>
              <Link href="/">Back home</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
