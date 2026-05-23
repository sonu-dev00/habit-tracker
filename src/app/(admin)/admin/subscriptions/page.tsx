"use client";

import { useState } from "react";
import { CreditCard, Users, Clock, DollarSign, XCircle, RotateCcw } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { GlassCard } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

interface Subscription {
  id: string;
  plan: string;
  status: string;
  cancelAtPeriodEnd: boolean;
  stripeCurrentPeriodEnd: string | null;
  createdAt: string;
  user: { id: string; name: string | null; email: string | null; image: string | null };
}

async function fetchSubscriptions(params: { plan: string; status: string }) {
  const searchParams = new URLSearchParams();
  if (params.plan) searchParams.set("plan", params.plan);
  if (params.status) searchParams.set("status", params.status);
  const res = await fetch(`/api/admin/subscriptions?${searchParams}`);
  if (!res.ok) throw new Error("Failed to fetch subscriptions");
  return res.json();
}

export default function AdminSubscriptionsPage() {
  const [planFilter, setPlanFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-subscriptions", planFilter, statusFilter],
    queryFn: () => fetchSubscriptions({ plan: planFilter, status: statusFilter }),
  });

  const subscriptions: Subscription[] = data?.data ?? [];
  const stats = data?.stats ?? { active: 0, trial: 0, canceled: 0, pastDue: 0, totalRevenue: 0 };

  const statCards = [
    { label: "Active", value: stats.active, icon: CreditCard, color: "text-emerald-400" },
    { label: "Trial", value: stats.trial, icon: Clock, color: "text-blue-400" },
    { label: "Canceled", value: stats.canceled, icon: XCircle, color: "text-red-400" },
    { label: "Est. Revenue", value: `$${stats.totalRevenue}/mo`, icon: DollarSign, color: "text-yellow-400" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Subscriptions</h1>
        <p className="text-sm text-gray-400 mt-1">
          Manage user subscriptions and billing
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

      <div className="flex gap-2">
        <div className="w-40">
          <Select
            options={[
              { value: "", label: "All Plans" },
              { value: "FREE", label: "Free" },
              { value: "PRO", label: "Pro" },
              { value: "TEAMS", label: "Teams" },
            ]}
            value={planFilter}
            onChange={setPlanFilter}
            placeholder="Plan"
          />
        </div>
        <div className="w-40">
          <Select
            options={[
              { value: "", label: "All Status" },
              { value: "active", label: "Active" },
              { value: "trialing", label: "Trial" },
              { value: "canceled", label: "Canceled" },
              { value: "past_due", label: "Past Due" },
            ]}
            value={statusFilter}
            onChange={setStatusFilter}
            placeholder="Status"
          />
        </div>
      </div>

      <GlassCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02]">
                <th className="text-left py-3 px-4 text-gray-500 font-medium">User</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Plan</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Status</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Period End</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Created</th>
                <th className="text-right py-3 px-4 text-gray-500 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-white/5">
                      {Array.from({ length: 6 }).map((_, j) => (
                        <td key={j} className="py-3 px-4">
                          <Skeleton className="h-4 w-20" />
                        </td>
                      ))}
                    </tr>
                  ))
                : subscriptions.map((sub) => (
                    <tr
                      key={sub.id}
                      className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div>
                          <p className="text-gray-200 font-medium">
                            {sub.user.name || "N/A"}
                          </p>
                          <p className="text-xs text-gray-500">{sub.user.email}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={sub.plan === "PRO" ? "brand" : sub.plan === "TEAMS" ? "info" : "default"}
                          size="sm"
                        >
                          {sub.plan}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={sub.status === "active" ? "success" : sub.status === "trialing" ? "info" : sub.status === "past_due" ? "warning" : "error"}
                          size="sm"
                        >
                          {sub.cancelAtPeriodEnd ? "Canceled" : sub.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-gray-400">
                        {sub.stripeCurrentPeriodEnd
                          ? new Date(sub.stripeCurrentPeriodEnd).toLocaleDateString()
                          : "N/A"}
                      </td>
                      <td className="py-3 px-4 text-gray-400">
                        {new Date(sub.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="xs" icon={XCircle} disabled={sub.status !== "active"} />
                          <Button variant="ghost" size="xs" icon={RotateCcw} disabled={sub.status !== "canceled"} />
                        </div>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
