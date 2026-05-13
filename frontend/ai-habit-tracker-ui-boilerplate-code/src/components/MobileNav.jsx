import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  ListChecks,
  CalendarDays,
  Brain,
  BarChart3,
  Sparkles,
  LogOut,
  Sun,
  Moon,
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";

export default function MobileNav() {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  return (
    <>
      <div className="md:hidden sticky top-0 z-20 glass border-b divider px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 text-white flex items-center justify-center shadow-md shadow-brand-500/30">
            <Sparkles size={16} />
          </div>
          <div className="font-semibold">AI Habit Tracker</div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggle}
            className="p-2 rounded-lg text-soft hover:bg-[var(--surface-hover)]"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white text-sm font-semibold flex items-center justify-center">
            {user?.avatar || user?.username?.charAt(0).toUpperCase() || user?.name?.charAt(0).toUpperCase() || "U"}
          </div>
          <button
            onClick={logout}
            className="p-2 rounded-lg text-soft hover:bg-[var(--surface-hover)]"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 glass border-t divider flex justify-around py-2">
        {[
          { to: "/dashboard", label: "Home", icon: LayoutDashboard },
          { to: "/habits", label: "Habits", icon: ListChecks },
          { to: "/weekly", label: "Weekly", icon: CalendarDays },
          { to: "/insights", label: "Insights", icon: Brain },
          { to: "/stats", label: "Stats", icon: BarChart3 },
        ].map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-lg text-xs ${isActive
                ? "text-brand-700 dark:text-brand-300"
                : "text-faint"
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>
    </>
  );
}
