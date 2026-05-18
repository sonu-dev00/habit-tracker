"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema } from "@/lib/validation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { z } from "zod";

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  async function onSubmit(data: ForgotPasswordForm) {
    setError(null);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error || "Something went wrong. Please try again.");
        return;
      }

      setSent(true);
    } catch {
      setError("Network error. Please try again.");
    }
  }

  if (sent) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 shadow-xl text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10">
            <CheckCircle2 className="h-6 w-6 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-100">Check your email</h1>
          <p className="mt-2 text-sm text-gray-400">
            If an account exists with that email, we&apos;ve sent a password
            reset link. It will expire in 1 hour.
          </p>
          <Link
            href="/login"
            className="mt-6 inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to sign in
          </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 shadow-xl">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-100">Forgot password?</h1>
          <p className="mt-2 text-sm text-gray-400">
            Enter your email and we&apos;ll send you a reset link
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            icon={Mail}
            error={errors.email?.message}
            {...register("email")}
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            loading={isSubmitting}
          >
            Send Reset Link
          </Button>
        </form>

        <p className="mt-6 text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to sign in
          </Link>
        </p>
      </div>
    </motion.div>
  );
}
