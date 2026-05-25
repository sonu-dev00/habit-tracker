import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { unauthorized, forbidden, handleApiError } from "@/lib/api-error";
import { logApiRequest } from "@/lib/log-api";

type SessionUser = { id: string; name?: string | null; email?: string | null; image?: string | null; role?: string };
type ApiHandler = (params: { userId: string; user: SessionUser }) => Promise<NextResponse>;

interface GuardOptions {
  requireAuth?: boolean;
  requireAdmin?: boolean;
  requirePro?: boolean;
  requireEmailVerified?: boolean;
}

export function apiGuard(handler: ApiHandler, options: GuardOptions = {}) {
  const { requireAuth = true, requireAdmin = false, requirePro = false, requireEmailVerified = false } = options;

  return async (req: Request, context?: unknown): Promise<NextResponse> => {
    try {
      const session = await auth();

      if (requireAuth) {
        if (!session?.user?.id) {
          return unauthorized();
        }

        const user = await prisma.user.findUnique({
          where: { id: session.user.id },
          select: { banned: true, role: true },
        });

        if (!user) {
          return unauthorized("User not found");
        }

        if (user.banned) {
          return forbidden("Your account has been suspended");
        }

        if (requireAdmin && user.role !== "ADMIN") {
          return forbidden("Admin access required");
        }
      }

      if (requireEmailVerified && session?.user?.email) {
        const user = await prisma.user.findUnique({
          where: { id: session.user.id },
          select: { emailVerified: true },
        });
        if (!user?.emailVerified) {
          return forbidden("Email verification required");
        }
      }

      if (requirePro && session?.user?.id) {
        const sub = await prisma.subscription.findUnique({
          where: { userId: session.user.id },
        });
        const isPro = sub && (sub.plan === "PRO" || sub.plan === "TEAMS") && sub.status === "active";
        if (!isPro) {
          return forbidden("This feature requires a Pro subscription");
        }
      }

      const safeUser = session?.user;
      const response = await handler({ userId: safeUser?.id as string, user: safeUser as SessionUser });

      if (req.method !== "GET") {
        logApiRequest(session?.user?.id, req, response.status);
      }

      return response;
    } catch (error) {
      return handleApiError(error);
    }
  };
}

export async function checkBan(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { banned: true },
  });
  return user?.banned === true;
}

export async function checkPro(userId: string): Promise<boolean> {
  const sub = await prisma.subscription.findUnique({
    where: { userId },
  });
  return !!sub && (sub.plan === "PRO" || sub.plan === "TEAMS") && sub.status === "active";
}

export { forbidden, unauthorized, handleApiError } from "@/lib/api-error";
