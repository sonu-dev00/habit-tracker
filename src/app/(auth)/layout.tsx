import Link from "next/link";
import { Sparkles } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-gray-950">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -top-40 right-1/4 h-[500px] w-[500px] rounded-full bg-blue-500/10 blur-[200px]" />
        <div className="absolute -bottom-40 left-1/4 h-[400px] w-[400px] rounded-full bg-purple-500/10 blur-[150px]" />
      </div>

      <Link
        href="/"
        className="fixed top-8 left-1/2 -translate-x-1/2 flex items-center gap-2.5 z-10"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
          <Sparkles className="h-4 w-4 text-white" />
        </div>
        <span className="text-lg font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-[#39ff14] bg-clip-text text-transparent">
          HabitForge
        </span>
      </Link>

      <div className="relative z-10 w-full max-w-md px-4">
        {children}
      </div>
    </div>
  );
}
