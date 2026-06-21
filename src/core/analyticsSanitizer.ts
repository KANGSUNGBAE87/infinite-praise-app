const ALLOWED_KEYS = new Set([
  "event",
  "source",
  "action",
  "status",
  "locale",
  "choice",
  "variant",
  "screen",
]);

const FORBIDDEN_TEXT_KEYS = new Set([
  "text",
  "rawText",
  "freeText",
  "originalText",
  "editedText",
  "praise",
  "rewrite",
  "reasonTag",
  "message",
  "content",
  "body",
]);

export function sanitizeAnalytics(properties: Record<string, unknown>) {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(properties)) {
    if (!ALLOWED_KEYS.has(key)) continue;
    if (FORBIDDEN_TEXT_KEYS.has(key)) continue;
    result[key] = value;
  }
  return result;
}
