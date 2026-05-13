import { useState } from "react";
import { Sparkles, ChevronDown, RefreshCw } from "lucide-react";
import api from "../api/axios.js";
import Markdown from "./Markdown.jsx";

export default function AIWeeklyReport() {
  const [expanded, setExpanded] = useState(false);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatedAt, setGeneratedAt] = useState(null);

  const generate = async () => {
    setLoading(true);
    try {
      const res = await api.post("/ai/weekly-report");
      setContent(res.data.content);
      setGeneratedAt(new Date());
      setExpanded(true);
    } catch (e) {
      setContent("Failed to generate report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card p-5 relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          background:
            "radial-gradient(circle at 0% 0%, rgba(99,102,241,0.25), transparent 60%)",
        }}
      />
      <button
        onClick={() => setExpanded((e) => !e)}
        className="w-full flex items-center gap-3 text-left relative"
      >
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white flex items-center justify-center shrink-0 shadow-lg shadow-brand-500/30">
          <Sparkles size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium">AI Weekly Report</div>
          <div className="text-xs text-muted">
            {content
              ? `Generated ${generatedAt ? generatedAt.toLocaleTimeString() : "now"}`
              : "See patterns and personalised encouragement from the past 7 days"}
          </div>
        </div>
        <ChevronDown
          size={18}
          className={`text-faint transition ${expanded ? "rotate-180" : ""}`}
        />
      </button>

      {expanded && (
        <div className="mt-4 animate-slide-up relative">
          {!content && (
            <button
              onClick={generate}
              disabled={loading}
              className="btn-primary"
            >
              {loading ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  Analysing your week...
                </>
              ) : (
                <>
                  <Sparkles size={14} />
                  Generate weekly report
                </>
              )}
            </button>
          )}

          {content && (
            <>
              <Markdown className="mt-1 glass rounded-xl p-4 text-sm">
                {content}
              </Markdown>
              <div className="mt-3 flex justify-end">
                <button
                  onClick={generate}
                  disabled={loading}
                  className="btn-ghost"
                >
                  <RefreshCw
                    size={14}
                    className={loading ? "animate-spin" : ""}
                  />
                  Regenerate
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
