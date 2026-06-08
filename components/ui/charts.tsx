"use client";

import { useSyncExternalStore } from "react";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const attendanceColors = ["#6EE7B7", "#FB7185", "#60A5FA"];

function useMounted() {
  return useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );
}

export function AttendanceDonut({
  data,
}: {
  data: { name: string; value: number }[];
}) {
  const mounted = useMounted();

  if (!mounted) {
    return <div className="h-64 rounded-xl border border-border bg-white/[0.03]" />;
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} innerRadius={58} outerRadius={86} dataKey="value" paddingAngle={4}>
            {data.map((entry, index) => (
              <Cell key={entry.name} fill={attendanceColors[index % attendanceColors.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: "#111118",
              border: "1px solid #2A2A35",
              borderRadius: 12,
              color: "#F0F0F5",
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function HomeworkBarChart({
  data,
}: {
  data: { module: string; completed: number; total: number }[];
}) {
  const mounted = useMounted();

  if (!mounted) {
    return <div className="h-64 rounded-xl border border-border bg-white/[0.03]" />;
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey="module" stroke="#8888A0" tickLine={false} axisLine={false} />
          <YAxis stroke="#55556A" tickLine={false} axisLine={false} allowDecimals={false} />
          <Tooltip
            contentStyle={{
              background: "#111118",
              border: "1px solid #2A2A35",
              borderRadius: 12,
              color: "#F0F0F5",
            }}
          />
          <Bar dataKey="total" fill="#2A2A35" radius={[8, 8, 0, 0]} />
          <Bar dataKey="completed" fill="#6EE7B7" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
