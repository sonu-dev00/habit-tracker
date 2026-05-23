"use client";

import { motion } from "framer-motion";
import { Check, X, Sparkles } from "lucide-react";
import { GlassCard } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { PLANS, FEATURES, type PlanFeature } from "@/lib/billing";

const stagger = {
  container: { animate: { transition: { staggerChildren: 0.05 } } },
  item: {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" as const } },
  },
};

function CheckIcon({ active }: { active: boolean | string }) {
  if (typeof active === "string") {
    return <span className="text-xs text-gray-400">{active}</span>;
  }
  return active ? <Check className="h-4 w-4 text-emerald-400" /> : <X className="h-4 w-4 text-gray-600" />;
}

function PricingCard({ planId, label, priceLabel, popular, currentPlan }: {
  planId: string;
  label: string;
  priceLabel: string;
  popular: boolean;
  currentPlan: string;
}) {
  const isCurrent = currentPlan === planId;
  return (
    <GlassCard className={`p-6 relative ${popular ? "border-blue-500/40" : ""} ${isCurrent ? "ring-2 ring-blue-500" : ""}`}>
      {popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge variant="brand" size="sm">Most Popular</Badge>
        </div>
      )}
      <div className="text-center mb-6">
        <h3 className="text-lg font-bold text-gray-100">{label}</h3>
        <p className="text-3xl font-bold text-gray-100 mt-2">{priceLabel}</p>
        {planId === "FREE" && <p className="text-sm text-gray-500 mt-1">Free forever</p>}
      </div>
      {isCurrent ? (
        <div className="flex items-center justify-center gap-2 rounded-xl bg-blue-600/20 text-blue-400 py-2.5 text-sm font-medium">
          <Check className="h-4 w-4" /> Current Plan
        </div>
      ) : planId === "FREE" ? (
        <Button variant="ghost" className="w-full" onClick={() => window.location.href = "/settings"}>
          Downgrade
        </Button>
      ) : (
        <Button variant="primary" className="w-full" icon={Sparkles}>
          Upgrade to {label}
        </Button>
      )}
    </GlassCard>
  );
}

export default function BillingPage() {
  const { data: session } = useSession();

  const { data: billingData, isLoading } = useQuery({
    queryKey: ["billing"],
    queryFn: async () => {
      const res = await fetch("/api/billing");
      const json = await res.json();
      return json.data;
    },
  });

  if (!session?.user) return null;

  return (
    <motion.div variants={stagger.container} initial="initial" animate="animate" className="space-y-8">
      <motion.div variants={stagger.item}>
        <h1 className="text-2xl font-bold text-gray-100">Billing & Plans</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          Manage your subscription and plan
        </p>
      </motion.div>

      <motion.div variants={stagger.item} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PLANS.map((plan) => (
          <PricingCard key={plan.id} planId={plan.id} label={plan.name} priceLabel={plan.priceLabel} popular={plan.popular} currentPlan={billingData?.plan ?? "FREE"} />
        ))}
      </motion.div>

      <motion.div variants={stagger.item}>
        <GlassCard className="p-6">
          <h2 className="text-lg font-semibold text-gray-100 mb-4">Feature Comparison</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 pr-4 text-gray-500 font-medium">Feature</th>
                {PLANS.map((p) => (
                  <th key={p.id} className="text-center py-3 px-4 text-gray-500 font-medium">{p.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {FEATURES.map((feature) => (
                  <tr key={feature.name} className="border-b border-white/5">
                    <td className="py-3 pr-4 text-gray-300">{feature.name}</td>
                    <td className="text-center py-3 px-4"><CheckIcon active={feature.free} /></td>
                    <td className="text-center py-3 px-4"><CheckIcon active={feature.pro} /></td>
                    <td className="text-center py-3 px-4"><CheckIcon active={feature.teams} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </motion.div>

      {billingData?.plan !== "FREE" && (
        <motion.div variants={stagger.item}>
          <GlassCard className="p-6">
            <h2 className="text-lg font-semibold text-gray-100 mb-2">Subscription Details</h2>
            <div className="space-y-2 text-sm">
              <p className="text-gray-400">Plan: <span className="text-gray-200 font-medium">{billingData?.plan}</span></p>
              <p className="text-gray-400">Status: <Badge variant={billingData?.status === "active" ? "success" : "warning"} size="sm">{billingData?.status}</Badge></p>
              <p className="text-gray-400">Cancel at period end: <span className="text-gray-200">{billingData?.cancelAtPeriodEnd ? "Yes" : "No"}</span></p>
            </div>
          </GlassCard>
        </motion.div>
      )}
    </motion.div>
  );
}
