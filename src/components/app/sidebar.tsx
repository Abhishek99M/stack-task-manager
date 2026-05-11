"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { FolderKanban, LayoutDashboard } from "lucide-react";

import { cn } from "@/lib/utils";
import { Logo } from "@/components/logo";
import { NewProjectButton } from "@/components/projects/new-project-button";

const navItems = [
  { href: "/app", label: "Dashboard", icon: LayoutDashboard },
  { href: "/projects", label: "Projects", icon: FolderKanban },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-border bg-card/40 backdrop-blur md:flex">
      <div className="flex h-14 items-center border-b border-border px-4">
        <Link href="/app" className="transition-opacity hover:opacity-80">
          <Logo />
        </Link>
      </div>

      <nav className="flex-1 space-y-0.5 p-3">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/app" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "text-foreground"
                  : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
              )}
            >
              {isActive && (
                <motion.span
                  layoutId="sidebar-active"
                  className="absolute inset-0 rounded-md bg-accent ring-1 ring-violet-500/15"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <Icon className="relative size-4" />
              <span className="relative">{item.label}</span>
              {isActive && (
                <span className="relative ml-auto size-1.5 rounded-full bg-violet-400 shadow-[0_0_8px_hsl(263_75%_60%)]" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-3">
        <NewProjectButton variant="sidebar" />
      </div>
    </aside>
  );
}
