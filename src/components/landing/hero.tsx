"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Sparkles, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

const stats = [
  { label: "Active Users", value: "12K+" },
  { label: "Habits Tracked", value: "1.2M+" },
  { label: "Avg Streak", value: "24d" },
  { label: "Rating", value: "4.9★" },
];

export function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden px-4 pt-20 pb-16">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/4 left-1/4 h-[600px] w-[600px] rounded-full bg-blue-500/10 blur-[150px]" />
        <div className="absolute bottom-1/4 right-1/4 h-[500px] w-[500px] rounded-full bg-purple-500/10 blur-[150px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[400px] rounded-full bg-[#39ff14]/5 blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-xl px-4 py-1.5 text-sm text-gray-400">
            <Sparkles className="h-3.5 w-3.5 text-blue-400" />
            <span>AI-Powered Habit Tracking</span>
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1]"
        >
          Build{" "}
          <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-[#39ff14] bg-clip-text text-transparent">
            Unbreakable
          </span>{" "}
          Habits
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          className="mt-6 mx-auto max-w-2xl text-lg sm:text-xl text-gray-400 leading-relaxed"
        >
          Transform your life with AI-powered coaching, gamification, and
          personalized insights. Track, analyze, and master your daily habits.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link href="/register">
            <Button size="xl" className="w-full sm:w-auto text-base gap-2">
              <Sparkles className="h-4 w-4" />
              Start Free Trial
            </Button>
          </Link>
          <Link href="#features">
            <Button
              variant="secondary"
              size="xl"
              className="w-full sm:w-auto text-base gap-2"
            >
              <Play className="h-4 w-4" />
              Watch Demo
            </Button>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5, ease: "easeOut" }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6"
        >
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl px-4 py-5"
            >
              <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                {stat.value}
              </div>
              <div className="mt-1 text-sm text-gray-500">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
