"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot,
  User,
  Sparkles,
  Zap,
  Flame,
  CalendarCheck,
  Lightbulb,
  Send,
  Trash2,
  Key,
  AlertCircle,
} from "lucide-react";
import { GlassCard } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
// All AI calls are made via API routes to keep the client bundle clean

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
};

type QuickAction = {
  id: string;
  label: string;
  icon: any;
  color: string;
  prompt: string;
};

const quickActions: QuickAction[] = [
  {
    id: "motivate",
    label: "Motivate Me",
    icon: Sparkles,
    color: "from-blue-500/20 to-purple-600/20 border-blue-500/20 text-blue-400",
    prompt: "motivate",
  },
  {
    id: "roast",
    label: "Roast Me",
    icon: Flame,
    color: "from-orange-500/20 to-red-600/20 border-orange-500/20 text-orange-400",
    prompt: "roast",
  },
  {
    id: "review",
    label: "Weekly Review",
    icon: CalendarCheck,
    color: "from-emerald-500/20 to-teal-600/20 border-emerald-500/20 text-emerald-400",
    prompt: "review",
  },
  {
    id: "suggest",
    label: "Suggestions",
    icon: Lightbulb,
    color: "from-amber-500/20 to-yellow-600/20 border-amber-500/20 text-amber-400",
    prompt: "suggest",
  },
];

const BOT_AVATAR = Bot;
const USER_AVATAR = User;

function randomId() {
  return Math.random().toString(36).slice(2, 11);
}

function TypingIndicator() {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500/20 to-purple-600/20 border border-violet-500/20">
        <Bot className="h-4 w-4 text-violet-400" />
      </div>
      <div className="rounded-2xl rounded-tl-sm border border-white/10 bg-white/5 backdrop-blur-xl px-4 py-3">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "0ms" }} />
          <span className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "150ms" }} />
          <span className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    </div>
  );
}

function ChatMessage({ message }: { message: Message }) {
  const isUser = message.role === "user";
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn("flex items-start gap-3", isUser && "flex-row-reverse")}
    >
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border",
          isUser
            ? "bg-blue-500/20 border-blue-500/20"
            : "bg-violet-500/20 border-violet-500/20"
        )}
      >
        {isUser ? (
          <User className="h-4 w-4 text-blue-400" />
        ) : (
          <Bot className="h-4 w-4 text-violet-400" />
        )}
      </div>
      <div
        className={cn(
          "max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
          isUser
            ? "rounded-tr-sm bg-gradient-to-r from-blue-600/40 to-purple-600/30 border border-blue-500/20 text-gray-100"
            : "rounded-tl-sm border border-white/10 bg-white/5 backdrop-blur-xl text-gray-200"
        )}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
        <p className="text-[10px] text-gray-500 mt-1.5">
          {message.timestamp.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </motion.div>
  );
}

export default function AIChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hey there! I'm your AI Coach. I can help you stay motivated, review your progress, or suggest new habits. What would you like to talk about?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [apiKeyConfigured, setApiKeyConfigured] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  const addMessage = useCallback(
    (role: "user" | "assistant", content: string) => {
      const msg: Message = {
        id: randomId(),
        role,
        content,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, msg]);
    },
    []
  );

  const handleSend = useCallback(
    async (text?: string) => {
      const messageText = text ?? input;
      if (!messageText.trim() || isLoading) return;

      addMessage("user", messageText.trim());
      setInput("");
      setIsLoading(true);

      try {
        let response: string;
        const lower = messageText.toLowerCase();

        if (lower.includes("motivate") || lower.startsWith("motivate")) {
          const res = await fetch("/api/ai/motivate", { method: "POST" });
          const data = await res.json();
          response = data?.data?.response || "Keep going! You've got this!";
        } else if (lower.includes("roast")) {
          const res = await fetch("/api/ai/roast", { method: "POST" });
          const data = await res.json();
          response = data?.data?.response || "I've got nothing to roast - you're doing great!";
        } else if (lower.includes("review")) {
          const res = await fetch("/api/ai/weekly-review", { method: "POST" });
          const data = await res.json();
          response = data?.data?.response || "Check your analytics for this week's review!";
        } else if (lower.includes("suggest")) {
          const res = await fetch("/api/ai/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: "suggest" }),
          });
          const data = await res.json();
          response = data?.data?.response || "Keep building those habits!";
        } else {
          const res = await fetch("/api/ai/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: messageText }),
          });
          const data = await res.json();
          response = data?.data?.response || "Let me think about that...";
        }

        addMessage("assistant", response);
      } catch (err: any) {
        if (err?.message?.includes("401") || err?.message?.includes("API key")) {
          setApiKeyConfigured(false);
          addMessage(
            "assistant",
            "I can't respond right now because the OpenAI API key isn't configured. Please add your API key in Settings to enable AI features."
          );
        } else {
          addMessage(
            "assistant",
            "Sorry, I encountered an error. Please try again or check your connection."
          );
        }
      } finally {
        setIsLoading(false);
      }
    },
    [input, isLoading, addMessage]
  );

  const handleQuickAction = useCallback(
    async (action: QuickAction) => {
      await handleSend(action.prompt);
    },
    [handleSend]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  const clearChat = useCallback(() => {
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content:
          "Chat cleared. I'm your AI Coach — how can I help you today?",
        timestamp: new Date(),
      },
    ]);
  }, []);

  return (
    <div className="flex h-[calc(100vh-6rem)] flex-col space-y-4">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">AI Coach</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Your personal habit assistant
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          icon={Trash2}
          onClick={clearChat}
        >
          Clear
        </Button>
      </div>

      {!apiKeyConfigured && (
        <div className="flex items-center gap-3 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3">
          <AlertCircle className="h-5 w-5 text-amber-400 shrink-0" />
          <p className="text-sm text-amber-300">
            OpenAI API key not configured. AI features are unavailable. Add
            your key in{" "}
            <Link
              href="/settings"
              className="underline hover:text-amber-200"
            >
              Settings
            </Link>
            .
          </p>
        </div>
      )}

      <div className="flex gap-2 overflow-x-auto pb-1 shrink-0">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              onClick={() => handleQuickAction(action)}
              disabled={isLoading || !apiKeyConfigured}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-xl border bg-gradient-to-r px-4 py-2.5 text-xs font-medium transition-all duration-200",
                "hover:scale-[1.03] active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed",
                action.color
              )}
            >
              <Icon className="h-4 w-4" />
              {action.label}
            </button>
          );
        })}
      </div>

      <GlassCard className="flex-1 flex flex-col overflow-hidden p-0">
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
          <AnimatePresence>
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
          </AnimatePresence>
          {isLoading && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>

        <div className="border-t border-white/10 p-4">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <Input
                placeholder="Ask your AI Coach..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading || !apiKeyConfigured}
              />
            </div>
            <Button
              variant="primary"
              size="md"
              icon={Send}
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading || !apiKeyConfigured}
            >
              Send
            </Button>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
