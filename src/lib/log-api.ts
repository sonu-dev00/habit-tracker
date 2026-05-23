import { prisma } from "@/lib/prisma";

export async function logApiRequest(
  userId: string | undefined | null,
  req: Request,
  statusCode: number
) {
  try {
    const url = new URL(req.url);
    const action = `${req.method} ${url.pathname}`;

    await prisma.auditLog.create({
      data: {
        userId: userId || null,
        action,
        entity: "API",
        entityId: url.pathname,
        ip: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || null,
        metadata: {
          method: req.method,
          pathname: url.pathname,
          search: url.search || null,
          status: statusCode,
        },
      },
    });
  } catch {
    // fail silently — logging should never break the request
  }
}
