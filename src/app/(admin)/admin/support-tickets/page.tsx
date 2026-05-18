"use client";

import { useState } from "react";
import { TicketCheck, Search, Filter } from "lucide-react";
import { GlassCard } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";

const MOCK_TICKETS = [
  { id: "1", user: "Sarah Johnson", subject: "Cannot access premium features", status: "OPEN", priority: "high", createdAt: "2026-05-17" },
  { id: "2", user: "Mike Chen", subject: "Billing issue with upgrade", status: "PENDING", priority: "medium", createdAt: "2026-05-16" },
  { id: "3", user: "Emily Davis", subject: "Habit sync not working", status: "RESOLVED", priority: "low", createdAt: "2026-05-15" },
  { id: "4", user: "Alex Rivera", subject: "Account deletion request", status: "OPEN", priority: "high", createdAt: "2026-05-14" },
  { id: "5", user: "Jordan Taylor", subject: "Feature request: team challenges", status: "CLOSED", priority: "low", createdAt: "2026-05-13" },
];

const statusColors: Record<string, "info" | "warning" | "success" | "default"> = {
  OPEN: "info",
  PENDING: "warning",
  RESOLVED: "success",
  CLOSED: "default",
};

export default function SupportTicketsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const filtered = MOCK_TICKETS.filter((t) => {
    const matchesSearch = t.subject.toLowerCase().includes(search.toLowerCase()) ||
      t.user.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !statusFilter || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Support Tickets</h1>
        <p className="text-sm text-gray-400 mt-1">
          Manage incoming support requests
        </p>
      </div>

      <div className="flex gap-3">
        <div className="flex-1">
          <Input
            icon={Search}
            placeholder="Search tickets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
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
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Subject</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Status</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Priority</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((ticket) => (
                <tr key={ticket.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-4 text-gray-200 font-medium">{ticket.user}</td>
                  <td className="py-3 px-4 text-gray-400">{ticket.subject}</td>
                  <td className="py-3 px-4">
                    <Badge variant={statusColors[ticket.status]} size="sm">{ticket.status}</Badge>
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={ticket.priority === "high" ? "error" : ticket.priority === "medium" ? "warning" : "default"} size="sm">
                      {ticket.priority}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-gray-400">{ticket.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12">
            <TicketCheck className="h-8 w-8 text-gray-600 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No tickets found</p>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
