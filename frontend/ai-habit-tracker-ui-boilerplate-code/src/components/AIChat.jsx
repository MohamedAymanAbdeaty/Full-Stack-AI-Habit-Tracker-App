import { useState, useEffect, useRef } from "react";
import { MessageCircle, Send, X, Sparkles, RefreshCw } from "lucide-react";
import api from "../api/axios.js";
import Markdown from "./Markdown.jsx";

const SAMPLES = [
  "Which day of the week am I most consistent?",
  "What is my best performing category?",
  "Why do I keep failing my exercise habit?",
];

export default function AIChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi — ask me anything about your habit data. Try one of the examples below.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages, open]);

  const send = async (text) => {
    const q = (text ?? input).trim();
    if (!q || loading) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", content: q }]);
    setLoading(true);
    try {
      const res = await api.post("/ai/chat", { question: q });
      setMessages((m) => [
        ...m,
        { role: "assistant", content: res.data.content },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: "Sorry, I couldn't answer that right now.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-20 md:bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-2xl shadow-brand-500/40 flex items-center justify-center hover:scale-105 active:scale-95 transition"
        aria-label="AI Chat"
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>

      {open && (
        <div className="fixed bottom-36 md:bottom-24 right-6 z-40 w-[min(92vw,380px)] h-[min(70vh,520px)] glass-strong rounded-2xl flex flex-col animate-slide-up shadow-2xl overflow-hidden">
          <div className="px-4 py-3 border-b divider flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 text-white flex items-center justify-center shadow-md shadow-brand-500/30">
              <Sparkles size={14} />
            </div>
            <div>
              <div className="text-sm font-medium">Habit Analysis</div>
              <div className="text-xs text-muted">AI-powered insights</div>
            </div>
          </div>

          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-4 py-3 space-y-3"
          >
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${
                  m.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                    m.role === "user"
                      ? "bg-gradient-to-br from-brand-500 to-brand-700 text-white rounded-br-md shadow-md shadow-brand-500/30"
                      : "glass rounded-bl-md"
                  }`}
                >
                  {m.role === "user" ? m.content : <Markdown>{m.content}</Markdown>}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="glass rounded-2xl rounded-bl-md px-3.5 py-2.5 text-sm text-soft flex items-center gap-2">
                  <RefreshCw size={12} className="animate-spin" />
                  Thinking...
                </div>
              </div>
            )}
            {messages.length === 1 && (
              <div className="pt-2 space-y-1.5">
                {SAMPLES.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => send(s)}
                    className="block w-full text-left text-xs rounded-lg glass hover:bg-[var(--surface-hover)] px-3 py-2 text-soft"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
            className="p-3 border-t divider flex gap-2"
          >
            <input
              className="input"
              placeholder="Ask about your habits..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button
              type="submit"
              className="btn-primary px-3"
              disabled={loading}
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
