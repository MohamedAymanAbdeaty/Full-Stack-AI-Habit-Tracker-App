import { useEffect, useMemo, useState } from "react";
import { format, parseISO, subDays } from "date-fns";
import api from "../api/axios.js";
import HabitStatsCard from "../components/HabitStatsCard.jsx";
import WeeklyBarChart from "../components/WeeklyBarChart.jsx";
import MonthlyBarChart from "../components/MonthlyBarChart.jsx";
import CategoryPieChart from "../components/CategoryPieChart.jsx";
import AIChat from "../components/AIChat.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import { Trophy, Flame, TrendingDown } from "lucide-react";

export default function Stats() {
  const [stats, setStats] = useState(null);
  const [habits, setHabits] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [statsRes, habitsRes] = await Promise.all([
          api.get("/logs/stats"),
          api.get("/habits"),
        ]);
        setStats(statsRes.data);
        setHabits(habitsRes.data);
        const end = new Date();
        const start = subDays(end, 29);
        const rangeRes = await api.get("/logs/range", {
          params: {
            start: format(start, "yyyy-MM-dd"),
            end: format(end, "yyyy-MM-dd"),
          },
        });
        setLogs(rangeRes.data);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const monthly = useMemo(() => {
    const end = new Date();
    const byDate = {};
    for (let i = 29; i >= 0; i--) {
      const d = subDays(end, i);
      const key = format(d, "yyyy-MM-dd");
      byDate[key] = 0;
    }
    for (const l of logs) {
      if (byDate[l.completedDate] !== undefined)
        byDate[l.completedDate] += 1;
    }
    return Object.entries(byDate).map(([k, v]) => ({
      label: format(parseISO(k), "MMM d"),
      count: v,
    }));
  }, [logs]);

  const weekly = useMemo(() => {
    const end = new Date();
    const out = [];
    for (let i = 6; i >= 0; i--) {
      const d = subDays(end, i);
      const key = format(d, "yyyy-MM-dd");
      const count = logs.filter((l) => l.completedDate === key).length;
      out.push({ label: format(d, "EEE"), count });
    }
    return out;
  }, [logs]);

  const categoryData = useMemo(() => {
    if (!stats) return [];
    const map = {};
    for (const h of habits) map[h._id] = h.category;
    const counts = {};
    for (const l of logs) {
      const cat = map[l.habitId];
      if (!cat) continue;
      counts[cat] = (counts[cat] || 0) + 1;
    }
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [stats, logs, habits]);

  if (loading || !stats) return <LoadingSpinner full />;

  const sortedByStreak = [...stats.perHabit].sort(
    (a, b) => b.currentStreak - a.currentStreak
  );
  const best = sortedByStreak[0];
  const sortedByComp = [...stats.perHabit].sort(
    (a, b) => b.completions30d - a.completions30d
  );
  const longestLongest = [...stats.perHabit].sort(
    (a, b) => b.longestStreak - a.longestStreak
  )[0];
  const worst = [...stats.perHabit]
    .filter((s) => s.completions30d < 30)
    .sort((a, b) => a.completions30d - b.completions30d)[0];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
          Statistics
        </h1>
        <p className="text-sm text-muted mt-0.5">
          Deep insights from your habit data.
        </p>
      </div>

      {stats.perHabit.length === 0 ? (
        <div className="card p-10 text-center">
          <div className="text-5xl mb-3">📊</div>
          <div className="font-medium">No data yet</div>
          <div className="text-sm text-muted mt-1">
            Create a habit and check it off a few times to unlock statistics.
          </div>
        </div>
      ) : (
        <>
          <div className="grid md:grid-cols-3 gap-4">
            {best && (
              <div className="card p-5">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  <Flame size={14} className="text-orange-500" />
                  Best streak
                </div>
                <div className="mt-2 flex items-center gap-3">
                  <span className="text-3xl">{best.icon}</span>
                  <div>
                    <div className="font-semibold">
                      {best.name}
                    </div>
                    <div className="text-sm text-muted">
                      {best.currentStreak} day
                      {best.currentStreak === 1 ? "" : "s"} running
                    </div>
                  </div>
                </div>
              </div>
            )}
            {longestLongest && (
              <div className="card p-5">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  <Trophy size={14} className="text-amber-500" />
                  Longest ever
                </div>
                <div className="mt-2 flex items-center gap-3">
                  <span className="text-3xl">{longestLongest.icon}</span>
                  <div>
                    <div className="font-semibold">
                      {longestLongest.name}
                    </div>
                    <div className="text-sm text-muted">
                      {longestLongest.longestStreak} day record
                    </div>
                  </div>
                </div>
              </div>
            )}
            {worst && (
              <div className="card p-5">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                  <TrendingDown size={14} className="text-rose-500" />
                  Needs attention
                </div>
                <div className="mt-2 flex items-center gap-3">
                  <span className="text-3xl">{worst.icon}</span>
                  <div>
                    <div className="font-semibold">
                      {worst.name}
                    </div>
                    <div className="text-sm text-muted">
                      {worst.completions30d}/30 in the last 30 days
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="grid lg:grid-cols-2 gap-5">
            <WeeklyBarChart data={weekly} title="Completions — last 7 days" />
            <MonthlyBarChart data={monthly} />
          </div>

          <div className="grid lg:grid-cols-[1fr_1fr] gap-5">
            <CategoryPieChart data={categoryData} />
            <div className="card p-5">
              <div className="text-sm font-medium mb-3">
                Top habits by completion (30d)
              </div>
              <div className="space-y-3">
                {sortedByComp.slice(0, 5).map((s) => {
                  const pct = Math.round((s.completions30d / 30) * 100);
                  return (
                    <div key={s.habitId}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-lg shrink-0">{s.icon}</span>
                          <span className="truncate">{s.name}</span>
                        </div>
                        <span className="text-muted text-xs">
                          {s.completions30d}/30 · {pct}%
                        </span>
                      </div>
                      <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--chip-bg)" }}>
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${pct}%`,
                            background: s.color,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium">All habits</div>
            {stats.perHabit.map((s) => (
              <HabitStatsCard key={s.habitId} stat={s} />
            ))}
          </div>
        </>
      )}

      <AIChat />
    </div>
  );
}
