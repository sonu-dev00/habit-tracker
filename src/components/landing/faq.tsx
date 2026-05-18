"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
  {
    question: "What is HabitForge?",
    answer:
      "HabitForge is an AI-powered habit tracking platform that helps you build and maintain positive habits through gamification, personalized coaching, and accountability features.",
  },
  {
    question: "How does the AI coaching work?",
    answer:
      "Our AI analyzes your habit patterns, streaks, and progress to provide personalized motivation, suggestions, and weekly reviews. It adapts to your unique habits and goals.",
  },
  {
    question: "Is my data secure?",
    answer:
      "Yes, we use industry-standard encryption for all data. Your habit data is private and never shared without your explicit consent. We are GDPR and CCPA compliant.",
  },
  {
    question: "Can I cancel my subscription anytime?",
    answer:
      "Yes, you can cancel your subscription at any time from your account settings. Your data will remain accessible until the end of your billing period.",
  },
  {
    question: "How are XP and levels calculated?",
    answer:
      "XP is earned by completing habits. Each habit has a base XP reward (1-100) multiplied by priority level. Level thresholds increase progressively as you advance.",
  },
  {
    question: "Do you offer a student discount?",
    answer:
      "Yes, students can get 50% off the Pro plan with a valid .edu email address. Contact our support team for verification.",
  },
  {
    question: "Can I use HabitForge with my team?",
    answer:
      "Yes! Our Teams plan supports up to 10 members with shared challenges, team analytics, and an admin dashboard for tracking group progress.",
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="relative py-24 px-4" id="faq">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute bottom-1/3 right-1/4 h-[400px] w-[400px] rounded-full bg-blue-500/5 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold">
            Frequently Asked{" "}
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-[#39ff14] bg-clip-text text-transparent">
              Questions
            </span>
          </h2>
        </motion.div>

        <div className="space-y-3">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="flex w-full items-center justify-between px-6 py-4 text-left transition-colors hover:bg-white/[0.02]"
                >
                  <span className="text-sm font-medium text-gray-200 pr-4">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 text-gray-500 flex-shrink-0 transition-transform duration-200",
                      isOpen && "rotate-180"
                    )}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-4 text-sm text-gray-500 leading-relaxed">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
