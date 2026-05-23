"use client";

import { useState, useEffect } from "react";
import { Search, Shield, ShieldOff, Eye, CheckCircle, Ban, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { GlassCard } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminUsers, useUpdateUser } from "@/lib/hooks/use-admin-data";

export default function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [planFilter, setPlanFilter] = useState("");

  const { data, isLoading } = useAdminUsers(page, search, roleFilter, statusFilter, planFilter);
  const updateUser = useUpdateUser();

  const users = data?.data ?? [];
  const totalPages = data?.pagination?.totalPages ?? 1;
  const total = data?.pagination?.total ?? 0;

  useEffect(() => {
    setPage(1);
  }, [search, roleFilter, statusFilter, planFilter]);

  async function handleAction(userId: string, action: string) {
    updateUser.mutate({ userId, action }, {
      onSuccess: () => setDetailOpen(false),
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">User Management</h1>
        <p className="text-sm text-gray-400 mt-1">
          {total} total users
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            icon={Search}
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <div className="w-32">
            <Select
              options={[
                { value: "", label: "All Roles" },
                { value: "USER", label: "User" },
                { value: "ADMIN", label: "Admin" },
              ]}
              value={roleFilter}
              onChange={setRoleFilter}
              placeholder="Role"
            />
          </div>
          <div className="w-32">
            <Select
              options={[
                { value: "", label: "All Status" },
                { value: "active", label: "Active" },
                { value: "banned", label: "Banned" },
              ]}
              value={statusFilter}
              onChange={setStatusFilter}
              placeholder="Status"
            />
          </div>
          <div className="w-32">
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
        </div>
      </div>

      <GlassCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02]">
                <th className="text-left py-3 px-4 text-gray-500 font-medium">User</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Email</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Role</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Status</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Plan</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Habits</th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">Joined</th>
                <th className="text-right py-3 px-4 text-gray-500 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-white/5">
                      {Array.from({ length: 8 }).map((_, j) => (
                        <td key={j} className="py-3 px-4">
                          <Skeleton className="h-4 w-20" />
                        </td>
                      ))}
                    </tr>
                  ))
                : users.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="py-3 px-4">
                        <span className="text-gray-200 font-medium">
                          {user.name || "N/A"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-400">{user.email}</td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={user.role === "ADMIN" ? "brand" : "default"}
                          size="sm"
                        >
                          {user.role}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={user.banned ? "error" : "success"}
                          size="sm"
                        >
                          {user.banned ? "Banned" : "Active"}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={
                            user.subscription?.plan === "PRO"
                              ? "brand"
                              : user.subscription?.plan === "TEAMS"
                              ? "info"
                              : "default"
                          }
                          size="sm"
                        >
                          {user.subscription?.plan || "FREE"}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-gray-400">
                        {user._count?.habits ?? 0}
                      </td>
                      <td className="py-3 px-4 text-gray-400">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="xs"
                            icon={Eye}
                            onClick={() => {
                              setSelectedUser(user);
                              setDetailOpen(true);
                            }}
                          />
                          <Button
                            variant="ghost"
                            size="xs"
                            icon={user.banned ? CheckCircle : Ban}
                            onClick={() =>
                              handleAction(
                                user.id,
                                user.banned ? "unban" : "ban"
                              )
                            }
                          />
                          {user.role !== "ADMIN" && (
                            <Button
                              variant="ghost"
                              size="xs"
                              icon={Shield}
                              onClick={() => handleAction(user.id, "promote")}
                            />
                          )}
                          <Button
                            variant="ghost"
                            size="xs"
                            icon={Trash2}
                            onClick={() => {
                              if (confirm("Delete this user? This cannot be undone.")) {
                                handleAction(user.id, "delete");
                              }
                            }}
                          />
                        </div>
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
        title="User Details"
        size="lg"
      >
        {selectedUser && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.03]">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-lg font-bold text-white">
                {(selectedUser.name || "U")[0]}
              </div>
              <div>
                <p className="text-lg font-medium text-white">
                  {selectedUser.name || "Unnamed"}
                </p>
                <p className="text-sm text-gray-400">{selectedUser.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl bg-white/[0.03] p-3">
                <p className="text-xs text-gray-500">Role</p>
                <Badge
                  variant={selectedUser.role === "ADMIN" ? "brand" : "default"}
                  size="sm"
                >
                  {selectedUser.role}
                </Badge>
              </div>
              <div className="rounded-xl bg-white/[0.03] p-3">
                <p className="text-xs text-gray-500">Status</p>
                <Badge
                  variant={selectedUser.banned ? "error" : "success"}
                  size="sm"
                >
                  {selectedUser.banned ? "Banned" : "Active"}
                </Badge>
              </div>
              <div className="rounded-xl bg-white/[0.03] p-3">
                <p className="text-xs text-gray-500">Plan</p>
                <Badge variant="brand" size="sm">
                  {selectedUser.subscription?.plan || "FREE"}
                </Badge>
              </div>
              <div className="rounded-xl bg-white/[0.03] p-3">
                <p className="text-xs text-gray-500">Joined</p>
                <p className="text-sm text-gray-200 mt-0.5">
                  {new Date(selectedUser.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-xl bg-white/[0.03] p-3 text-center">
                <p className="text-2xl font-bold text-white">
                  {selectedUser.userHabitData?.totalCompletions || 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">Completions</p>
              </div>
              <div className="rounded-xl bg-white/[0.03] p-3 text-center">
                <p className="text-2xl font-bold text-white">
                  {selectedUser.userHabitData?.streak || 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">Streak</p>
              </div>
              <div className="rounded-xl bg-white/[0.03] p-3 text-center">
                <p className="text-2xl font-bold text-white">
                  {selectedUser.userHabitData?.xp || 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">XP</p>
              </div>
            </div>

            {selectedUser.banReason && (
              <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-3">
                <p className="text-xs text-red-400 font-medium">Ban Reason</p>
                <p className="text-sm text-red-300 mt-1">
                  {selectedUser.banReason}
                </p>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Button
                variant={selectedUser.banned ? "success" : "danger"}
                size="sm"
                onClick={() =>
                  handleAction(
                    selectedUser.id,
                    selectedUser.banned ? "unban" : "ban"
                  )
                }
              >
                {selectedUser.banned ? "Unban User" : "Ban User"}
              </Button>
              {selectedUser.role === "ADMIN" ? (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleAction(selectedUser.id, "demote")}
                >
                  Remove Admin
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleAction(selectedUser.id, "promote")}
                >
                  Make Admin
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (confirm("Delete this user?")) {
                    handleAction(selectedUser.id, "delete");
                  }
                }}
              >
                Delete User
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
