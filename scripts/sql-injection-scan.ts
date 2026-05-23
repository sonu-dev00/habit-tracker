import { readFileSync, readdirSync } from "fs";
import { join } from "path";

const SRC_DIR = join(__dirname, "..", "src");

const rawQueryPatterns = [
  /\$queryRaw\s*`/,
  /\$executeRaw\s*`/,
  /\$queryRawUnsafe\s*\(/,
  /\$executeRawUnsafe\s*\(/,
  /prisma\.\$queryRaw/,
  /prisma\.\$executeRaw/,
];

const interpolationPattern = /\$\{[^}]+\}/;

interface Finding {
  file: string;
  line: number;
  content: string;
  risk: "safe" | "review" | "dangerous";
}

function walkDir(dir: string): string[] {
  const files: string[] = [];
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory() && !entry.name.startsWith(".") && entry.name !== "node_modules") {
      files.push(...walkDir(full));
    } else if (entry.isFile() && /\.(ts|tsx|js)$/.test(entry.name)) {
      files.push(full);
    }
  }
  return files;
}

function scanFile(filePath: string): Finding[] {
  const findings: Finding[] = [];
  const content = readFileSync(filePath, "utf-8");
  const lines = content.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const hasRawQuery = rawQueryPatterns.some((p) => p.test(line));

    if (hasRawQuery) {
      const hasInterpolation = interpolationPattern.test(line);
      findings.push({
        file: filePath,
        line: i + 1,
        content: line.trim(),
        risk: hasInterpolation ? "dangerous" : "safe",
      });
    }
  }

  return findings;
}

const allFiles = walkDir(SRC_DIR);
const allFindings: Finding[] = [];

for (const file of allFiles) {
  const findings = scanFile(file);
  allFindings.push(...findings);
}

console.log("\n=== SQL Injection Scan Results ===\n");

if (allFindings.length === 0) {
  console.log("No raw SQL queries found. Prisma's query builder is used consistently.\n");
  console.log("Score: 100% safe — all queries use Prisma's parameterized API.\n");
  process.exit(0);
}

let dangerous = 0;
let safe = 0;

for (const f of allFindings) {
  const icon = f.risk === "dangerous" ? "🔴" : f.risk === "review" ? "🟡" : "🟢";
  console.log(`${icon} [${f.risk.toUpperCase()}] ${f.file}:${f.line}`);
  console.log(`   ${f.content}\n`);

  if (f.risk === "dangerous") dangerous++;
  else safe++;
}

console.log(`\nSummary:`);
console.log(`  Safe queries: ${safe}`);
console.log(`  Dangerous queries: ${dangerous}`);
console.log(`  Total raw SQL queries: ${allFindings.length}\n`);

if (dangerous > 0) {
  console.log("❌ FAIL: Dangerous raw SQL queries found with string interpolation.");
  console.log("   Fix: Use parameterized queries instead of string interpolation.\n");
  process.exit(1);
}

console.log("✅ PASS: All raw SQL queries use safe parameterized patterns.\n");
