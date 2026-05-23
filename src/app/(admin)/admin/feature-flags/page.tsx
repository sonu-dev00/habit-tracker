"use client";

import { useState } from "react";
import { Flag, Plus, Trash2 } from "lucide-react";
import { GlassCard } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useFeatureFlags, useToggleFeatureFlag, useCreateFeatureFlag, useDeleteFeatureFlag } from "@/lib/hooks/use-admin-data";

export default function AdminFeatureFlagsPage() {
  const { data: flags, isLoading } = useFeatureFlags();
  const toggleFlag = useToggleFeatureFlag();
  const createFlag = useCreateFeatureFlag();
  const deleteFlag = useDeleteFeatureFlag();
  const [newFlagName, setNewFlagName] = useState("");
  const [newFlagDesc, setNewFlagDesc] = useState("");
  const [adding, setAdding] = useState(false);

  const handleToggle = (id: string, enabled: boolean) => {
    toggleFlag.mutate({ id, enabled });
  };

  const handleCreate = () => {
    if (!newFlagName.trim()) return;
    createFlag.mutate({ name: newFlagName.trim(), description: newFlagDesc.trim() || undefined });
    setNewFlagName("");
    setNewFlagDesc("");
    setAdding(false);
  };

  const handleDelete = (id: string) => {
    deleteFlag.mutate(id);
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Feature Flags</h1>
          <p className="text-sm text-gray-400 mt-1">Toggle features on/off without deployment</p>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => setAdding(!adding)}>
          Add Flag
        </Button>
      </div>

      {adding && (
        <GlassCard className="p-4">
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <Input label="Flag Name" placeholder="e.g. new_onboarding" value={newFlagName} onChange={(e) => setNewFlagName(e.target.value)} />
            </div>
            <div className="flex-1">
              <Input label="Description" placeholder="Describe the feature" value={newFlagDesc} onChange={(e) => setNewFlagDesc(e.target.value)} />
            </div>
            <Button variant="primary" onClick={handleCreate} disabled={!newFlagName.trim() || createFlag.isPending}>
              Save
            </Button>
          </div>
        </GlassCard>
      )}

      <GlassCard className="p-5">
        <div className="space-y-3">
          {(flags ?? []).map((flag) => (
            <div key={flag.id} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-4 py-3">
              <div className="flex items-center gap-3">
                <Flag className={`h-4 w-4 ${flag.enabled ? "text-emerald-400" : "text-gray-500"}`} />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-200">{flag.name}</span>
                    <Badge variant={flag.enabled ? "success" : "default"} size="sm">
                      {flag.enabled ? "ON" : "OFF"}
                    </Badge>
                  </div>
                  {flag.description && (
                    <p className="text-xs text-gray-500 mt-0.5">{flag.description}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  checked={flag.enabled}
                  onChange={(checked) => handleToggle(flag.id, checked)}
                  disabled={toggleFlag.isPending}
                />
                <button onClick={() => handleDelete(flag.id)} className="rounded-lg p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
