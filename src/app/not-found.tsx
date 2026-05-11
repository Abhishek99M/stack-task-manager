import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";

export default function NotFound() {
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
          <p className="text-sm font-medium text-violet-300">404</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Page not found
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            The page you&apos;re looking for doesn&apos;t exist or you may not have access to it.
          </p>
          <div className="mt-6 flex items-center justify-center gap-2">
            <Button asChild variant="outline">
              <Link href="/">
                <ArrowLeft className="size-4" />
                Back home
              </Link>
            </Button>
            <Button asChild>
              <Link href="/app">Open dashboard</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
