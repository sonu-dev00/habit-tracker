"use client";

import { Brain, MessageSquare, Zap, AlertTriangle, Activity } from "lucide-react";
import { GlassCard } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useAiUsage } from "@/lib/hooks/use-admin-data";

export default function AiMonitorPage() {
  const { data, isLoading } = useAiUsage();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (<Skeleton key={i} className="h-28" />))}
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">AI Monitor</h1>
        <p className="text-sm text-gray-400 mt-1">Real-time AI usage and performance</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase">Total Requests</p>
              <p className="mt-1.5 text-2xl font-bold text-gray-100">{data.totalRequests.toLocaleString()}</p>
              <p className="mt-0.5 text-xs text-gray-500">{data.totalTokens.toLocaleString()} tokens</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/15 text-violet-400">
              <Brain className="h-5 w-5" />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase">Active Users</p>
              <p className="mt-1.5 text-2xl font-bold text-gray-100">{data.activeUsers}</p>
              <p className="mt-0.5 text-xs text-gray-500">last 30 days</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/15 text-blue-400">
              <Activity className="h-5 w-5" />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase">Avg Response</p>
              <p className="mt-1.5 text-2xl font-bold text-gray-100">{data.avgResponseTime}s</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
              <Zap className="h-5 w-5" />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase">Error Rate</p>
              <p className="mt-1.5 text-2xl font-bold text-gray-100">{data.errorRate}%</p>
            </div>
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${data.errorRate > 5 ? "bg-red-500/15 text-red-400" : "bg-emerald-500/15 text-emerald-400"}`}>
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>
        </GlassCard>
      </div>

      <GlassCard className="p-5">
        <h3 className="text-sm font-semibold text-gray-200 mb-4">Usage (30 days)</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.usageOverTime}>
              <defs>
                <linearGradient id="aiGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "rgba(17,24,39,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px" }} />
              <Area type="monotone" dataKey="requests" stroke="#8b5cf6" strokeWidth={2} fill="url(#aiGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard className="p-5">
          <h3 className="text-sm font-semibold text-gray-200 mb-4">Endpoints</h3>
          <div className="space-y-3">
            {data.endpoints.map((ep) => (
              <div key={ep.name} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-4 py-3">
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-200">{ep.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-gray-500">{ep.count} calls</span>
                  <Badge variant="default" size="sm">~{ep.avgTokens} tokens</Badge>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="p-5">
          <h3 className="text-sm font-semibold text-gray-200 mb-4">Recent Activity</h3>
          <div className="space-y-2">
            {data.recentActivity.slice(0, 10).map((a, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-4 py-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 font-mono">{a.userId}...</span>
                  <Badge variant="info" size="sm">{a.type}</Badge>
                </div>
                <span className="text-xs text-gray-500">{a.time}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
