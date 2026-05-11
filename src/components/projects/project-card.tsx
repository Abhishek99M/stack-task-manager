"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Role } from "@prisma/client";

import { Badge } from "@/components/ui/badge";
import { formatRelative } from "@/lib/utils";

export type ProjectCardData = {
  id: string;
  name: string;
  description: string | null;
  color: string;
  taskCount: number;
  memberCount: number;
  myRole: Role;
  updatedAt: Date | string;
};

export function ProjectCard({ project, index }: { project: ProjectCardData; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotX = useSpring(useTransform(my, [-1, 1], [4, -4]), { stiffness: 200, damping: 25 });
  const rotY = useSpring(useTransform(mx, [-1, 1], [-4, 4]), { stiffness: 200, damping: 25 });
  const glowX = useTransform(mx, [-1, 1], ["0%", "100%"]);
  const glowY = useTransform(my, [-1, 1], ["0%", "100%"]);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    mx.set(x * 2 - 1);
    my.set(y * 2 - 1);
  };
  const onLeave = () => {
    mx.set(0);
    my.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.04, ease: [0.16, 1, 0.3, 1] }}
      style={{
        rotateX: rotX,
        rotateY: rotY,
        transformPerspective: 1000,
      }}
      className="group relative"
    >
      <Link
        href={`/projects/${project.id}`}
        className="block overflow-hidden rounded-xl border border-border bg-card/40 p-5 transition-colors hover:border-violet-500/30 hover:bg-card/70"
      >
        <motion.div
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background: useTransform([glowX, glowY] as never, ([x, y]: string[]) =>
              `radial-gradient(280px circle at ${x} ${y}, hsl(263 75% 50% / 0.10), transparent 70%)`,
            ),
          }}
        />
        <div
          className="absolute inset-x-0 top-0 h-0.5"
          style={{ backgroundColor: project.color }}
        />
        <div className="relative flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-base font-semibold">{project.name}</h3>
            {project.description ? (
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                {project.description}
              </p>
            ) : (
              <p className="mt-1 text-sm italic text-muted-foreground/70">
                No description
              </p>
            )}
          </div>
          {project.myRole === Role.ADMIN && (
            <Badge variant="secondary" className="shrink-0 bg-violet-500/15 text-violet-300 ring-1 ring-violet-500/20">
              Admin
            </Badge>
          )}
        </div>

        <div className="relative mt-5 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            <span>{project.taskCount} task{project.taskCount === 1 ? "" : "s"}</span>
            <span className="size-1 rounded-full bg-border" />
            <span>{project.memberCount} member{project.memberCount === 1 ? "" : "s"}</span>
          </div>
          <span>Updated {formatRelative(project.updatedAt)}</span>
        </div>

        <ArrowRight className="absolute right-4 bottom-4 size-4 text-muted-foreground/50 opacity-0 transition-all group-hover:opacity-100 group-hover:text-violet-300" />
      </Link>
    </motion.div>
  );
}
