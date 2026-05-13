import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { TypeStat } from "@/types";

interface DonutChartProps {
  data: TypeStat[];
}

export function DonutChart({ data }: DonutChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="rounded-lg border border-border-subtle bg-bg-surface p-4">
      <div className="mb-4">
        <h2 className="font-heading text-lg font-bold text-text-primary">Work Type Mix</h2>
        <p className="text-sm text-text-muted">Task vs Meeting vs Time Log</p>
      </div>
      <div className="relative h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius={62} outerRadius={92} paddingAngle={4}>
              {data.map((item) => (
                <Cell key={item.name} fill={item.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: "rgb(var(--color-bg-surface))",
                border: "1px solid rgb(var(--color-border-subtle))",
                borderRadius: 8,
                color: "rgb(var(--color-text-primary))"
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-heading text-3xl font-bold text-text-primary">{total}</span>
          <span className="text-xs font-semibold text-text-muted">total</span>
        </div>
      </div>
      <div className="mt-2 grid grid-cols-3 gap-2">
        {data.map((item) => (
          <div key={item.name} className="rounded-lg bg-bg-elevated p-2 text-center">
            <span className="mx-auto block h-2 w-8 rounded-full" style={{ backgroundColor: item.color }} />
            <p className="mt-2 text-xs font-semibold text-text-muted">{item.name}</p>
            <p className="font-heading text-lg font-bold text-text-primary">{total ? Math.round((item.value / total) * 100) : 0}%</p>
          </div>
        ))}
      </div>
    </div>
  );
}
