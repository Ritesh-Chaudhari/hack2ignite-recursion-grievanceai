"use client";

import { memo, useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CATEGORIES, PRIORITIES } from "@/lib/constants";
import type { Grievance } from "@/lib/types";

const CATEGORY_COLORS = [
  "#0284c7",
  "#ea580c",
  "#d97706",
  "#059669",
  "#e11d48",
  "#64748b",
];
const PRIORITY_COLORS: Record<string, string> = {
  Urgent: "#dc2626",
  High: "#d97706",
  Medium: "#2563eb",
  Low: "#059669",
};

function ChartCard({
  title,
  subtitle,
  children,
  delay = 0,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <div
      className="card animate-fade-up p-5"
      style={{ animationDelay: `${delay * 1000}ms` }}
    >
      <h3 className="text-sm font-bold text-ink">{title}</h3>
      <p className="mb-3 text-xs text-primary/70">{subtitle}</p>
      <div className="h-56">{children}</div>
    </div>
  );
}

export const Analytics = memo(function Analytics({
  grievances,
  filterCategory,
}: {
  grievances: Grievance[];
  filterCategory?: string;
}) {
  // Apply optional department/category filter
  const filtered = useMemo(() => {
    if (!filterCategory || filterCategory === "all") return grievances;
    return grievances.filter((g) => g.category === filterCategory);
  }, [grievances, filterCategory]);

  const byCategory = useMemo(
    () =>
      CATEGORIES.map((c) => ({
        name: c,
        count: filtered.filter((g) => g.category === c).length,
      })),
    [filtered],
  );

  const byPriority = useMemo(
    () =>
      PRIORITIES.map((p) => ({
        name: p,
        value: filtered.filter((g) => g.priority === p).length,
      })),
    [filtered],
  );

  const overTime = useMemo(() => {
    const days = 14;
    const buckets: Array<{ day: string; count: number }> = [];
    for (let i = days - 1; i >= 0; i -= 1) {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - i);
      const next = new Date(d);
      next.setDate(next.getDate() + 1);
      const count = filtered.filter((g) => {
        const t = new Date(g.createdAt).getTime();
        return t >= d.getTime() && t < next.getTime();
      }).length;
      buckets.push({
        day: d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
        count,
      });
    }
    return buckets;
  }, [filtered]);

  const total = filtered.length;

  return (
    <div className="grid gap-5 lg:grid-cols-3">
      <ChartCard
        title="Grievances by category"
        subtitle={`${total} total across ${CATEGORIES.length} departments`}
        delay={0}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={byCategory} margin={{ top: 8, right: 8, left: -22, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#d1d5e0" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11, fill: "#475569" }}
              axisLine={false}
              tickLine={false}
              interval={0}
              angle={-20}
              dy={8}
            />
            <YAxis tick={{ fontSize: 11, fill: "#475569" }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip cursor={{ fill: "rgba(79,70,229,0.06)" }} contentStyle={{ borderRadius: 12, border: "1px solid #d1d5e0", fontSize: 12 }} />
            <Bar dataKey="count" radius={[6, 6, 0, 0]}>
              {byCategory.map((entry, i) => (
                <Cell key={entry.name} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard
        title="Priority mix"
        subtitle="Share of grievances by urgency"
        delay={0.08}
      >
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={byPriority}
              dataKey="value"
              nameKey="name"
              innerRadius={48}
              outerRadius={76}
              paddingAngle={3}
              strokeWidth={0}
              isAnimationActive={false}
            >
              {byPriority.map((entry) => (
                <Cell key={entry.name} fill={PRIORITY_COLORS[entry.name]} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #d1d5e0", fontSize: 12 }} />
          </PieChart>
        </ResponsiveContainer>
        <div className="mt-1 flex flex-wrap justify-center gap-3 text-xs font-medium text-primary/70">
          {byPriority.map((p) => (
            <span key={p.name} className="inline-flex items-center gap-1.5">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: PRIORITY_COLORS[p.name] }}
              />
              {p.name} ({p.value})
            </span>
          ))}
        </div>
      </ChartCard>

      <ChartCard
        title="Last 14 days"
        subtitle="Grievances received per day"
        delay={0.16}
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={overTime} margin={{ top: 8, right: 8, left: -22, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#d1d5e0" vertical={false} />
            <XAxis
              dataKey="day"
              tick={{ fontSize: 10, fill: "#475569" }}
              axisLine={false}
              tickLine={false}
              interval={2}
            />
            <YAxis tick={{ fontSize: 11, fill: "#475569" }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #d1d5e0", fontSize: 12 }} />
            <Line
              type="monotone"
              dataKey="count"
              stroke="#4f46e5"
              strokeWidth={2.5}
              dot={{ r: 3, fill: "#4f46e5" }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
});
