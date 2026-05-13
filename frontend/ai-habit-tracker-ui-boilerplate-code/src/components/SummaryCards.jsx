import { ListChecks, Flame, Trophy, TrendingUp } from "lucide-react";

const Card = ({ icon: Icon, label, value, iconBg, iconFg }) => (
  <div className="card p-4 flex items-center gap-3 overflow-hidden relative">
    <div
      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
      style={{ background: iconBg, color: iconFg }}
    >
      <Icon size={18} />
    </div>
    <div>
      <div className="text-xs font-medium text-muted">{label}</div>
      <div className="text-xl font-semibold">{value}</div>
    </div>
  </div>
);

export default function SummaryCards({ totalHabits, activeStreaks, bestStreak, weekRate }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <Card
        icon={ListChecks}
        label="Total habits"
        value={totalHabits}
        iconBg="rgba(99,102,241,0.15)"
        iconFg="#6366f1"
      />
      <Card
        icon={Flame}
        label="Active streaks"
        value={activeStreaks}
        iconBg="rgba(249,115,22,0.15)"
        iconFg="#f97316"
      />
      <Card
        icon={Trophy}
        label="Best streak"
        value={bestStreak}
        iconBg="rgba(245,158,11,0.15)"
        iconFg="#f59e0b"
      />
      <Card
        icon={TrendingUp}
        label="This week"
        value={`${weekRate}%`}
        iconBg="rgba(16,185,129,0.15)"
        iconFg="#10b981"
      />
    </div>
  );
}
