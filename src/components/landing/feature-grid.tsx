"use client";

import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import {
  CheckCircle2,
  Kanban,
  LayoutDashboard,
  Lock,
  Users,
  Zap,
} from "lucide-react";

const features = [
  {
    icon: <Kanban className="size-5" />,
    title: "Drag-and-drop Kanban",
    description: "Move tasks between Todo, In Progress, and Done with buttery-smooth animation.",
  },
  {
    icon: <Users className="size-5" />,
    title: "Teams + roles",
    description: "Invite members, assign tasks, and control access with Admin/Member roles.",
  },
  {
    icon: <LayoutDashboard className="size-5" />,
    title: "Dashboard at a glance",
    description: "See your tasks, overdue work, and project status — all in one place.",
  },
  {
    icon: <Zap className="size-5" />,
    title: "Optimistic UI",
    description: "Every interaction feels instant. No waiting on the network.",
  },
  {
    icon: <Lock className="size-5" />,
    title: "Secure by default",
    description: "Hashed credentials, JWT sessions, route-level RBAC. Production-grade auth.",
  },
  {
    icon: <CheckCircle2 className="size-5" />,
    title: "Stay on top of deadlines",
    description: "Due dates with overdue highlighting, so nothing slips through the cracks.",
  },
];

export function FeatureGrid() {
  return (
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {features.map((f, i) => (
        <FeatureCard key={f.title} {...f} index={i} />
      ))}
    </section>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  index,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 150, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 150, damping: 20 });
  const gradientX = useTransform(springX, (v) => `${v}px`);
  const gradientY = useTransform(springY, (v) => `${v}px`);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
      className="group relative overflow-hidden rounded-xl border border-border bg-card/40 p-5 transition-colors hover:border-violet-500/30 hover:bg-card/70"
    >
      <motion.div
        className="pointer-events-none absolute -inset-px opacity-0 transition-opacity group-hover:opacity-100"
        style={{
          background: useTransform(
            [gradientX, gradientY] as never,
            ([x, y]: number[]) =>
              `radial-gradient(280px circle at ${x}px ${y}px, hsl(263 75% 50% / 0.12), transparent 70%)`,
          ),
        }}
      />
      <div className="relative">
        <div className="mb-3 inline-flex size-9 items-center justify-center rounded-md bg-violet-500/10 text-violet-300 ring-1 ring-violet-500/20 transition-transform group-hover:scale-110">
          {icon}
        </div>
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{description}</p>
      </div>
    </motion.div>
  );
}
