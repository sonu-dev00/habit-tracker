const PROHIBITED_PATTERNS = [
  /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
  /(?:DROP|DELETE|TRUNCATE|ALTER|EXEC)\s+(?:TABLE|DATABASE|PROCEDURE)/gi,
  /https?:\/\/(?:www\.)?(?:malware|phishing|scam|hack|spam)/gi,
];

const MAX_INPUT_LENGTH = 5000;

export function moderateInput(input: string): { safe: boolean; reason?: string } {
  if (input.length > MAX_INPUT_LENGTH) {
    return { safe: false, reason: "Content exceeds maximum length" };
  }

  for (const pattern of PROHIBITED_PATTERNS) {
    if (pattern.test(input)) {
      return { safe: false, reason: "Content contains prohibited patterns" };
    }
  }

  const cleaned = input.replace(/<[^>]*>/g, "");
  if (cleaned.length === 0 && input.length > 0) {
    return { safe: false, reason: "Content contains only HTML tags" };
  }

  return { safe: true };
}
