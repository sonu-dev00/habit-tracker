"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useUserStore, useXPStore } from "@/store";

export default function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const name = useUserStore((s) => s.name);
  const email = useUserStore((s) => s.email);
  const image = useUserStore((s) => s.image);
  const level = useXPStore((s) => s.level);
  const xp = useXPStore((s) => s.xp);

  return (
    <DashboardLayout
      user={{ name: name ?? "", email: email ?? "", image }}
      level={level}
      xp={xp}
    >
      {children}
    </DashboardLayout>
  );
}
