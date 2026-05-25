"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Play,
  Pause,
  RotateCcw,
  Settings,
  ChevronDown,
  ChevronUp,
  Timer,
  Coffee,
  Moon,
} from "lucide-react";
import { GlassCard } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePomodoroStore, useSettingsStore } from "@/store";
import { cn } from "@/lib/utils";

type Mode = "FOCUS" | "BREAK" | "LONG_BREAK";

const MODES: { key: Mode; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: "FOCUS", label: "Focus", icon: Timer },
  { key: "BREAK", label: "Break", icon: Coffee },
  { key: "LONG_BREAK", label: "Long Break", icon: Moon },
];

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

function RingTimer({
  remaining,
  total,
  mode,
}: {
  remaining: number;
  total: number;
  mode: Mode;
}) {
  const radius = 140;
  const strokeWidth = 8;
  const size = (radius + strokeWidth) * 2;
  const circumference = 2 * Math.PI * radius;
  const progress = total > 0 ? remaining / total : 1;
  const offset = circumference * (1 - progress);

  const ringColor =
    mode === "FOCUS"
      ? "#60a5fa"
      : mode === "BREAK"
        ? "#34d399"
        : "#a78bfa";

  return (
    <div className="relative flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={ringColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.5, ease: "linear" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          key={remaining}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.15 }}
          className="text-5xl font-bold tracking-tight text-gray-100 tabular-nums"
        >
          {formatTime(remaining)}
        </motion.span>
        <span
          className={cn(
            "mt-2 text-xs font-medium uppercase tracking-wider",
            mode === "FOCUS"
              ? "text-blue-400"
              : mode === "BREAK"
                ? "text-emerald-400"
                : "text-purple-400"
          )}
        >
          {mode === "FOCUS"
            ? "Focus Time"
            : mode === "BREAK"
              ? "Break Time"
              : "Long Break"}
        </span>
      </div>
    </div>
  );
}

