"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Software Engineer",
    content:
      "HabitForge completely transformed my daily routine. The AI coach keeps me motivated, and the streak system makes me never want to break my chain.",
    rating: 5,
  },
  {
    name: "Marcus Chen",
    role: "Entrepreneur",
    content:
      "I've tried countless habit trackers, but HabitForge is different. The gamification and analytics helped me understand my patterns and improve consistently.",
    rating: 5,
  },
  {
    name: "Emily Rodriguez",
    role: "Student",
    content:
      "The team challenges feature helped my study group stay accountable. We've maintained a 30-day streak and our grades have never been better!",
    rating: 5,
  },
  {
    name: "David Kim",
    role: "Fitness Coach",
    content:
      "I recommend HabitForge to all my clients. The habit categorization and weekly reviews provide insights that help them stay on track with their fitness goals.",
    rating: 4,
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: "easeOut" as const },
  }),
};

export function Testimonials() {
  return (
    <section className="relative py-24 px-4" id="testimonials">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute bottom-1/3 left-1/4 h-[400px] w-[400px] rounded-full bg-blue-500/5 blur-[120px]" />
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
            Loved by{" "}
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-[#39ff14] bg-clip-text text-transparent">
              Habit Builders
            </span>
          </h2>
          <p className="mt-4 text-gray-400 max-w-2xl mx-auto text-lg">
            See what our community has to say about their HabitForge experience.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {testimonials.map((testimonial, i) => (
            <motion.div
              key={testimonial.name}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-6 hover:bg-white/[0.06] transition-all duration-300"
            >
              <div className="flex gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star
                    key={j}
                    className={`h-4 w-4 ${
                      j < testimonial.rating
                        ? "fill-amber-400 text-amber-400"
                        : "fill-white/10 text-white/10"
                    }`}
                  />
                ))}
              </div>
              <p className="text-gray-300 leading-relaxed mb-6">
                &ldquo;{testimonial.content}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <Avatar
                  name={testimonial.name}
                  size="md"
                />
                <div>
                  <p className="text-sm font-medium text-gray-200">
                    {testimonial.name}
                  </p>
                  <p className="text-xs text-gray-500">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
