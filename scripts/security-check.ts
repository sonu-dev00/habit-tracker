import https from "https";

async function checkHeaders() {
  const baseUrl = process.env.CHECK_URL || "http://localhost:3000";
  console.log(`\n🔒 Security Headers Check for ${baseUrl}\n`);

  const isHttps = baseUrl.startsWith("https");
  const fetcher = isHttps
    ? (url: string) =>
        new Promise<{ status: number; headers: Record<string, string> }>(
          (resolve, reject) => {
            https.get(url, (res) => {
              const headers: Record<string, string> = {};
              for (const [k, v] of Object.entries(res.headers)) {
                if (v) headers[k.toLowerCase()] = Array.isArray(v) ? v[0] : v;
              }
              resolve({ status: res.statusCode || 0, headers });
            }).on("error", reject);
          }
        )
    : async (url: string) => {
        const mod = await import("http");
        return new Promise<{ status: number; headers: Record<string, string> }>(
          (resolve, reject) => {
            mod.default.get(url, (res) => {
              const headers: Record<string, string> = {};
              for (const [k, v] of Object.entries(res.headers)) {
                if (v) headers[k.toLowerCase()] = Array.isArray(v) ? v[0] : v;
              }
              resolve({ status: res.statusCode || 0, headers });
            }).on("error", reject);
          }
        );
      };

  const requiredHeaders: { name: string; key: string; rating: "A" | "B" | "C" | "F" }[] = [
    { name: "HTTP Strict Transport Security (HSTS)", key: "strict-transport-security", rating: "A" },
    { name: "X-Frame-Options (Clickjacking Protection)", key: "x-frame-options", rating: "A" },
    { name: "X-Content-Type-Options (MIME Sniffing Prevention)", key: "x-content-type-options", rating: "A" },
    { name: "Content Security Policy (CSP)", key: "content-security-policy", rating: "A" },
    { name: "Referrer-Policy", key: "referrer-policy", rating: "A" },
    { name: "Permissions-Policy", key: "permissions-policy", rating: "A" },
    { name: "X-XSS-Protection", key: "x-xss-protection", rating: "A" },
  ];

  try {
    const { headers, status } = await fetcher(baseUrl);
    console.log(`Status: ${status}\n`);

    let passed = 0;
    let failed = 0;
    let score = 0;

    for (const header of requiredHeaders) {
      const value = headers[header.key];
      if (value) {
        console.log(`  ✅ ${header.name}`);
        console.log(`     Value: ${value}`);
        passed++;
        score += header.rating === "A" ? 14 : header.rating === "B" ? 10 : header.rating === "C" ? 5 : 0;
      } else {
        console.log(`  ❌ ${header.name} — MISSING`);
        failed++;
      }
    }

    if (headers["access-control-allow-origin"]) {
      console.log(`\n  ℹ️  CORS: Access-Control-Allow-Origin: ${headers["access-control-allow-origin"]}`);
    }

    const totalHeaders = requiredHeaders.length;
    const letterGrade =
      score >= 90 ? "A+" : score >= 80 ? "A" : score >= 70 ? "B" : score >= 50 ? "C" : score >= 25 ? "D" : "F";

    console.log(`\n📊 Results: ${passed}/${totalHeaders} security headers present`);
    console.log(`🏆 Security Score: ${score}/100 (Grade: ${letterGrade})`);

    if (failed > 0) {
      console.log(`\n⚠️  Missing headers:`);
      for (const header of requiredHeaders) {
        if (!headers[header.key]) {
          console.log(`   - ${header.name} (${header.key})`);
        }
      }
    }

    // Mozilla Observatory recommendation
    if (passed >= 7) {
      console.log(`\n✅ Ready for Mozilla Observatory audit!`);
      console.log(`   Run: npx observatory-cli --host ${new URL(baseUrl).hostname}`);
    } else {
      console.log(`\n⚠️  Fix missing headers before running Mozilla Observatory audit.`);
      console.log(`   Once deployed, visit: https://observatory.mozilla.org`);
    }

    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error(`\n❌ Could not reach ${baseUrl}. Start the app first.`);
    console.error(err);
    process.exit(1);
  }
}

checkHeaders();
