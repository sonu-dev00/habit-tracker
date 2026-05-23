"use client";

import { useState } from "react";
import { TicketCheck, Search } from "lucide-react";
import { GlassCard } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useSupportTickets, useUpdateTicketStatus } from "@/lib/hooks/use-admin-data";

const statusColors: Record<string, "info" | "warning" | "success" | "default"> = {
  OPEN: "info",
  PENDING: "warning",
  RESOLVED: "success",
  CLOSED: "default",
};

export default function SupportTicketsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const { data: tickets, isLoading } = useSupportTickets(statusFilter || undefined, search || undefined);
  const updateStatus = useUpdateTicketStatus();

  const handleStatusChange = (id: string, status: string) => {
    updateStatus.mutate({ id, status });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Support Tickets</h1>
        <p className="text-sm text-gray-400 mt-1">{tickets?.length ?? 0} total tickets</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input icon={Search} placeholder="Search tickets..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="w-40">
          <Select
            options={[
              { value: "", label: "All Status" },
              { value: "OPEN", label: "Open" },
              { value: "PENDING", label: "Pending" },
              { value: "RESOLVED", label: "Resolved" },
              { value: "CLOSED", label: "Closed" },
            ]}
            value={statusFilter}
            onChange={(v) => setStatusFilter(v)}
          />
        </div>
      </div>

      <div className="space-y-2">
        {(tickets ?? []).length === 0 ? (
          <GlassCard className="p-8 text-center">
            <TicketCheck className="h-8 w-8 text-gray-500 mx-auto mb-3" />
            <p className="text-gray-400">No support tickets found</p>
          </GlassCard>
        ) : (
          (tickets ?? []).map((ticket) => (
            <GlassCard key={ticket.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-gray-200">{ticket.subject}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {ticket.user?.name ?? "Unknown"} — {new Date(ticket.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant={statusColors[ticket.status] ?? "default"} size="sm">
                    {ticket.status}
                  </Badge>
                  <Select
                    options={[
                      { value: "OPEN", label: "Open" },
                      { value: "PENDING", label: "Pending" },
                      { value: "RESOLVED", label: "Resolved" },
                      { value: "CLOSED", label: "Closed" },
                    ]}
                    value={ticket.status}
                    onChange={(v) => handleStatusChange(ticket.id, v)}
                  />
                </div>
              </div>
            </GlassCard>
          ))
        )}
      </div>
    </div>
  );
}
