"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Check, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const plans = [
  {
    name: "Starter",
    description: "Get started with basic habit tracking tools.",
    price: 0,
    billing: "Free forever",
    features: [
      "Up to 5 habits",
      "Basic tracking",
      "Daily streaks",
      "Achievement badges",
      "7-day history",
    ],
    missing: ["AI coaching", "Advanced analytics", "Unlimited history"],
  },
  {
    name: "Pro",
    description: "Advanced features for serious habit builders.",
    price: 9,
    billing: "per month",
    popular: true,
    features: [
      "Unlimited habits",
      "AI coaching & motivation",
      "Advanced analytics",
      "Unlimited history",
      "Custom reminders",
      "Priority support",
      "Export data",
    ],
    missing: [],
  },
  {
    name: "Teams",
    description: "Build habits together with your team.",
    price: 29,
    billing: "per month",
    features: [
      "Everything in Pro",
      "Up to 10 team members",
      "Team challenges",
      "Shared analytics",
      "Admin dashboard",
      "API access",
      "SSO integration",
    ],
    missing: [],
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

export function Pricing() {
  return (
    <section className="relative py-24 px-4" id="pricing">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/3 right-1/3 h-[400px] w-[400px] rounded-full bg-[#39ff14]/5 blur-[120px]" />
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
            Simple,{" "}
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-[#39ff14] bg-clip-text text-transparent">
              Transparent
            </span>{" "}
            Pricing
          </h2>
          <p className="mt-4 text-gray-400 max-w-2xl mx-auto text-lg">
            Choose the plan that fits your habit-building journey. Upgrade anytime.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              className={`relative rounded-2xl border p-6 backdrop-blur-xl transition-all duration-300 ${
                plan.popular
                  ? "border-blue-500/30 bg-blue-500/[0.03] shadow-xl shadow-blue-500/10 scale-105 md:scale-105"
                  : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge
                    variant="brand"
                    className="text-xs px-3 py-1 border border-blue-500/30"
                  >
                    <Sparkles className="h-3 w-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-100">{plan.name}</h3>
                <p className="mt-1.5 text-sm text-gray-500">{plan.description}</p>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-gray-100">
                    {plan.price === 0 ? "Free" : `$${plan.price}`}
                  </span>
                  {plan.price > 0 && (
                    <span className="text-sm text-gray-500">{plan.billing}</span>
                  )}
                </div>
                {plan.price === 0 && (
                  <span className="text-sm text-gray-500">{plan.billing}</span>
                )}
              </div>

              <Link href="/register">
                <Button
                  variant={plan.popular ? "primary" : "secondary"}
                  className="w-full mb-6"
                >
                  {plan.price === 0 ? "Get Started Free" : `Start ${plan.name}`}
                </Button>
              </Link>

              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm">
                    <Check className="h-4 w-4 text-[#39ff14] flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
                {plan.missing.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm">
                    <X className="h-4 w-4 text-gray-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
