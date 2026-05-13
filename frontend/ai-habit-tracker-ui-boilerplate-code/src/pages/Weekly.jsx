import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { format, addWeeks, isSameWeek } from "date-fns";
import api from "../api/axios.js";
import WeeklyGrid from "../components/WeeklyGrid.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import { weekKeysFor } from "../utils/dateHelpers.js";

export default function Weekly() {
  const [cursor, setCursor] = useState(new Date());
  const [habits, setHabits] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const days = useMemo(() => weekKeysFor(cursor), [cursor]);
  const isCurrentWeek = isSameWeek(cursor, new Date(), { weekStartsOn: 1 });

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const start = days[0].key;
        const end = days[days.length - 1].key;
        const [habitsRes, rangeRes] = await Promise.all([
          api.get("/habits"),
          api.get("/logs/range", { params: { start, end } }),
        ]);
        setHabits(habitsRes.data);
        setLogs(rangeRes.data);
      } finally {
        setLoading(false);
      }
    })();
  }, [days]);

  const logsByHabit = useMemo(() => {
    const out = {};
    for (const l of logs) {
      if (!out[l.habitId]) out[l.habitId] = [];
      out[l.habitId].push(l.completedDate);
    }
    return out;
  }, [logs]);

  const totalSlots = habits.length * 7;
  const totalDone = logs.length;
  const weekRate = totalSlots ? Math.round((totalDone / totalSlots) * 100) : 0;

  const dayTotals = days.map((d) => ({
    ...d,
    count: logs.filter((l) => l.completedDate === d.key).length,
  }));
  const bestDay = [...dayTotals].sort((a, b) => b.count - a.count)[0];

  const perHabitDone = habits
    .map((h) => ({
      h,
      count: (logsByHabit[h._id] || []).length,
    }))
    .sort((a, b) => b.count - a.count);
  const topHabit = perHabitDone[0];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
            Weekly overview
          </h1>
          <p className="text-sm text-muted mt-0.5">
            See every habit across all 7 days at a glance.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="btn-secondary px-3"
            onClick={() => setCursor((d) => addWeeks(d, -1))}
            aria-label="Previous week"
          >
            <ChevronLeft size={16} />
          </button>
          <div className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl glass text-sm font-medium">
            <CalendarDays size={14} className="text-muted" />
            {format(days[0].date, "MMM d")} — {format(days[6].date, "MMM d, yyyy")}
          </div>
          <button
            className="btn-secondary px-3"
            onClick={() => setCursor((d) => addWeeks(d, 1))}
            disabled={isCurrentWeek}
            aria-label="Next week"
          >
            <ChevronRight size={16} />
          </button>
          {!isCurrentWeek && (
            <button
              className="btn-ghost"
              onClick={() => setCursor(new Date())}
            >
              Today
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <LoadingSpinner full />
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="card p-4">
              <div className="text-xs text-muted font-medium">Week rate</div>
              <div className="text-2xl font-semibold mt-1">
                {weekRate}%
              </div>
              <div className="text-xs text-muted mt-0.5">
                {totalDone} of {totalSlots}
              </div>
            </div>
            <div className="card p-4">
              <div className="text-xs text-muted font-medium">
                Total completions
              </div>
              <div className="text-2xl font-semibold mt-1">
                {totalDone}
              </div>
              <div className="text-xs text-muted mt-0.5">this week</div>
            </div>
            <div className="card p-4">
              <div className="text-xs text-muted font-medium">Best day</div>
              <div className="text-2xl font-semibold mt-1">
                {bestDay?.count ? bestDay.label : "—"}
              </div>
              <div className="text-xs text-muted mt-0.5">
                {bestDay?.count ? `${bestDay.count} habits done` : "no data"}
              </div>
            </div>
            <div className="card p-4">
              <div className="text-xs text-muted font-medium">
                Top habit
              </div>
              <div className="text-2xl font-semibold mt-1 truncate">
                {topHabit?.count ? (
                  <>
                    <span className="mr-1">{topHabit.h.icon}</span>
                    <span className="text-base font-medium align-middle">
                      {topHabit.h.name}
                    </span>
                  </>
                ) : (
                  "—"
                )}
              </div>
              <div className="text-xs text-muted mt-0.5">
                {topHabit?.count ? `${topHabit.count}/7 days` : "no data"}
              </div>
            </div>
          </div>

          {habits.length === 0 ? (
            <div className="card p-10 text-center">
              <div className="text-5xl mb-3">📅</div>
              <div className="font-medium">No habits yet</div>
              <div className="text-sm text-muted mt-1">
                Create a habit to start filling in your weekly grid.
              </div>
            </div>
          ) : (
            <WeeklyGrid
              habits={habits}
              logsByHabit={logsByHabit}
              days={days}
            />
          )}
        </>
      )}
    </div>
  );
}
