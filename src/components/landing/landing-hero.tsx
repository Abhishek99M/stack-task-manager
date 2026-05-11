"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";

export function LandingHero({ isLoggedIn }: { isLoggedIn: boolean }) {
  return (
    <section className="relative pt-20 pb-24 text-center">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/5 px-3 py-1 text-xs font-medium text-violet-300"
      >
        <span className="relative flex size-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-400 opacity-75" />
          <span className="relative inline-flex size-1.5 rounded-full bg-violet-400" />
        </span>
        New — drag-and-drop Kanban
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
        className="text-balance text-5xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-6xl md:text-7xl"
      >
        Task management,
        <br />
        <motion.span
          initial={{ backgroundPosition: "0% 50%" }}
          animate={{ backgroundPosition: "100% 50%" }}
          transition={{ duration: 6, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
          style={{
            backgroundImage:
              "linear-gradient(90deg, #c4b5fd, #8b5cf6, #a78bfa, #6d28d9, #a78bfa, #8b5cf6, #c4b5fd)",
            backgroundSize: "200% 100%",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          built for momentum.
        </motion.span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        className="mx-auto mt-6 max-w-xl text-balance text-base text-muted-foreground sm:text-lg"
      >
        Stack is a clean, fast task manager for small teams. Projects, tasks, and a
        beautiful Kanban — all wrapped in a dark interface that gets out of your way.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="mt-9 flex flex-wrap items-center justify-center gap-3"
      >
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
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mt-6 text-xs text-muted-foreground"
      >
        No credit card. Built end-to-end in two days.
      </motion.p>
    </section>
  );
}
