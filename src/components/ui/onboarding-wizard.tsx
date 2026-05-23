"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, CheckSquare, BarChart3, MessageSquare, ArrowRight, X, Check } from "lucide-react";
import { useOnboardingStore } from "@/store";
import { Button } from "@/components/ui/button";

const STEPS = [
  {
    title: "Welcome to HabitForge",
    description: "Build better habits, track your progress, and level up your life — one day at a time.",
    icon: Sparkles,
    color: "from-blue-500 to-purple-600",
  },
  {
    title: "Create Habits",
    description: "Add habits you want to build. Set categories, priorities, and frequencies. Complete them daily to build streaks.",
    icon: CheckSquare,
    color: "from-emerald-500 to-teal-600",
  },
  {
    title: "Track Your Progress",
    description: "View analytics, completion rates, and streaks. See how you're improving over days, weeks, and months.",
    icon: BarChart3,
    color: "from-orange-500 to-rose-600",
  },
  {
    title: "AI Coach",
    description: "Get personalized motivation, habit tips, and daily quotes from your AI coach. Ask for advice or a motivational boost.",
    icon: MessageSquare,
    color: "from-cyan-500 to-blue-600",
  },
];

export function OnboardingWizard() {
  const { completed, currentStep, setCompleted, setCurrentStep, reset } = useOnboardingStore();
  const [open, setOpen] = useState(!completed);

  if (completed && !open) return null;

  const step = STEPS[currentStep];
  const Icon = step.icon;
  const isLast = currentStep === STEPS.length - 1;

  const handleNext = () => {
    if (isLast) {
      setCompleted();
      setOpen(false);
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleSkip = () => {
    setCompleted();
    setOpen(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2"
          >
            <div className="rounded-2xl border border-white/10 bg-gray-900/95 backdrop-blur-xl p-6 shadow-2xl">
              <div className="flex justify-end">
                <button
                  onClick={handleSkip}
                  className="rounded-lg p-1.5 text-gray-500 hover:text-gray-300 hover:bg-white/5 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="flex flex-col items-center text-center px-2">
                <div className={`h-16 w-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-5`}>
                  <Icon className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-100 mb-2">{step.title}</h2>
                <p className="text-sm text-gray-400 leading-relaxed">{step.description}</p>
              </div>

              <div className="flex items-center justify-center gap-2 my-6">
                {STEPS.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === currentStep ? "w-8 bg-blue-500" : "w-1.5 bg-white/10"
                    }`}
                  />
                ))}
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleSkip}
                  className="flex-1 rounded-xl border border-white/10 px-4 py-2.5 text-sm text-gray-400 hover:text-gray-200 hover:bg-white/5 transition-colors"
                >
                  Skip
                </button>
                <button
                  onClick={handleNext}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2.5 text-sm font-semibold text-white hover:from-blue-500 hover:to-purple-500 transition-all"
                >
                  {isLast ? (
                    <>Get Started <Check className="h-4 w-4" /></>
                  ) : (
                    <>Next <ArrowRight className="h-4 w-4" /></>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
