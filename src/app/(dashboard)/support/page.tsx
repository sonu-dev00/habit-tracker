"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation } from "@tanstack/react-query";
import { MessageSquare, TicketCheck, Plus, ChevronDown, ChevronUp } from "lucide-react";
import { GlassCard } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";

interface Ticket {
  id: string;
  subject: string;
  message: string;
  status: string;
  createdAt: string;
}

function fetchTickets(): Promise<{ data: Ticket[] }> {
  return fetch("/api/support-tickets").then((r) => r.json());
}

const statusVariant: Record<string, "info" | "warning" | "success" | "default"> = {
  OPEN: "info",
  PENDING: "warning",
  RESOLVED: "success",
  CLOSED: "default",
};

export default function SupportPage() {
  const { toast } = useToast();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["support-tickets"],
    queryFn: fetchTickets,
  });

  const createMutation = useMutation({
    mutationFn: () =>
      fetch("/api/support-tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, message }),
      }),
    onSuccess: () => {
      toast({ title: "Ticket submitted", description: "We'll get back to you soon." });
      setSubject("");
      setMessage("");
      setShowForm(false);
    },
    onError: () => {
      toast({ title: "Failed to submit", variant: "error" });
    },
  });

  const tickets = data?.data ?? [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Support</h1>
          <p className="text-sm text-gray-400 mt-1">Submit a ticket or check existing ones</p>
        </div>
        <Button
          variant="primary"
          size="sm"
          icon={Plus}
          onClick={() => setShowForm(!showForm)}
        >
          New Ticket
        </Button>
      </div>

      {showForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
        >
          <GlassCard className="p-5 space-y-4">
            <h2 className="text-sm font-semibold text-gray-200">New Support Ticket</h2>
            <Input
              placeholder="Subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
            <textarea
              placeholder="Describe your issue..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-gray-100 placeholder:text-gray-600 outline-none resize-none focus:border-blue-500/50 transition-colors"
            />
            <div className="flex justify-end gap-2">
              <Button variant="secondary" size="sm" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => createMutation.mutate()}
                loading={createMutation.isPending}
                disabled={!subject || !message}
              >
                Submit
              </Button>
            </div>
          </GlassCard>
        </motion.div>
      )}

      <GlassCard className="overflow-hidden">
        <div className="divide-y divide-white/5">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-5 w-5 rounded-full border-2 border-blue-500/30 border-t-blue-500 animate-spin" />
            </div>
          ) : tickets.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-center">
              <TicketCheck className="h-8 w-8 text-gray-600 mb-3" />
              <p className="text-sm text-gray-500">No tickets yet</p>
              <p className="text-xs text-gray-600 mt-1">Create one to get help</p>
            </div>
          ) : (
            tickets.map((ticket) => (
              <div key={ticket.id}>
                <button
                  onClick={() => setExpandedId(expandedId === ticket.id ? null : ticket.id)}
                  className="flex w-full items-center gap-3 px-5 py-4 hover:bg-white/[0.02] transition-colors text-left"
                >
                  <MessageSquare className="h-4 w-4 text-gray-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-200 truncate">
                      {ticket.subject}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant={statusVariant[ticket.status] || "default"} size="sm">
                    {ticket.status}
                  </Badge>
                  {expandedId === ticket.id ? (
                    <ChevronUp className="h-4 w-4 text-gray-600" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-gray-600" />
                  )}
                </button>
                {expandedId === ticket.id && (
                  <div className="px-5 pb-4 pt-0">
                    <div className="rounded-xl bg-white/[0.03] p-4">
                      <p className="text-sm text-gray-400 whitespace-pre-wrap">
                        {ticket.message}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </GlassCard>
    </motion.div>
  );
}
