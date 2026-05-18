"use client";

import { motion } from "framer-motion";
import {
  Brain,
  BarChart3,
  Trophy,
  MessageSquare,
  Timer,
  Sparkles,
  Shield,
  Layers,
  Target,
} from "lucide-react";

const features = [
  {
    title: "AI Coach",
    description: "Get personalized motivation and insights powered by AI that adapts to your unique habits.",
    icon: Brain,
    gradient: "from-blue-500 to-blue-600",
    glow: "shadow-blue-500/20",
  },
  {
    title: "Beautiful Analytics",
    description: "Visualize your progress with stunning charts and detailed breakdowns of your habit data.",
    icon: BarChart3,
    gradient: "from-purple-500 to-purple-600",
    glow: "shadow-purple-500/20",
  },
  {
    title: "Gamification",
    description: "Earn XP, level up, unlock achievements, and compete on leaderboards to stay motivated.",
    icon: Trophy,
    gradient: "from-amber-500 to-orange-600",
    glow: "shadow-amber-500/20",
  },
  {
    title: "AI Chat",
    description: "Chat with your AI coach for real-time advice, encouragement, and habit optimization tips.",
    icon: MessageSquare,
    gradient: "from-green-500 to-emerald-600",
    glow: "shadow-green-500/20",
  },
  {
    title: "Pomodoro Timer",
    description: "Built-in focus timer with customizable intervals to help you build deep work sessions.",
    icon: Timer,
    gradient: "from-red-500 to-rose-600",
    glow: "shadow-red-500/20",
  },
  {
    title: "Smart Suggestions",
    description: "AI analyzes your patterns and suggests optimal times and strategies for your habits.",
    icon: Sparkles,
    gradient: "from-indigo-500 to-indigo-600",
    glow: "shadow-indigo-500/20",
  },
  {
    title: "Streak Freeze",
    description: "Never lose your streak with protection days that keep your momentum alive.",
    icon: Shield,
    gradient: "from-teal-500 to-teal-600",
    glow: "shadow-teal-500/20",
  },
  {
    title: "Habit Categories",
    description: "Organize habits across health, work, learning, and more for a balanced life.",
    icon: Layers,
    gradient: "from-violet-500 to-violet-600",
    glow: "shadow-violet-500/20",
  },
  {
    title: "Priority Levels",
    description: "Set priority levels to focus on what matters most and optimize your daily routine.",
    icon: Target,
    gradient: "from-rose-500 to-pink-600",
    glow: "shadow-rose-500/20",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

export function Features() {
  return (
    <section className="relative py-24 px-4" id="features">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/3 right-1/4 h-[400px] w-[400px] rounded-full bg-purple-500/5 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold">
            Everything You Need to{" "}
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-[#39ff14] bg-clip-text text-transparent">
              Succeed
            </span>
          </h2>
          <p className="mt-4 text-gray-400 max-w-2xl mx-auto text-lg">
            Powerful features designed to help you build and maintain habits that stick.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                variants={cardVariants}
                className="group rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-6 hover:bg-white/[0.06] transition-all duration-300 hover:scale-[1.02]"
              >
                <div
                  className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient} shadow-lg ${feature.glow}`}
                >
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-100 group-hover:text-white transition-colors">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm text-gray-500 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
