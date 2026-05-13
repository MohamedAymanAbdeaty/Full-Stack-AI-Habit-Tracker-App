import { useEffect, useMemo, useState } from "react";
import {
  Sparkles,
  RefreshCw,
  Brain,
  Trophy,
  CalendarRange,
  Activity,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";
import { format, subDays } from "date-fns";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  Cell as PieCell,
} from "recharts";
import api from "../api/axios.js";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import Markdown from "../components/Markdown.jsx";
import { weekKeysFor, streakFromKeys } from "../utils/dateHelpers.js";
import { useTheme } from "../context/ThemeContext.jsx";

const PIE_COLORS = [
  "#f59e0b",
  "#fb923c",
  "#ef4444",
  "#ec4899",
  "#8b5cf6",
  "#6366f1",
  "#0ea5e9",
  "#10b981",
  "#14b8a6",
];

const REPORT_CACHE_KEY = (weekStart) => `weekly-report-${weekStart}`;

export default function Insights() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const grid = isDark ? "rgba(255,255,255,0.08)" : "rgba(15,15,27,0.08)";
  const tick = isDark ? "#8a8aa0" : "#6b6b78";
  const tooltipStyle = {
    background: isDark ? "rgba(20,20,36,0.95)" : "rgba(255,255,255,0.95)",
    border: `1px solid ${grid}`,
    borderRadius: 12,
    fontSize: 12,
    color: isDark ? "#ebebf5" : "#13131b",
    backdropFilter: "blur(12px)",
  };

  const [habits, setHabits] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [report, setReport] = useState("");
  const [reportGeneratedAt, setReportGeneratedAt] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);

  const thisWeek = useMemo(() => weekKeysFor(new Date()), []);
  const lastWeek = useMemo(
    () => weekKeysFor(subDays(new Date(), 7)),
    []
  );

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const start = lastWeek[0].key;
        const end = thisWeek[6].key;
        const [habitsRes, logsRes] = await Promise.all([
          api.get("/habits"),
          api.get("/logs/range", { params: { start, end } }),
        ]);
        setHabits(habitsRes.data);
        setLogs(logsRes.data);

        // try to load cached report for this week
        const cached = localStorage.getItem(REPORT_CACHE_KEY(thisWeek[0].key));
        if (cached) {
          try {
            const { content, generatedAt } = JSON.parse(cached);
            setReport(content);
            setReportGeneratedAt(new Date(generatedAt));
          } catch {}
        } else {
          // auto-generate on first visit this week
          generateReport();
        }
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const generateReport = async () => {
    setReportLoading(true);
    try {
      const res = await api.post("/ai/weekly-report");
      setReport(res.data.content);
      const now = new Date();
      setReportGeneratedAt(now);
      localStorage.setItem(
        REPORT_CACHE_KEY(thisWeek[0].key),
        JSON.stringify({ content: res.data.content, generatedAt: now })
      );
    } catch {
      setReport("Failed to generate the report. Please try again.");
    } finally {
      setReportLoading(false);
    }
  };

  // Aggregations
  const thisWeekKeys = useMemo(
    () => new Set(thisWeek.map((d) => d.key)),
    [thisWeek]
  );
  const thisWeekLogs = useMemo(
    () => logs.filter((l) => thisWeekKeys.has(l.completedDate)),
    [logs, thisWeekKeys]
  );
  const lastWeekLogs = useMemo(
    () => logs.filter((l) => !thisWeekKeys.has(l.completedDate)),
    [logs, thisWeekKeys]
  );

  const totalSlots = habits.length * 7;
  const totalDone = thisWeekLogs.length;
  const totalLast = lastWeekLogs.length;
  const completionRate = totalSlots
    ? Math.round((totalDone / totalSlots) * 100)
    : 0;
  const delta = totalDone - totalLast;
  const deltaPct = totalLast
    ? Math.round(((totalDone - totalLast) / totalLast) * 100)
    : totalDone > 0
    ? 100
    : 0;

  const dailyData = thisWeek.map((d) => {
    const count = thisWeekLogs.filter((l) => l.completedDate === d.key).length;
    return { label: d.label, count };
  });

  const compareData = thisWeek.map((d, idx) => {
    const thisCount = thisWeekLogs.filter(
      (l) => l.completedDate === d.key
    ).length;
    const lastCount = lastWeekLogs.filter(
      (l) => l.completedDate === lastWeek[idx].key
    ).length;
    return { label: d.label, "This week": thisCount, "Last week": lastCount };
  });

  const bestDay = [...dailyData].sort((a, b) => b.count - a.count)[0];

  const perHabit = useMemo(() => {
    return habits
      .filter((h) => !h.isArchived)
      .map((h) => {
        const done = thisWeekLogs.filter(
          (l) => String(l.habitId) === String(h._id)
        ).length;
        const target = h.targetDays || 7;
        return {
          habit: h,
          done,
          target,
          pct: Math.min(100, Math.round((done / Math.max(1, target)) * 100)),
        };
      })
      .sort((a, b) => b.pct - a.pct);
  }, [habits, thisWeekLogs]);

  const topHabit = perHabit[0];

  const categoryData = useMemo(() => {
    const map = {};
    for (const h of habits) map[h._id] = h.category;
    const counts = {};
    for (const l of thisWeekLogs) {
      const cat = map[l.habitId];
      if (!cat) continue;
      counts[cat] = (counts[cat] || 0) + 1;
    }
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [habits, thisWeekLogs]);

  // Streak overview from full 14-day window (rough — accurate streaks need longer)
  const streakBoard = useMemo(() => {
    const out = {};
    for (const h of habits) {
      const keys = logs
        .filter((l) => String(l.habitId) === String(h._id))
        .map((l) => l.completedDate)
        .sort()
        .reverse();
      out[h._id] = streakFromKeys(keys);
    }
    return out;
  }, [habits, logs]);

  const activeStreaks = Object.values(streakBoard).filter(
    (s) => s.current > 0
  ).length;

  if (loading) return <LoadingSpinner full />;

  const DeltaPill = () => {
    const Icon = delta > 0 ? TrendingUp : delta < 0 ? TrendingDown : Minus;
    const color =
      delta > 0
        ? "text-emerald-500 bg-emerald-500/10"
        : delta < 0
        ? "text-rose-500 bg-rose-500/10"
        : "text-faint bg-[var(--chip-bg)]";
    const label = delta === 0 ? "no change" : `${delta > 0 ? "+" : ""}${delta} (${deltaPct > 0 ? "+" : ""}${deltaPct}%)`;
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${color}`}
      >
        <Icon size={12} /> {label}
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
            Weekly insights
          </h1>
          <p className="text-sm text-muted mt-0.5 inline-flex items-center gap-2">
            <CalendarRange size={14} />
            {format(thisWeek[0].date, "MMM d")} —{" "}
            {format(thisWeek[6].date, "MMM d, yyyy")}
          </p>
        </div>
        <button
          onClick={generateReport}
          className="btn-secondary"
          disabled={reportLoading}
        >
          <RefreshCw
            size={14}
            className={reportLoading ? "animate-spin" : ""}
          />
          Regenerate report
        </button>
      </div>

      {/* AI report */}
      <div className="card p-6 relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none opacity-50"
          style={{
            background:
              "radial-gradient(circle at 0% 0%, rgba(251,191,36,0.22), transparent 55%), radial-gradient(circle at 100% 100%, rgba(236,72,153,0.12), transparent 55%)",
          }}
        />
        <div className="relative">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 text-white flex items-center justify-center shadow-lg shadow-brand-500/30">
              <Sparkles size={18} />
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold">AI Weekly Report</div>
              <div className="text-xs text-muted">
                {reportGeneratedAt
                  ? `Generated ${reportGeneratedAt.toLocaleString()}`
                  : "Personalised review of your last 7 days"}
              </div>
            </div>
          </div>

          {reportLoading && !report && (
            <div className="flex items-center gap-2 text-sm text-soft py-6">
              <RefreshCw size={14} className="animate-spin" />
              Analysing your week...
            </div>
          )}

          {report && (
            <Markdown className="glass rounded-xl p-4 text-sm">
              {report}
            </Markdown>
          )}

          {!report && !reportLoading && (
            <button onClick={generateReport} className="btn-primary">
              <Sparkles size={14} /> Generate report
            </button>
          )}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="card p-4">
          <div className="flex items-center gap-2 text-xs font-medium text-muted">
            <Activity size={14} /> Completions
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <div className="text-2xl font-semibold">{totalDone}</div>
            <DeltaPill />
          </div>
          <div className="text-xs text-muted mt-0.5">vs last week</div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 text-xs font-medium text-muted">
            <TrendingUp size={14} /> Completion rate
          </div>
          <div className="text-2xl font-semibold mt-1">{completionRate}%</div>
          <div className="text-xs text-muted mt-0.5">
            {totalDone}/{totalSlots} slots
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 text-xs font-medium text-muted">
            <CalendarRange size={14} /> Best day
          </div>
          <div className="text-2xl font-semibold mt-1">
            {bestDay?.count ? bestDay.label : "—"}
          </div>
          <div className="text-xs text-muted mt-0.5">
            {bestDay?.count
              ? `${bestDay.count} habit${bestDay.count === 1 ? "" : "s"}`
              : "no data"}
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2 text-xs font-medium text-muted">
            <Trophy size={14} /> Top habit
          </div>
          <div className="mt-1 truncate flex items-center gap-1.5">
            {topHabit?.done ? (
              <>
                <span className="text-xl">{topHabit.habit.icon}</span>
                <span className="font-medium truncate">
                  {topHabit.habit.name}
                </span>
              </>
            ) : (
              <span className="font-medium">—</span>
            )}
          </div>
          <div className="text-xs text-muted mt-0.5">
            {topHabit?.done
              ? `${topHabit.done}/${topHabit.target} this week`
              : "no completions"}
          </div>
        </div>
      </div>

      {/* Charts row 1 */}
      <div className="grid lg:grid-cols-2 gap-5">
        <div className="card p-5">
          <div className="text-sm font-medium mb-3">Completions by day</div>
          <div style={{ width: "100%", height: 240 }}>
            <ResponsiveContainer>
              <BarChart data={dailyData}>
                <defs>
                  <linearGradient id="day-bar" x1="0" y1="0" x2="0" y2="1">
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
                  cursor={{
                    fill: isDark
                      ? "rgba(255,255,255,0.04)"
                      : "rgba(15,15,27,0.04)",
                  }}
                  contentStyle={tooltipStyle}
                />
                <Bar dataKey="count" fill="url(#day-bar)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-5">
          <div className="text-sm font-medium mb-3">
            This week vs last week
          </div>
          <div style={{ width: "100%", height: 240 }}>
            <ResponsiveContainer>
              <BarChart data={compareData}>
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
                <Tooltip contentStyle={tooltipStyle} />
                <Legend
                  wrapperStyle={{ fontSize: 12, color: tick }}
                  iconType="circle"
                  iconSize={8}
                />
                <Bar dataKey="Last week" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="This week" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="grid lg:grid-cols-[1fr_1.4fr] gap-5">
        <div className="card p-5">
          <div className="text-sm font-medium mb-3">By category</div>
          {!categoryData.length ? (
            <div className="text-sm text-muted py-10 text-center">
              No completions yet this week.
            </div>
          ) : (
            <div style={{ width: "100%", height: 240 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={categoryData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    stroke={isDark ? "rgba(255,255,255,0.06)" : "#ffffff"}
                    strokeWidth={2}
                  >
                    {categoryData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend
                    wrapperStyle={{ fontSize: 12, color: tick }}
                    iconType="circle"
                    iconSize={8}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-medium">Habit performance</div>
            <div className="text-xs text-muted">vs target this week</div>
          </div>
          {!perHabit.length ? (
            <div className="text-sm text-muted py-10 text-center">
              No active habits.
            </div>
          ) : (
            <div className="space-y-3">
              {perHabit.map(({ habit, done, target, pct }) => (
                <div key={habit._id}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-lg shrink-0">{habit.icon}</span>
                      <span className="truncate">{habit.name}</span>
                    </div>
                    <span className="text-muted text-xs">
                      {done}/{target} · {pct}%
                    </span>
                  </div>
                  <div
                    className="h-2 rounded-full overflow-hidden"
                    style={{ background: "var(--chip-bg)" }}
                  >
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${pct}%`,
                        background: habit.color,
                        boxShadow:
                          pct === 100 ? `0 0 12px ${habit.color}88` : "none",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Streak board */}
      {!!habits.filter((h) => !h.isArchived).length && (
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-medium">Active streaks</div>
            <div className="text-xs text-muted">
              {activeStreaks} of {habits.filter((h) => !h.isArchived).length}
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {habits
              .filter((h) => !h.isArchived)
              .map((h) => {
                const s = streakBoard[h._id];
                const cur = s?.current || 0;
                return (
                  <div
                    key={h._id}
                    className="rounded-xl glass p-3 flex items-center gap-3"
                  >
                    <span
                      className="w-9 h-9 rounded-lg flex items-center justify-center text-lg shrink-0"
                      style={{
                        background: `${h.color}26`,
                        color: h.color,
                      }}
                    >
                      {h.icon}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm truncate">{h.name}</div>
                      <div
                        className={`text-xs font-medium ${
                          cur > 0 ? "text-orange-500" : "text-faint"
                        }`}
                      >
                        🔥 {cur} day{cur === 1 ? "" : "s"}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}
