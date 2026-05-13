import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { WeekDayStat } from "@/types";

interface WeekBarChartProps {
  data: WeekDayStat[];
}

function colorForCount(count: number) {
  if (count >= 5) return "#34d399";
  if (count >= 2) return "#6c8fff";
  return "#5a6278";
}

export function WeekBarChart({ data }: WeekBarChartProps) {
  return (
    <div className="h-72 rounded-lg border border-border-subtle bg-bg-surface p-4">
      <div className="mb-4">
        <h2 className="font-heading text-lg font-bold text-text-primary">Last 7 Days</h2>
        <p className="text-sm text-text-muted">Entries per day</p>
      </div>
      <ResponsiveContainer width="100%" height="78%">
        <BarChart data={data}>
          <CartesianGrid stroke="rgba(155, 163, 184, 0.16)" vertical={false} />
          <XAxis dataKey="label" tick={{ fill: "rgb(var(--color-text-muted))", fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis allowDecimals={false} tick={{ fill: "rgb(var(--color-text-muted))", fontSize: 12 }} axisLine={false} tickLine={false} width={28} />
          <Tooltip
            cursor={{ fill: "rgba(108, 143, 255, 0.08)" }}
            contentStyle={{
              background: "rgb(var(--color-bg-surface))",
              border: "1px solid rgb(var(--color-border-subtle))",
              borderRadius: 8,
              color: "rgb(var(--color-text-primary))"
            }}
          />
          <Bar dataKey="count" radius={[8, 8, 2, 2]}>
            {data.map((item) => (
              <Cell key={item.date} fill={colorForCount(item.count)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
