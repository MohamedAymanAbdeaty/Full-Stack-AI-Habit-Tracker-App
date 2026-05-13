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

export default function WeeklyBarChart({ data, title = "Last 7 days" }) {
  const { theme } = useTheme();
  const grid = theme === "dark" ? "rgba(255,255,255,0.08)" : "rgba(15,15,27,0.08)";
  const tick = theme === "dark" ? "#8a8aa0" : "#6b6b78";
  const tooltipBg = theme === "dark" ? "rgba(20,20,36,0.95)" : "rgba(255,255,255,0.95)";
  const tooltipBorder = theme === "dark" ? "rgba(255,255,255,0.1)" : "rgba(15,15,27,0.08)";
  return (
    <div className="card p-5">
      <div className="text-sm font-medium mb-3">{title}</div>
      <div style={{ width: "100%", height: 220 }}>
        <ResponsiveContainer>
          <BarChart data={data}>
            <defs>
              <linearGradient id="wkbar" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#fcd34d" />
                <stop offset="100%" stopColor="#d97706" />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={grid} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 12, fill: tick }}
              axisLine={false}
              tickLine={false}
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
                background: tooltipBg,
                border: `1px solid ${tooltipBorder}`,
                borderRadius: 12,
                fontSize: 12,
                color: theme === "dark" ? "#ebebf5" : "#13131b",
                backdropFilter: "blur(12px)",
              }}
            />
            <Bar dataKey="count" fill="url(#wkbar)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
