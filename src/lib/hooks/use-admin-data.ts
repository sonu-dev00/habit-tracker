"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

type User = {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  banned: boolean;
  emailVerified: Date | null;
  banReason: string | null;
  image: string | null;
  createdAt: string;
  subscription?: { plan: string; status: string; stripeCurrentPeriodEnd: string | null } | null;
  userHabitData?: { totalCompletions: number; streak: number; xp: number } | null;
  _count?: { habits: number; completions: number };
};

async function fetchUsers(page: number, search?: string, role?: string, status?: string, plan?: string): Promise<{ data: User[]; pagination: { totalPages: number; total: number } }> {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("limit", "20");
  if (search) params.set("search", search);
  if (role) params.set("role", role);
  if (status) params.set("status", status);
  if (plan) params.set("plan", plan);
  const res = await fetch(`/api/admin/users?${params}`);
  if (!res.ok) throw new Error("Failed to fetch users");
  return res.json();
}

export function useAdminUsers(page: number, search?: string, role?: string, status?: string, plan?: string) {
  return useQuery({
    queryKey: ["admin", "users", page, search, role, status, plan],
    queryFn: () => fetchUsers(page, search, role, status, plan),
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, action, reason }: { userId: string; action: string; reason?: string }) => {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, reason }),
      });
      if (!res.ok) throw new Error("Failed to update user");
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "users"] }),
  });
}

type AuditLog = {
  id: string;
  action: string;
  entity: string;
  entityId: string | null;
  userId: string | null;
  createdAt: string;
  metadata: Record<string, unknown> | null;
  user?: { name: string | null; email: string | null } | null;
};

async function fetchAuditLogs(page: number, search?: string, action?: string): Promise<{ data: AuditLog[]; total: number; page: number; totalPages: number }> {
  const params = new URLSearchParams({ limit: "20", offset: String((page - 1) * 20) });
  if (search) params.set("search", search);
  if (action) params.set("action", action);
  const res = await fetch(`/api/admin/audit-log?${params}`);
  if (!res.ok) throw new Error("Failed to fetch audit logs");
  return res.json();
}

export function useAuditLogs(page: number, search?: string, action?: string) {
  return useQuery({
    queryKey: ["admin", "audit-log", page, search, action],
    queryFn: () => fetchAuditLogs(page, search, action),
  });
}

type RevenueData = {
  mrr: number;
  arr: number;
  byPlan: { plan: string; amount: number; count: number }[];
  paymentHistory: { id: string; amount: number; currency: string; status: string; plan: string; createdAt: string; user: { name: string | null; email: string | null } }[];
  pendingInvoices: number;
  pendingAmount: number;
  monthlyTrend: { month: string; amount: number }[];
};

async function fetchRevenue(): Promise<RevenueData> {
  const res = await fetch("/api/admin/revenue");
  if (!res.ok) throw new Error("Failed to fetch revenue");
  const json = await res.json();
  return json.data;
}

export function useRevenue() {
  return useQuery({
    queryKey: ["admin", "revenue"],
    queryFn: fetchRevenue,
    staleTime: 5 * 60 * 1000,
  });
}

type AiMonitorData = {
  totalRequests: number;
  totalTokens: number;
  activeUsers: number;
  avgResponseTime: number;
  errorRate: number;
  usageOverTime: { date: string; requests: number }[];
  recentActivity: { time: string; userId: string; type: string }[];
  endpoints: { name: string; count: number; avgTokens: number }[];
};

async function fetchAiUsage(): Promise<AiMonitorData> {
  const res = await fetch("/api/admin/ai-usage");
  if (!res.ok) throw new Error("Failed to fetch AI usage");
  const json = await res.json();
  return json.data;
}

export function useAiUsage() {
  return useQuery({
    queryKey: ["admin", "ai-usage"],
    queryFn: fetchAiUsage,
    staleTime: 60 * 1000,
  });
}

type FeatureFlag = {
  id: string;
  name: string;
  enabled: boolean;
  description: string | null;
};

async function fetchFeatureFlags(): Promise<FeatureFlag[]> {
  const res = await fetch("/api/admin/feature-flags");
  if (!res.ok) throw new Error("Failed to fetch feature flags");
  const json = await res.json();
  return json.data;
}

export function useFeatureFlags() {
  return useQuery({
    queryKey: ["admin", "feature-flags"],
    queryFn: fetchFeatureFlags,
  });
}

export function useToggleFeatureFlag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, enabled }: { id: string; enabled: boolean }) => {
      const res = await fetch(`/api/admin/feature-flags/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled }),
      });
      if (!res.ok) throw new Error("Failed to toggle flag");
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "feature-flags"] }),
  });
}

export function useCreateFeatureFlag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string; description?: string; enabled?: boolean }) => {
      const res = await fetch("/api/admin/feature-flags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create flag");
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "feature-flags"] }),
  });
}

export function useDeleteFeatureFlag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/feature-flags/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete flag");
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "feature-flags"] }),
  });
}

type SupportTicket = {
  id: string;
  subject: string;
  status: string;
  createdAt: string;
  user: { name: string | null; email: string | null };
};

async function fetchSupportTickets(status?: string, search?: string): Promise<SupportTicket[]> {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  if (search) params.set("search", search);
  const res = await fetch(`/api/admin/support-tickets?${params}`);
  if (!res.ok) throw new Error("Failed to fetch support tickets");
  const json = await res.json();
  return json.data;
}

export function useSupportTickets(status?: string, search?: string) {
  return useQuery({
    queryKey: ["admin", "support-tickets", status, search],
    queryFn: () => fetchSupportTickets(status, search),
  });
}

export function useUpdateTicketStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await fetch("/api/admin/support-tickets", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) throw new Error("Failed to update ticket");
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "support-tickets"] }),
  });
}
