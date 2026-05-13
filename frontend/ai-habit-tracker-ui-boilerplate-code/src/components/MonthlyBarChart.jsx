import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { useTheme } from "../context/ThemeContext.jsx";

export default function MonthlyBarChart({ data }) {
  const { theme } = useTheme();
  const grid = theme === "dark" ? "rgba(255,255,255,0.08)" : "rgba(15,15,27,0.08)";
  const tick = theme === "dark" ? "#8a8aa0" : "#6b6b78";
  return (
    <div className="card p-5">
      <div className="text-sm font-medium mb-3">Last 30 days</div>
      <div style={{ width: "100%", height: 240 }}>
        <ResponsiveContainer>
          <BarChart data={data}>
            <defs>
              <linearGradient id="monbar" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#fde68a" />
                <stop offset="100%" stopColor="#f59e0b" />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={grid} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: tick }}
              axisLine={false}
              tickLine={false}
              interval={3}
            />
            <YAxis
              tick={{ fontSize: 12, fill: tick }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip
              cursor={{ fill: theme === "dark" ? "rgba(255,255,255,0.04)" : "rgba(15,15,27,0.04)" }}
              contentStyle={{
                background: theme === "dark" ? "rgba(20,20,36,0.95)" : "rgba(255,255,255,0.95)",
                border: `1px solid ${grid}`,
                borderRadius: 12,
                fontSize: 12,
                color: theme === "dark" ? "#ebebf5" : "#13131b",
                backdropFilter: "blur(12px)",
              }}
            />
            <Bar dataKey="count" fill="url(#monbar)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
