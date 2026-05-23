export function validateOrigin(request: Request): boolean {
  const method = request.method.toUpperCase();
  if (["GET", "HEAD", "OPTIONS"].includes(method)) return true;

  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const allowedOrigins = [appUrl, "https://habitforge.com", "https://www.habitforge.com"];

  if (origin && allowedOrigins.some((o) => origin.startsWith(o))) return true;
  if (referer && allowedOrigins.some((r) => referer.startsWith(r))) return true;

  return false;
}