export default function PomodoroPage() {
  const {
    workDuration,
    breakDuration,
    longBreakDuration,
    sessionsBeforeLongBreak,
    isRunning,
    remainingTime,
    sessionsCompleted,
    setWorkDuration,
    setBreakDuration,
    setLongBreakDuration,
    setSessionsBeforeLongBreak,
    setIsRunning,
    setIsBreak,
    setRemainingTime,
    incrementSessionsCompleted,
  } = usePomodoroStore();

  const soundEnabled = useSettingsStore((s) => s.soundEnabled);

  const [mode, setMode] = useState<Mode>("FOCUS");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const getTotalTime = useCallback((): number => {
    switch (mode) {
      case "FOCUS":
        return workDuration * 60;
      case "BREAK":
        return breakDuration * 60;
      case "LONG_BREAK":
        return longBreakDuration * 60;
    }
  }, [mode, workDuration, breakDuration, longBreakDuration]);

  const totalTime = getTotalTime();

  const playNotification = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 800;
      gain.gain.value = 0.3;
      osc.start();
      setTimeout(() => {
        osc.frequency.value = 1000;
      }, 150);
      setTimeout(() => {
        osc.stop();
        ctx.close();
      }, 400);
    } catch {}
  }, [soundEnabled]);

  const completeTimer = useCallback(() => {
    setIsRunning(false);
    playNotification();

    setTimeout(() => {
      if (mode === "FOCUS") {
        incrementSessionsCompleted();
        const isLongBreak =
          (sessionsCompleted + 1) % sessionsBeforeLongBreak === 0;
        if (isLongBreak) {
          setMode("LONG_BREAK");
          setRemainingTime(longBreakDuration * 60);
        } else {
          setMode("BREAK");
          setRemainingTime(breakDuration * 60);
        }
        setIsBreak(true);
      } else {
        setMode("FOCUS");
        setRemainingTime(workDuration * 60);
        setIsBreak(false);
      }
    }, 0);
  }, [mode, sessionsCompleted, sessionsBeforeLongBreak, longBreakDuration, breakDuration, workDuration, setIsRunning, setIsBreak, setRemainingTime, incrementSessionsCompleted, playNotification]);

  useEffect(() => {
    if (!isRunning) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      const store = usePomodoroStore.getState();
      setRemainingTime(Math.max(0, store.remainingTime - 1));
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, setRemainingTime]);

  useEffect(() => {
    if (remainingTime === 0 && isRunning) {
      completeTimer();
    }
  }, [remainingTime, isRunning, completeTimer]);

  const handleModeChange = useCallback(
    (newMode: Mode) => {
      setMode(newMode);
      setIsRunning(false);
      setIsBreak(newMode !== "FOCUS");
      switch (newMode) {
        case "FOCUS":
          setRemainingTime(workDuration * 60);
          break;
        case "BREAK":
          setRemainingTime(breakDuration * 60);
          break;
        case "LONG_BREAK":
          setRemainingTime(longBreakDuration * 60);
          break;
      }
    },
    [workDuration, breakDuration, longBreakDuration, setIsRunning, setIsBreak, setRemainingTime]
  );

  const handlePlayPause = useCallback(() => {
    if (remainingTime === 0) {
      setRemainingTime(totalTime);
    }
    setIsRunning(!isRunning);
  }, [isRunning, remainingTime, totalTime, setIsRunning, setRemainingTime]);

  const handleReset = useCallback(() => {
    setIsRunning(false);
    setMode("FOCUS");
    setIsBreak(false);
    setRemainingTime(workDuration * 60);
  }, [workDuration, setIsRunning, setIsBreak, setRemainingTime]);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-2xl font-bold text-gray-100">Pomodoro</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          Stay focused with timed work sessions
        </p>
      </motion.div>

      <div className="flex justify-center">
        <div className="flex items-center gap-1 rounded-xl bg-white/5 border border-white/10 p-1">
          {MODES.map((m) => {
            const Icon = m.icon;
            return (
              <button
                key={m.key}
                onClick={() => handleModeChange(m.key)}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200",
                  mode === m.key
                    ? "bg-white/10 text-gray-100 shadow-sm"
                    : "text-gray-400 hover:text-gray-200"
                )}
              >
                <Icon className="h-4 w-4" />
                {m.label}
              </button>
            );
          })}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="flex justify-center"
      >
        <GlassCard className="p-8 flex flex-col items-center">
          <RingTimer
            remaining={remainingTime}
            total={totalTime}
            mode={mode}
          />

          <div className="flex items-center gap-4 mt-8">
            <Button
              variant="secondary"
              size="lg"
              icon={isRunning ? Pause : Play}
              onClick={handlePlayPause}
            >
              {isRunning ? "Pause" : remainingTime === 0 ? "Restart" : "Start"}
            </Button>
            <Button variant="ghost" size="lg" icon={RotateCcw} onClick={handleReset}>
              Reset
            </Button>
          </div>

          <div className="mt-6 flex items-center gap-2 text-sm text-gray-400">
            <Timer className="h-4 w-4" />
            <span>
              Session {sessionsCompleted + 1} / {sessionsBeforeLongBreak}
            </span>
          </div>
        </GlassCard>
      </motion.div>

      <GlassCard className="p-5">
        <button
          onClick={() => setSettingsOpen(!settingsOpen)}
          className="flex w-full items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-200">Settings</span>
          </div>
          {settingsOpen ? (
            <ChevronUp className="h-4 w-4 text-gray-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-400" />
          )}
        </button>

        {settingsOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="mt-4 space-y-4 border-t border-white/10 pt-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Work Duration (min)"
                type="number"
                min={1}
                max={120}
                value={workDuration}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 25;
                  setWorkDuration(Math.min(120, Math.max(1, val)));
                }}
              />
              <Input
                label="Break Duration (min)"
                type="number"
                min={1}
                max={30}
                value={breakDuration}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 5;
                  setBreakDuration(Math.min(30, Math.max(1, val)));
                }}
              />
              <Input
                label="Long Break (min)"
                type="number"
                min={1}
                max={60}
                value={longBreakDuration}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 15;
                  setLongBreakDuration(Math.min(60, Math.max(1, val)));
                }}
              />
              <Input
                label="Sessions before long break"
                type="number"
                min={1}
                max={10}
                value={sessionsBeforeLongBreak}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 4;
                  setSessionsBeforeLongBreak(Math.min(10, Math.max(1, val)));
                }}
              />
            </div>
          </motion.div>
        )}
      </GlassCard>
    </div>
  );
}
