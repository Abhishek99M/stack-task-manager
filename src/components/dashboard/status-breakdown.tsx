"use client";

import { useMemo } from "react";
import { TaskStatus } from "@prisma/client";
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
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
      <div className="relative h-40 w-40 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              innerRadius={48}
              outerRadius={70}
              paddingAngle={2}
              stroke="hsl(var(--card))"
              strokeWidth={2}
              startAngle={90}
              endAngle={-270}
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
          <p className="text-2xl font-semibold tabular-nums">{total}</p>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Total
          </p>
        </div>
      </div>

      <ul className="flex flex-1 flex-col gap-1.5">
        {data.map((d) => (
          <li key={d.status} className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2">
              <span
                className="size-2 shrink-0 rounded-full"
                style={{ backgroundColor: d.color }}
              />
              <span className="truncate text-sm">{d.name}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="tabular-nums">{d.value}</span>
              <span>·</span>
              <span className="tabular-nums">
                {Math.round((d.value / total) * 100)}%
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
