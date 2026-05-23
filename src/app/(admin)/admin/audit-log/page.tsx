"use client";

import { useEffect, useState, useCallback } from "react";
import { Search, ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { GlassCard } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

interface AuditLogEntry {
  id: string;
  userId: string | null;
  action: string;
  entity: string;
  entityId: string | null;
  metadata: Record<string, unknown> | null;
  ip: string | null;
  createdAt: string;
  user: { name: string | null; email: string | null; image: string | null } | null;
}

const ACTION_VARIANTS: Record<string, "brand" | "info" | "success" | "warning" | "error" | "default"> = {
  BAN_USER: "error",
  UNBAN_USER: "success",
  PROMOTE_USER: "brand",
  DEMOTE_USER: "warning",
  DELETE_USER: "error",
  LINK_ACCOUNT: "info",
  STRIPE_WEBHOOK: "brand",
  RESET_MONTHLY: "default",
};

function getActionVariant(action: string) {
  return ACTION_VARIANTS[action] || "default";
}

function formatMetadata(metadata: Record<string, unknown> | null): string {
  if (!metadata) return "—";
  try {
    return JSON.stringify(metadata, null, 2);
  } catch {
    return "—";
  }
}

export default function AdminAuditLogPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [actionFilter, setActionFilter] = useState("");
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      params.set("page", String(page));
      params.set("limit", "30");
      if (actionFilter) params.set("action", actionFilter);

      const res = await fetch(`/api/admin/audit-log?${params}`);
      const json = await res.json();

      if (json.success) {
        setLogs(json.data);
        setTotalPages(json.pagination.totalPages);
        setTotal(json.pagination.total);
      }
    } catch (error) {
      console.error("Failed to fetch audit logs:", error);
    } finally {
      setLoading(false);
    }
  }, [search, page, actionFilter]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  useEffect(() => {
    setPage(1);
  }, [search, actionFilter]);

  const uniqueActions = [...new Set(logs.map((l) => l.action))].sort();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Audit Log</h1>
        <p className="text-sm text-gray-400 mt-1">
          {total} total events
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            icon={Search}
            placeholder="Search actions, entities, or IDs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <div className="w-40">
            <Select
              options={[
                { value: "", label: "All Actions" },
                ...uniqueActions.map((a) => ({ value: a, label: a.replace(/_/g, " ") })),
              ]}
              value={actionFilter}
              onChange={setActionFilter}
              placeholder="Action"
            />
          </div>
        </div>
      </div>

      <GlassCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02]">
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Time</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">User</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Action</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Entity</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Entity ID</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">IP</th>
                <th className="text-right py-3 px-4 text-gray-500 font-medium">Details</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-white/5">
                      {Array.from({ length: 7 }).map((_, j) => (
                        <td key={j} className="py-3 px-4">
                          <Skeleton className="h-4 w-20" />
                        </td>
                      ))}
                    </tr>
                  ))
                : logs.map((log) => (
                    <tr
                      key={log.id}
                      className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="py-3 px-4 text-gray-400 whitespace-nowrap font-mono text-xs">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-gray-200">
                          {log.user?.name || log.user?.email || "System"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={getActionVariant(log.action)} size="sm">
                          {log.action.replace(/_/g, " ")}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-gray-400">{log.entity}</td>
                      <td className="py-3 px-4">
                        <code className="text-xs text-gray-500 font-mono">
                          {log.entityId ? log.entityId.slice(0, 12) + "..." : "—"}
                        </code>
                      </td>
                      <td className="py-3 px-4 text-gray-500 font-mono text-xs">
                        {log.ip || "—"}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button
                          variant="ghost"
                          size="xs"
                          icon={Eye}
                          onClick={() => {
                            setSelectedLog(log);
                            setDetailOpen(true);
                          }}
                        />
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-white/10">
            <p className="text-sm text-gray-500">
              Page {page} of {totalPages} ({total} total)
            </p>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                icon={ChevronLeft}
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                size="sm"
                icon={ChevronRight}
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </GlassCard>

      <Modal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        title="Audit Log Details"
        size="lg"
      >
        {selectedLog && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl bg-white/[0.03] p-3">
                <p className="text-xs text-gray-500">Action</p>
                <Badge variant={getActionVariant(selectedLog.action)} size="sm" className="mt-1">
                  {selectedLog.action.replace(/_/g, " ")}
                </Badge>
              </div>
              <div className="rounded-xl bg-white/[0.03] p-3">
                <p className="text-xs text-gray-500">Timestamp</p>
                <p className="text-sm text-gray-200 mt-0.5">
                  {new Date(selectedLog.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="rounded-xl bg-white/[0.03] p-3">
                <p className="text-xs text-gray-500">User</p>
                <p className="text-sm text-gray-200 mt-0.5">
                  {selectedLog.user?.name || selectedLog.user?.email || "System"}
                </p>
                {selectedLog.user?.email && (
                  <p className="text-xs text-gray-500">{selectedLog.user.email}</p>
                )}
              </div>
              <div className="rounded-xl bg-white/[0.03] p-3">
                <p className="text-xs text-gray-500">IP Address</p>
                <p className="text-sm text-gray-200 mt-0.5 font-mono">
                  {selectedLog.ip || "Not recorded"}
                </p>
              </div>
              <div className="rounded-xl bg-white/[0.03] p-3">
                <p className="text-xs text-gray-500">Entity</p>
                <p className="text-sm text-gray-200 mt-0.5">{selectedLog.entity}</p>
              </div>
              <div className="rounded-xl bg-white/[0.03] p-3">
                <p className="text-xs text-gray-500">Entity ID</p>
                <p className="text-sm text-gray-200 mt-0.5 font-mono">
                  {selectedLog.entityId || "N/A"}
                </p>
              </div>
            </div>

            {selectedLog.metadata && (
              <div className="rounded-xl bg-white/[0.03] p-3">
                <p className="text-xs text-gray-500 mb-2">Metadata</p>
                <pre className="text-xs text-gray-300 font-mono whitespace-pre-wrap">
                  {formatMetadata(selectedLog.metadata)}
                </pre>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
