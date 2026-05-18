"use client";

import { useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Bell,
  Volume2,
  Focus,
  Key,
  Download,
  LogOut,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { GlassCard } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useUserStore, useSettingsStore } from "@/store";
import { cn } from "@/lib/utils";

const stagger = {
  container: { animate: { transition: { staggerChildren: 0.06 } } },
  item: {
    initial: { opacity: 0, y: 12 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.35, ease: "easeOut" as const },
    },
  },
};

function SettingRow({
  icon: Icon,
  label,
  description,
  children,
}: {
  icon: any;
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="flex items-start gap-3 min-w-0">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/5 border border-white/10">
          <Icon className="h-4 w-4 text-gray-400" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-200">{label}</p>
          {description && (
            <p className="text-xs text-gray-500 mt-0.5">{description}</p>
          )}
        </div>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function SectionCard({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <GlassCard className={cn("p-5", className)}>
      <h2 className="text-base font-semibold text-gray-100">{title}</h2>
      {description && (
        <p className="text-sm text-gray-400 mt-0.5 mb-4">{description}</p>
      )}
      <div className="divide-y divide-white/5">{children}</div>
    </GlassCard>
  );
}

export default function SettingsPage() {
  const { name, email, image, setUser } = useUserStore();
  const {
    soundEnabled,
    notificationsEnabled,
    focusMode,
    setSoundEnabled,
    setNotificationsEnabled,
    setFocusMode,
  } = useSettingsStore();

  const [apiKey, setApiKey] = useState("");
  const [apiKeySaved, setApiKeySaved] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const hasApiKey = useMemo(
    () => !!(typeof window !== "undefined" && localStorage.getItem("openai_api_key")),
    []
  );

  const handleSaveApiKey = useCallback(() => {
    if (!apiKey.trim()) return;
    localStorage.setItem("openai_api_key", apiKey.trim());
    setApiKeySaved(true);
    setTimeout(() => setApiKeySaved(false), 2000);
  }, [apiKey]);

  const handleExportData = useCallback(() => {
    const data = {
      exportedAt: new Date().toISOString(),
      user: { name, email },
      settings: { soundEnabled, notificationsEnabled, focusMode },
      habits: [],
      completions: [],
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `habitforge-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [name, email, soundEnabled, notificationsEnabled, focusMode]);

  const handleSignOut = useCallback(async () => {
    setSigningOut(true);
    await signOut({ callbackUrl: "/" });
    setUser({ id: "", name: null, email: null, image: null, role: null });
    window.location.href = "/";
  }, [setUser]);

  return (
    <motion.div
      variants={stagger.container}
      initial="initial"
      animate="animate"
      className="max-w-2xl space-y-6"
    >
      <motion.div variants={stagger.item}>
        <h1 className="text-2xl font-bold text-gray-100">Settings</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          Manage your account and preferences
        </p>
      </motion.div>

      <motion.div variants={stagger.item}>
        <SectionCard title="Profile" description="Your account information">
          <SettingRow icon={User} label="Name">
            <span className="text-sm text-gray-300">{name ?? "Not set"}</span>
          </SettingRow>
          <SettingRow icon={Mail} label="Email">
            <span className="text-sm text-gray-300">
              {email ?? "Not set"}
            </span>
          </SettingRow>
        </SectionCard>
      </motion.div>

      <motion.div variants={stagger.item}>
        <SectionCard
          title="Preferences"
          description="Customize your experience"
        >
          <SettingRow
            icon={Bell}
            label="Notifications"
            description="Receive reminders and updates"
          >
            <Switch
              checked={notificationsEnabled}
              onChange={setNotificationsEnabled}
            />
          </SettingRow>
          <SettingRow
            icon={Volume2}
            label="Sound Effects"
            description="Play sounds for actions and alerts"
          >
            <Switch
              checked={soundEnabled}
              onChange={setSoundEnabled}
            />
          </SettingRow>
          <SettingRow
            icon={Focus}
            label="Focus Mode"
            description="Minimize distractions in the app"
          >
            <Switch checked={focusMode} onChange={setFocusMode} />
          </SettingRow>
        </SectionCard>
      </motion.div>

      <motion.div variants={stagger.item}>
        <SectionCard
          title="OpenAI API Key"
          description="Required for AI Coach features"
        >
          <div className="pt-3">
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Input
                  type={showApiKey ? "text" : "password"}
                  placeholder={hasApiKey ? "••••••••" : "sk-..."}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  icon={Key}
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showApiKey ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              <Button
                variant="primary"
                size="md"
                onClick={handleSaveApiKey}
                disabled={!apiKey.trim()}
              >
                Save
              </Button>
            </div>
            <div className="flex items-center gap-2 mt-2">
              {hasApiKey && (
                <span className="inline-flex items-center gap-1 text-xs text-emerald-400">
                  <CheckCircle2 className="h-3 w-3" />
                  Key configured
                </span>
              )}
              {apiKeySaved && (
                <span className="inline-flex items-center gap-1 text-xs text-emerald-400">
                  <CheckCircle2 className="h-3 w-3" />
                  Saved successfully
                </span>
              )}
              {!hasApiKey && !apiKeySaved && (
                <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                  <XCircle className="h-3 w-3" />
                  No key configured
                </span>
              )}
            </div>
          </div>
        </SectionCard>
      </motion.div>

      <motion.div variants={stagger.item}>
        <SectionCard title="Data" description="Export or manage your data">
          <div className="pt-3">
            <Button
              variant="secondary"
              size="md"
              icon={Download}
              onClick={handleExportData}
            >
              Export Data (JSON)
            </Button>
          </div>
        </SectionCard>
      </motion.div>

      <motion.div variants={stagger.item}>
        <SectionCard
          title="Danger Zone"
          description="Irreversible actions"
          className="border-red-500/20"
        >
          <div className="pt-3">
            <Button
              variant="danger"
              size="md"
              icon={LogOut}
              loading={signingOut}
              onClick={handleSignOut}
            >
              Sign Out
            </Button>
          </div>
        </SectionCard>
      </motion.div>
    </motion.div>
  );
}
