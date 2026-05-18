"use client";

import { useEffect, useState } from "react";
import { DollarSign, TrendingUp, CreditCard, FileText, Download } from "lucide-react";
import { GlassCard } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

interface RevenueData {
  mrr: number;
  arr: number;
  byPlan: { plan: string; amount: number; count: number }[];
  paymentHistory: {
    id: string;
    user: { name: string | null; email: string | null };
    amount: number;
    currency: string;
    status: string;
    plan: string;
    createdAt: string;
  }[];
  pendingInvoices: number;
  pendingAmount: number;
}

export default function AdminRevenuePage() {
  const [data, setData] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const mockData: RevenueData = {
      mrr: 45230,
      arr: 542760,
      byPlan: [
        { plan: "Pro Monthly", amount: 32400, count: 3600 },
        { plan: "Pro Yearly", amount: 8900, count: 1200 },
        { plan: "Teams Monthly", amount: 2900, count: 100 },
        { plan: "Teams Yearly", amount: 1030, count: 35 },
      ],
      paymentHistory: Array.from({ length: 15 }, (_, i) => ({
        id: `pay_${i}`,
        user: {
          name: `User ${i + 1}`,
          email: `user${i + 1}@example.com`,
        },
        amount: Math.floor(Math.random() * 900 + 100),
        currency: "usd",
        status: ["succeeded", "succeeded", "succeeded", "pending", "failed"][
          Math.floor(Math.random() * 5)
        ],
        plan: ["Pro", "Teams", "Pro", "Pro Yearly"][
          Math.floor(Math.random() * 4)
        ],
        createdAt: new Date(
          Date.now() - Math.floor(Math.random() * 30) * 86400000
        ).toISOString(),
      })),
      pendingInvoices: 12,
      pendingAmount: 3840,
    };
    setData(mockData);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
              <Skeleton className="h-3 w-1/3" />
              <Skeleton className="h-8 w-1/2" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          ))}
        </div>
        <Skeleton className="h-64 rounded-2xl" />
        <Skeleton className="h-48 rounded-2xl" />
      </div>
    );
  }

  if (!data) return null;

  const statCards = [
    {
      label: "Monthly Recurring Revenue",
      value: `$${data.mrr.toLocaleString()}`,
      icon: DollarSign,
      color: "text-emerald-400",
    },
    {
      label: "Annual Run Rate",
      value: `$${data.arr.toLocaleString()}`,
      icon: TrendingUp,
      color: "text-blue-400",
    },
    {
      label: "Pending Invoices",
      value: data.pendingInvoices,
      icon: FileText,
      color: "text-amber-400",
    },
    {
      label: "Pending Amount",
      value: `$${data.pendingAmount.toLocaleString()}`,
      icon: CreditCard,
      color: "text-red-400",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Revenue Dashboard</h1>
        <p className="text-sm text-gray-400 mt-1">
          Track revenue, MRR, and payment history
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <GlassCard key={stat.label} className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5">
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                  <p className="text-xl font-bold text-white">{stat.value}</p>
                </div>
              </div>
            </GlassCard>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard className="p-6">
          <h3 className="text-sm font-medium text-gray-300 mb-4">
            Revenue by Plan
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.byPlan}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.05)"
                />
                <XAxis
                  dataKey="plan"
                  tick={{ fill: "#6b7280", fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fill: "#6b7280", fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `$${v}`}
                />
                <Tooltip
                  contentStyle={{
                    background: "rgba(17,24,39,0.95)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "12px",
                    color: "#f1f5f9",
                  }}
                  formatter={(value) => [`$${value}`, "Revenue"] as unknown as [string, string]}
                />
                <Bar dataKey="amount" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <h3 className="text-sm font-medium text-gray-300 mb-4">
            Revenue Breakdown
          </h3>
          <div className="space-y-4">
            {data.byPlan.map((plan) => (
              <div
                key={plan.plan}
                className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03]"
              >
                <div>
                  <p className="text-sm text-gray-200 font-medium">
                    {plan.plan}
                  </p>
                  <p className="text-xs text-gray-500">
                    {plan.count} subscribers
                  </p>
                </div>
                <p className="text-sm font-bold text-white">
                  ${plan.amount.toLocaleString()}
                </p>
              </div>
            ))}
            <div className="flex items-center justify-between p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <p className="text-sm font-medium text-blue-300">Total MRR</p>
              <p className="text-sm font-bold text-blue-300">
                ${data.mrr.toLocaleString()}
              </p>
            </div>
          </div>
        </GlassCard>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-300">
            Recent Payments
          </h3>
          <Button variant="secondary" size="sm" icon={Download}>
            Export
          </Button>
        </div>

        <GlassCard className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.02]">
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">
                    User
                  </th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">
                    Amount
                  </th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">
                    Plan
                  </th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.paymentHistory.map((payment) => (
                  <tr
                    key={payment.id}
                    className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div>
                        <p className="text-gray-200 font-medium">
                          {payment.user.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {payment.user.email}
                        </p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-white">
                        ${payment.amount.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={
                          payment.plan === "Pro"
                            ? "brand"
                            : "info"
                        }
                        size="sm"
                      >
                        {payment.plan}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={
                          payment.status === "succeeded"
                            ? "success"
                            : payment.status === "pending"
                            ? "warning"
                            : "error"
                        }
                        size="sm"
                      >
                        {payment.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-gray-400">
                      {new Date(payment.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
