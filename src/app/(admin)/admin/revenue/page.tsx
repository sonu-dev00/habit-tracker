"use client";

import { useMemo } from "react";
import { DollarSign, TrendingUp, CreditCard, FileText } from "lucide-react";
import { GlassCard } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useRevenue } from "@/lib/hooks/use-admin-data";

function StatCard({ icon: Icon, label, value, sub, color }: { icon: any; label: string; value: string; sub?: string; color: string }) {
  return (
    <GlassCard className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</p>
          <p className="mt-1.5 text-2xl font-bold text-gray-100">{value}</p>
          {sub && <p className="mt-0.5 text-xs text-gray-500">{sub}</p>}
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </GlassCard>
  );
}

export default function AdminRevenuePage() {
  const { data, isLoading } = useRevenue();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (<Skeleton key={i} className="h-28" />))}
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Revenue</h1>
        <p className="text-sm text-gray-400 mt-1">Real-time revenue analytics</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={DollarSign} label="Monthly Recurring Revenue" value={`$${data.mrr.toLocaleString()}`} color="bg-emerald-500/15 text-emerald-400" />
        <StatCard icon={TrendingUp} label="Annual Run Rate" value={`$${data.arr.toLocaleString()}`} color="bg-blue-500/15 text-blue-400" />
        <StatCard icon={CreditCard} label="Pending Invoices" value={String(data.pendingInvoices)} sub={`$${data.pendingAmount.toLocaleString()}`} color="bg-amber-500/15 text-amber-400" />
        <StatCard icon={FileText} label="Active Plans" value={String(data.byPlan.reduce((s, p) => s + p.count, 0))} color="bg-purple-500/15 text-purple-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard className="p-5">
          <h3 className="text-sm font-semibold text-gray-200 mb-4">Monthly Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "rgba(17,24,39,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px" }} />
                <Bar dataKey="amount" fill="url(#revenueGradient)" radius={[6, 6, 0, 0]} maxBarSize={40} />
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0.3} />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard className="p-5">
          <h3 className="text-sm font-semibold text-gray-200 mb-4">By Plan</h3>
          <div className="space-y-4">
            {data.byPlan.map((plan) => {
              const total = data.byPlan.reduce((s, p) => s + p.amount, 0);
              const pct = total > 0 ? Math.round((plan.amount / total) * 100) : 0;
              return (
                <div key={plan.plan}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-300">{plan.plan}</span>
                    <span className="text-sm text-gray-100 font-medium">${plan.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
                      <div className="h-full rounded-full bg-blue-500 transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs text-gray-500 w-8 text-right">{pct}%</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{plan.count} subscriber{plan.count !== 1 ? "s" : ""}</p>
                </div>
              );
            })}
          </div>
        </GlassCard>
      </div>

      <GlassCard className="p-5">
        <h3 className="text-sm font-semibold text-gray-200 mb-4">Recent Payments</h3>
        <div className="space-y-2">
          {data.paymentHistory.slice(0, 10).map((p) => (
            <div key={p.id} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-4 py-3">
              <div>
                <p className="text-sm text-gray-200">{p.user?.name || "Unknown"}</p>
                <p className="text-xs text-gray-500">{p.user?.email} — {p.plan}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-100">${(p.amount / 100).toFixed(2)}</p>
                <Badge variant={p.status === "succeeded" ? "success" : p.status === "pending" ? "warning" : "default"} size="sm">
                  {p.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
