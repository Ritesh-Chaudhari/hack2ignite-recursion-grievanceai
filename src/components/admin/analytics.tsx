"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
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
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.45 }}
      className="card p-5"
    >
      <h3 className="text-sm font-bold text-ink">{title}</h3>
      <p className="mb-3 text-xs text-muted">{subtitle}</p>
      <div className="h-56">{children}</div>
    </motion.div>
  );
}

export function Analytics({ grievances }: { grievances: Grievance[] }) {
  const byCategory = useMemo(
    () =>
      CATEGORIES.map((c) => ({
        name: c,
        count: grievances.filter((g) => g.category === c).length,
      })),
    [grievances],
  );

  const byPriority = useMemo(
    () =>
      PRIORITIES.map((p) => ({
        name: p,
        value: grievances.filter((g) => g.priority === p).length,
      })),
    [grievances],
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
      const count = grievances.filter((g) => {
        const t = new Date(g.createdAt).getTime();
        return t >= d.getTime() && t < next.getTime();
      }).length;
      buckets.push({
        day: d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
        count,
      });
    }
    return buckets;
  }, [grievances]);

  const total = grievances.length;

  return (
    <div className="grid gap-5 lg:grid-cols-3">
      <ChartCard
        title="Grievances by category"
        subtitle={`${total} total across ${CATEGORIES.length} departments`}
        delay={0}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={byCategory} margin={{ top: 8, right: 8, left: -22, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e4e8f1" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11, fill: "#5b6478" }}
              axisLine={false}
              tickLine={false}
              interval={0}
              angle={-20}
              dy={8}
            />
            <YAxis tick={{ fontSize: 11, fill: "#5b6478" }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip cursor={{ fill: "rgba(79,70,229,0.06)" }} contentStyle={{ borderRadius: 12, border: "1px solid #e4e8f1", fontSize: 12 }} />
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
              isAnimationActive
            >
              {byPriority.map((entry) => (
                <Cell key={entry.name} fill={PRIORITY_COLORS[entry.name]} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e4e8f1", fontSize: 12 }} />
          </PieChart>
        </ResponsiveContainer>
        <div className="mt-1 flex flex-wrap justify-center gap-3 text-xs font-medium text-muted">
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
            <CartesianGrid strokeDasharray="3 3" stroke="#e4e8f1" vertical={false} />
            <XAxis
              dataKey="day"
              tick={{ fontSize: 10, fill: "#5b6478" }}
              axisLine={false}
              tickLine={false}
              interval={2}
            />
            <YAxis tick={{ fontSize: 11, fill: "#5b6478" }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e4e8f1", fontSize: 12 }} />
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
}
