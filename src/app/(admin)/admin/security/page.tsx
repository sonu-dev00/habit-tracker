"use client";

import { useState, useCallback } from "react";
import { Shield, ShieldOff, Key, Copy, CheckCircle2 } from "lucide-react";
import { GlassCard } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AdminSecurityPage() {
  const [step, setStep] = useState<"idle" | "setup" | "verify" | "done">("idle");
  const [qrCode, setQrCode] = useState("");
  const [secret, setSecret] = useState("");
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSetup = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/2fa/setup", { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setQrCode(json.qrCode);
      setSecret(json.secret);
      setStep("verify");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Setup failed");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleVerify = useCallback(async () => {
    if (!token.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/2fa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: token.trim() }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setStep("done");
      setEnabled(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setLoading(false);
    }
  }, [token]);

  const handleDisable = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/2fa/disable", { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setEnabled(false);
      setStep("idle");
      setQrCode("");
      setSecret("");
      setToken("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to disable");
    } finally {
      setLoading(false);
    }
  }, []);

  const copySecret = useCallback(() => {
    navigator.clipboard.writeText(secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [secret]);

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Security Settings</h1>
        <p className="text-sm text-gray-400 mt-1">
          Manage two-factor authentication for your admin account
        </p>
      </div>

      <GlassCard className="p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/10">
            {enabled ? (
              <Shield className="h-5 w-5 text-emerald-400" />
            ) : (
              <ShieldOff className="h-5 w-5 text-gray-400" />
            )}
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-100">
              Two-Factor Authentication
            </h2>
            <p className="text-xs text-gray-500">
              {enabled
                ? "2FA is active on your account"
                : "Add an extra layer of security"}
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {step === "idle" && !enabled && (
          <Button variant="primary" size="md" icon={Shield} loading={loading} onClick={handleSetup}>
            Enable 2FA
          </Button>
        )}

        {step === "verify" && (
          <div className="space-y-4">
            <div className="flex justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrCode} alt="QR Code" className="h-48 w-48 rounded-xl border border-white/10" />
            </div>

            <div className="flex items-center gap-2 rounded-xl bg-white/[0.03] p-3">
              <code className="flex-1 text-sm text-gray-300 font-mono break-all">{secret}</code>
              <Button variant="ghost" size="xs" icon={copied ? CheckCircle2 : Copy} onClick={copySecret} />
            </div>
            <p className="text-xs text-gray-500">
              Scan the QR code with Google Authenticator or a compatible app, then enter the 6-digit code below.
            </p>

            <div className="flex gap-2">
              <Input
                placeholder="000000"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="font-mono text-center text-lg tracking-widest"
                maxLength={6}
              />
              <Button variant="primary" size="md" loading={loading} onClick={handleVerify}>
                Verify
              </Button>
            </div>
          </div>
        )}

        {enabled && (
          <div className="space-y-3">
            <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3">
              <p className="text-sm text-emerald-400">
                Two-factor authentication is enabled.
              </p>
            </div>
            <Button variant="danger" size="md" icon={ShieldOff} loading={loading} onClick={handleDisable}>
              Disable 2FA
            </Button>
          </div>
        )}

        {step === "done" && (
          <p className="text-sm text-emerald-400 mt-2">
            2FA has been successfully enabled.
          </p>
        )}
      </GlassCard>
    </div>
  );
}
