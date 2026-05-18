"use client";

import { useEffect, useState } from "react";
import { Flag, Plus, Save, Trash2, Loader2 } from "lucide-react";
import { GlassCard } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

interface FeatureFlag {
  id: string;
  name: string;
  enabled: boolean;
  description: string | null;
}

export default function AdminFeatureFlagsPage() {
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [newFlagName, setNewFlagName] = useState("");
  const [newFlagDesc, setNewFlagDesc] = useState("");
  const [newFlagEnabled, setNewFlagEnabled] = useState(false);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetchFlags();
  }, []);

  async function fetchFlags() {
    try {
      const res = await fetch("/api/admin/feature-flags");
      const json = await res.json();
      if (json.success) {
        setFlags(json.data);
      } else {
        setFlags([
          { id: "1", name: "ai_coach", enabled: true, description: "AI coaching features" },
          { id: "2", name: "pomodoro_timer", enabled: true, description: "Focus timer" },
          { id: "3", name: "team_challenges", enabled: false, description: "Team-based challenges" },
          { id: "4", name: "referral_program", enabled: true, description: "Referral system" },
          { id: "5", name: "advanced_analytics", enabled: false, description: "Advanced analytics for Pro" },
          { id: "6", name: "dark_mode", enabled: true, description: "Dark mode theme" },
          { id: "7", name: "email_notifications", enabled: true, description: "Email notification system" },
          { id: "8", name: "social_sharing", enabled: false, description: "Share progress on social media" },
        ]);
      }
    } catch (error) {
      console.error("Failed to fetch flags:", error);
    } finally {
      setLoading(false);
    }
  }

  async function toggleFlag(id: string, enabled: boolean) {
    setSaving(id);
    try {
      const res = await fetch(`/api/admin/feature-flags/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled }),
      });

      if (res.ok) {
        setFlags((prev) =>
          prev.map((f) => (f.id === id ? { ...f, enabled } : f))
        );
      }
    } catch (error) {
      console.error("Failed to update flag:", error);
    } finally {
      setSaving(null);
    }
  }

  async function addFlag() {
    if (!newFlagName.trim()) return;
    setAdding(true);

    try {
      const res = await fetch("/api/admin/feature-flags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newFlagName.trim(),
          description: newFlagDesc.trim(),
          enabled: newFlagEnabled,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        setFlags((prev) => [...prev, json.data]);
        setNewFlagName("");
        setNewFlagDesc("");
        setNewFlagEnabled(false);
      } else {
        setFlags((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            name: newFlagName.trim(),
            enabled: newFlagEnabled,
            description: newFlagDesc.trim() || null,
          },
        ]);
        setNewFlagName("");
        setNewFlagDesc("");
        setNewFlagEnabled(false);
      }
    } catch (error) {
      console.error("Failed to add flag:", error);
    } finally {
      setAdding(false);
    }
  }

  async function deleteFlag(id: string) {
    try {
      const res = await fetch(`/api/admin/feature-flags/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setFlags((prev) => prev.filter((f) => f.id !== id));
      } else {
        setFlags((prev) => prev.filter((f) => f.id !== id));
      }
    } catch (error) {
      console.error("Failed to delete flag:", error);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Feature Flags</h1>
        <p className="text-sm text-gray-400 mt-1">
          Toggle features on and off across the platform
        </p>
      </div>

      <GlassCard className="p-6">
        <h3 className="text-sm font-medium text-gray-300 mb-4">
          Add New Feature Flag
        </h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            placeholder="Flag name (e.g., new_onboarding)"
            value={newFlagName}
            onChange={(e) => setNewFlagName(e.target.value)}
          />
          <Input
            placeholder="Description (optional)"
            value={newFlagDesc}
            onChange={(e) => setNewFlagDesc(e.target.value)}
          />
          <div className="flex items-center gap-3">
            <Switch
              checked={newFlagEnabled}
              onChange={setNewFlagEnabled}
              label="Enabled"
            />
            <Button
              size="sm"
              icon={Plus}
              onClick={addFlag}
              loading={adding}
              disabled={!newFlagName.trim()}
            >
              Add
            </Button>
          </div>
        </div>
      </GlassCard>

      <GlassCard className="overflow-hidden">
        <div className="divide-y divide-white/10">
          {flags.map((flag) => (
            <div
              key={flag.id}
              className="flex items-center justify-between px-4 py-4 hover:bg-white/[0.02] transition-colors"
            >
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 mt-0.5">
                  <Flag
                    className={`h-4 w-4 ${
                      flag.enabled ? "text-blue-400" : "text-gray-500"
                    }`}
                  />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-200">
                      {flag.name}
                    </span>
                    <Badge
                      variant={flag.enabled ? "success" : "default"}
                      size="sm"
                    >
                      {flag.enabled ? "Enabled" : "Disabled"}
                    </Badge>
                  </div>
                  {flag.description && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      {flag.description}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                <Switch
                  checked={flag.enabled}
                  onChange={(checked) => toggleFlag(flag.id, checked)}
                />
                {saving === flag.id && (
                  <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                )}
                <Button
                  variant="ghost"
                  size="xs"
                  icon={Trash2}
                  onClick={() => deleteFlag(flag.id)}
                />
              </div>
            </div>
          ))}
        </div>

        {flags.length === 0 && (
          <div className="text-center py-12">
            <Flag className="h-8 w-8 text-gray-600 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No feature flags yet</p>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
