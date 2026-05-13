import { useEffect, useState } from "react";
import { Sun, X } from "lucide-react";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";
import Markdown from "./Markdown.jsx";

export default function MorningMotivation() {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user?.morningMotivation) return;
    const today = new Date().toISOString().slice(0, 10);
    const seen = localStorage.getItem("morning-seen");
    if (seen === today) return;
    setLoading(true);
    api
      .get("/ai/morning-motivation")
      .then((res) => {
        setContent(res.data.content);
        localStorage.setItem("morning-seen", today);
      })
      .finally(() => setLoading(false));
  }, [user?.morningMotivation]);

  if (!user?.morningMotivation || dismissed || (!content && !loading))
    return null;

  return (
    <div className="relative rounded-2xl p-5 glass overflow-hidden animate-slide-up">
      <div
        className="absolute inset-0 pointer-events-none opacity-60"
        style={{
          background:
            "radial-gradient(circle at 0% 0%, rgba(251,191,36,0.25), transparent 55%), radial-gradient(circle at 100% 100%, rgba(99,102,241,0.18), transparent 55%)",
        }}
      />
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-3 right-3 text-soft hover:text-[var(--text)] z-10"
        aria-label="Dismiss"
      >
        <X size={16} />
      </button>
      <div className="flex items-start gap-3 pr-6 relative">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/30 animate-float">
          <Sun size={20} />
        </div>
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-300">
            Good morning, {(user.username || user.name || "").split(" ")[0]}
          </div>
          <div className="mt-1 text-sm">
            {loading ? (
              "Thinking of something nice to say..."
            ) : (
              <Markdown>{content}</Markdown>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
