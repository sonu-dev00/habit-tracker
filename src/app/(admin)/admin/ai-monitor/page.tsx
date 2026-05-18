"use client";

import { useEffect, useState } from "react";
import { Brain, MessageSquare, Zap, AlertTriangle, Activity } from "lucide-react";
import { GlassCard } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface AiMonitorData {
  totalRequests: number;
  activeUsers: number;
  avgResponseTime: number;
  errorRate: number;
  usageOverTime: { date: string; requests: number }[];
  recentActivity: { time: string; user: string; type: string; tokens: number }[];
  endpoints: { name: string; count: number; avgTokens: number }[];
}

export default function AiMonitorPage() {
  const [data] = useState<AiMonitorData>({
    totalRequests: 15420,
    activeUsers: 892,
    avgResponseTime: 1.2,
    errorRate: 0.8,
    usageOverTime: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 86400000).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      requests: Math.floor(Math.random() * 200 + 300),
    })),
    recentActivity: [
      { time: "2 min ago", user: "user_3f8a", type: "chat", tokens: 245 },
      { time: "5 min ago", user: "user_7b2c", type: "motivate", tokens: 120 },
      { time: "12 min ago", user: "user_1d4e", type: "weekly-review", tokens: 380 },
      { time: "18 min ago", user: "user_9a5f", type: "roast", tokens: 95 },
      { time: "25 min ago", user: "user_4c6b", type: "chat", tokens: 512 },
    ],
    endpoints: [
      { name: "Chat", count: 8230, avgTokens: 340 },
      { name: "Motivate", count: 3420, avgTokens: 120 },
      { name: "Roast", count: 1890, avgTokens: 95 },
      { name: "Weekly Review", count: 1240, avgTokens: 380 },
      { name: "Quote", count: 640, avgTokens: 50 },
    ],
  });

  const statCards = [
    { label: "Total Requests", value: data.totalRequests.toLocaleString(), icon: Brain, color: "text-purple-400" },
    { label: "Active Users", value: data.activeUsers.toLocaleString(), icon: MessageSquare, color: "text-blue-400" },
    { label: "Avg Response", value: `${data.avgResponseTime}s`, icon: Zap, color: "text-emerald-400" },
    { label: "Error Rate", value: `${data.errorRate}%`, icon: AlertTriangle, color: "text-amber-400" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">AI Monitor</h1>
        <p className="text-sm text-gray-400 mt-1">
          Monitor AI feature usage and performance
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GlassCard className="lg:col-span-2 p-6">
          <h3 className="text-sm font-medium text-gray-300 mb-4">AI Usage (30 Days)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.usageOverTime}>
                <defs>
                  <linearGradient id="aiUsage" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" tick={{ fill: "#6b7280", fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "rgba(17,24,39,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "#f1f5f9" }} />
                <Area type="monotone" dataKey="requests" stroke="#8b5cf6" strokeWidth={2} fill="url(#aiUsage)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <h3 className="text-sm font-medium text-gray-300 mb-4">Endpoint Usage</h3>
          <div className="space-y-3">
            {data.endpoints.map((ep) => (
              <div key={ep.name} className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03]">
                <div>
                  <p className="text-sm text-gray-200">{ep.name}</p>
                  <p className="text-xs text-gray-500">{ep.avgTokens} avg tokens</p>
                </div>
                <span className="text-sm font-medium text-white">{ep.count.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      <GlassCard className="p-6">
        <h3 className="text-sm font-medium text-gray-300 mb-4">Recent Activity</h3>
        <div className="divide-y divide-white/10">
          {data.recentActivity.map((activity, i) => (
            <div key={i} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <Activity className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-200">
                    <span className="font-medium">{activity.user}</span> used{" "}
                    <Badge variant="brand" size="sm">{activity.type}</Badge>
                  </p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
              <span className="text-xs text-gray-500">{activity.tokens} tokens</span>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
