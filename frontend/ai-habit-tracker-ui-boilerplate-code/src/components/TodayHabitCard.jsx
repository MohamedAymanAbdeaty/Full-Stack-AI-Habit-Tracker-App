import { Check, Flame, Pencil, Trash2, Archive } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export default function TodayHabitCard({
  habit,
  completed,
  onToggle,
  streak = 0,
  onEdit,
  onDelete,
  onArchive,
}) {
  const [menu, setMenu] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);
  const menuWidth = 160; // matches w-40
  const menuHeight = 132; // approx for 3 items

  useLayoutEffect(() => {
    if (!menu || !triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const flipUp = rect.bottom + menuHeight + 8 > window.innerHeight;
    setPos({
      top: flipUp ? rect.top - menuHeight - 4 : rect.bottom + 4,
      left: rect.right - menuWidth,
    });
  }, [menu]);

  useEffect(() => {
    if (!menu) return;
    const close = () => setMenu(false);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [menu]);

  return (
    <div
      className={`card p-4 flex items-center gap-4 transition ${completed
        ? "ring-1 ring-brand-500/10 bg-brand-500/5 dark:bg-brand-500/3"
        : ""
        }`}
    >
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0"
        style={{ background: `${habit.color}26`, color: habit.color }}
      >
        {habit.icon}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <div className="font-medium truncate">{habit.name}</div>
          <span className="chip">{habit.category}</span>
        </div>
        {habit.description && (
          <div className="text-sm text-muted truncate mt-0.5">
            {habit.description}
          </div>
        )}
      </div>

      <div className="hidden sm:flex items-center gap-1 text-sm text-soft">
        <Flame
          size={16}
          className={streak > 0 ? "text-orange-500" : "text-faint"}
        />
        <span className="font-medium">{streak}</span>
      </div>

      <div className="relative">
        <button
          ref={triggerRef}
          className="btn-ghost p-2"
          onClick={() => setMenu((m) => !m)}
          aria-label="Habit options"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <circle cx="3" cy="8" r="1.5" />
            <circle cx="8" cy="8" r="1.5" />
            <circle cx="13" cy="8" r="1.5" />
          </svg>
        </button>

        {menu &&
          createPortal(
            <>
              <div
                className="fixed inset-0 z-[100]"
                onClick={() => setMenu(false)}
              />
              <div
                className="fixed z-[110] glass-strong rounded-xl py-1 w-40 shadow-xl animate-fade-in"
                style={{ top: pos.top, left: pos.left }}
              >
                <button
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-soft hover:bg-[var(--surface-hover)]"
                  onClick={() => {
                    setMenu(false);
                    onEdit();
                  }}
                >
                  <Pencil size={14} /> Edit
                </button>
                <button
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-soft hover:bg-[var(--surface-hover)]"
                  onClick={() => {
                    setMenu(false);
                    onArchive();
                  }}
                >
                  <Archive size={14} />
                  {habit.isArchived ? "Unarchive" : "Archive"}
                </button>
                <button
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-rose-500 hover:bg-rose-500/10"
                  onClick={() => {
                    setMenu(false);
                    onDelete();
                  }}
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </>,
            document.body
          )}
      </div>

      <button
        onClick={onToggle}
        className={`shrink-0 w-11 h-11 rounded-full flex items-center justify-center transition ${completed
          ? "bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-lg shadow-brand-500/40 animate-pop"
          : "bg-brand-100 border-2 border-border-brand-400 text-brand-400 hover:border-brand-400 hover:text-brand-400"
          }`}
        aria-label={completed ? "Mark incomplete" : "Mark complete"}
      >
        <Check size={20} strokeWidth={3} />
      </button>
    </div>
  );
}
