"use client";

import { useMemo } from "react";
import { TaskStatus } from "@prisma/client";
import { motion } from "framer-motion";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const STATUS_LABELS: Record<TaskStatus, string> = {
  TODO: "Todo",
  IN_PROGRESS: "In Progress",
  DONE: "Done",
};

const STATUS_COLORS: Record<TaskStatus, string> = {
  TODO: "#71717a", // zinc-500
  IN_PROGRESS: "#8b5cf6", // violet-500
  DONE: "#10b981", // emerald-500
};

export function StatusBreakdown({
  counts,
}: {
  counts: Record<TaskStatus, number>;
}) {
  const data = useMemo(
    () =>
      (Object.keys(counts) as TaskStatus[])
        .map((s) => ({
          name: STATUS_LABELS[s],
          value: counts[s],
          color: STATUS_COLORS[s],
          status: s,
        }))
        .filter((d) => d.value > 0),
    [counts],
  );

  const total = data.reduce((sum, d) => sum + d.value, 0);

  if (total === 0) {
    return (
      <div className="flex h-40 flex-col items-center justify-center rounded-md border border-dashed border-border/70 text-center">
        <p className="text-sm font-medium">No tasks yet</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Status breakdown will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center sm:gap-6">
      <div className="relative size-36 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              innerRadius={42}
              outerRadius={62}
              paddingAngle={2}
              stroke="hsl(var(--card))"
              strokeWidth={2}
              startAngle={90}
              endAngle={-270}
              isAnimationActive
              animationDuration={800}
              animationEasing="ease-out"
            >
              {data.map((d) => (
                <Cell key={d.status} fill={d.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
                borderRadius: 8,
                fontSize: 12,
                color: "hsl(var(--popover-foreground))",
              }}
              itemStyle={{ color: "hsl(var(--popover-foreground))" }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <motion.p
            className="text-2xl font-semibold tabular-nums"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
          >
            {total}
          </motion.p>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Total
          </p>
        </div>
      </div>

      <ul className="w-full min-w-0 flex-1 space-y-2">
        {data.map((d, i) => (
          <motion.li
            key={d.status}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + i * 0.08, duration: 0.3 }}
            className="flex items-center gap-3"
          >
            <span
              className="size-2 shrink-0 rounded-full"
              style={{ backgroundColor: d.color }}
            />
            <span className="min-w-0 flex-1 truncate text-sm">{d.name}</span>
            <span className="shrink-0 tabular-nums text-xs text-muted-foreground">
              {d.value}
            </span>
            <span className="shrink-0 tabular-nums text-xs font-medium text-foreground/80 min-w-[2.5rem] text-right">
              {Math.round((d.value / total) * 100)}%
            </span>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}
