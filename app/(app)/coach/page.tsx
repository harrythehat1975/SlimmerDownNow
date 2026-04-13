"use client";

export const dynamic = "force-dynamic";

import { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "coach";
  content: string;
  actions?: { label: string; action: string }[];
  warnings?: string[];
  timestamp: Date;
}

const QUICK_ACTIONS = [
  { label: "🍽️ Swap a meal", message: "Can you suggest a meal swap for today?" },
  { label: "😴 I'm tired today", message: "I'm feeling really tired today. Can you adjust my plan?" },
  { label: "🏋️ Make workout easier", message: "Can you suggest an easier workout for today?" },
  { label: "📊 How am I doing?", message: "How is my progress looking this week?" },
];

export default function CoachPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "coach",
      content:
        "Hey! I'm your AI coach. Ask me anything about your plan, request changes, or just check in. What's on your mind?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: Message = {
      role: "user",
      content: text.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text.trim() }),
      });

      const data = await res.json();

      const coachMsg: Message = {
        role: "coach",
        content: data.reply,
        actions: data.suggested_actions?.filter(
          (a: { action: string }) => a.action !== "none"
        ),
        warnings: data.warnings,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, coachMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "coach",
          content: "Sorry, I had trouble connecting. Please try again.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleAction = async (action: string) => {
    const actionMessages: Record<string, string> = {
      swap_meal: "Please suggest a meal swap for today.",
      reduce_intensity: "I'd like to reduce the workout intensity today.",
      adjust_calories: "Can you adjust my calorie target?",
      skip_workout: "I need to skip my workout today. What should I do instead?",
    };
    const msg = actionMessages[action] || action;
    await sendMessage(msg);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm rounded-zen shadow-zen p-4 mb-4 border-l-4 border-moss-500">
        <h1 className="text-2xl font-light text-zen-900">🌱 AI Coach</h1>
        <p className="text-zen-500 text-sm">
          Ask questions, request plan changes, or get motivation
        </p>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2 mb-4">
        {QUICK_ACTIONS.map((qa) => (
          <button
            key={qa.label}
            onClick={() => sendMessage(qa.message)}
            disabled={loading}
            className="bg-white/80 border border-stone-200 hover:border-moss-400 hover:bg-moss-50/60 text-zen-700 text-sm px-4 py-2 rounded-full transition-all duration-200 disabled:opacity-50"
          >
            {qa.label}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-white/80 backdrop-blur-sm rounded-zen shadow-zen p-4 space-y-4 mb-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-zen px-4 py-3 ${
                msg.role === "user"
                  ? "bg-moss-500 text-white"
                  : "bg-stone-100 text-zen-900"
              }`}
            >
              {msg.role === "coach" && (
                <p className="text-xs font-medium text-moss-600 mb-1">Coach SDN</p>
              )}
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>

              {/* Suggested Actions */}
              {msg.actions && msg.actions.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {msg.actions.map((a, j) => (
                    <button
                      key={j}
                      onClick={() => handleAction(a.action)}
                      disabled={loading}
                      className="bg-moss-100 hover:bg-moss-200 text-moss-700 text-xs px-3 py-1 rounded-full transition-all duration-200 disabled:opacity-50"
                    >
                      {a.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Warnings */}
              {msg.warnings && msg.warnings.length > 0 && (
                <div className="mt-2 bg-amber-50/60 border border-amber-200 rounded-zen p-2">
                  {msg.warnings.map((w, j) => (
                    <p key={j} className="text-xs text-amber-800">⚠️ {w}</p>
                  ))}
                </div>
              )}

              <p className="text-xs opacity-50 mt-1">
                {msg.timestamp.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-stone-100 rounded-zen px-4 py-3">
              <p className="text-xs font-medium text-moss-600 mb-1">Coach SDN</p>
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-zen-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                <div className="w-2 h-2 bg-zen-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                <div className="w-2 h-2 bg-zen-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask your coach anything..."
          disabled={loading}
          className="flex-1 px-4 py-3 border border-stone-300 rounded-zen focus:outline-none focus:ring-2 focus:ring-moss-400/50 focus:border-moss-400 transition-all duration-200 bg-white/60 disabled:bg-stone-50"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="bg-moss-500 hover:bg-moss-600 text-white font-medium px-6 py-3 rounded-zen transition-all duration-300 shadow-zen disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}
