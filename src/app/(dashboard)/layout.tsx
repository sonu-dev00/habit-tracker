"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { useSession } from "next-auth/react";
import { useXP } from "@/lib/hooks/use-xp";
import { useRPGProfile } from "@/lib/hooks/use-rpg";

export default function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();
  const { data: xpData } = useXP();
  const { data: rpgData } = useRPGProfile();
  const user = session?.user;
  const profile = rpgData?.profile;

  return (
    <DashboardLayout
      user={{
        name: user?.name ?? "",
        email: user?.email ?? "",
        image: user?.image,
      }}
      level={xpData?.level ?? 1}
      xp={xpData?.xp ?? 0}
      rpgProfile={profile}
    >
      <ErrorBoundary>{children}</ErrorBoundary>
    </DashboardLayout>
  );
}
