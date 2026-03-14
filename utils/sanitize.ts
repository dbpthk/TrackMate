/**
 * Client + server sanitization. Use before persisting or displaying user input.
 * Drizzle uses parameterized queries; these helpers prevent XSS and invalid data.
 */

/** Escape HTML entities to prevent XSS when rendering user content */
export function escapeHtml(str: string): string {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

/** Trim and limit length. Use when persisting to DB. */
export function sanitizeInput(str: unknown, maxLength = 255): string {
  return String(str ?? "").trim().slice(0, maxLength);
}

/** Non-negative integer for sets, reps, duration */
export function sanitizeInt(val: unknown): number | undefined {
  if (val === null || val === undefined || val === "") return undefined;
  const n = Math.floor(Number(val));
  return Number.isFinite(n) && n >= 0 ? n : undefined;
}

/** Non-negative decimal for weight, rounded to 2 places */
export function sanitizeDecimal(
  val: unknown,
  maxDecimals = 2
): number | undefined {
  if (val === null || val === undefined || val === "") return undefined;
  const n = Number(val);
  if (!Number.isFinite(n) || n < 0) return undefined;
  const factor = 10 ** maxDecimals;
  return Math.round(n * factor) / factor;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Check if email format is valid */
export function isValidEmail(val: unknown): boolean {
  const s = String(val ?? "").trim().toLowerCase().slice(0, 255);
  return EMAIL_REGEX.test(s);
}

/** Email: trim, lowercase, basic format check */
export function sanitizeEmail(val: unknown): string {
  const s = String(val ?? "").trim().toLowerCase().slice(0, 255);
  return EMAIL_REGEX.test(s) ? s : "";
}

/** Date string YYYY-MM-DD only */
export function sanitizeDate(val: unknown): string {
  const s = String(val ?? "").trim().slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : "";
}

/** Validate date is within reasonable range (2010–2030). Use after sanitizeDate. */
export function isReasonableDate(dateStr: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
  const year = parseInt(dateStr.slice(0, 4), 10);
  return year >= 2010 && year <= 2030;
}

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** Validate UUID v4 format */
export function isValidUuid(val: unknown): boolean {
  return typeof val === "string" && UUID_REGEX.test(val.trim());
}

/** Sanitize JSON object for stats - allow only plain objects with string/number values */
export function sanitizeStats(val: unknown): Record<string, unknown> | null {
  if (val === null || val === undefined) return null;
  if (typeof val === "string") {
    try {
      const parsed = JSON.parse(val) as unknown;
      return sanitizeStats(parsed);
    } catch {
      return null;
    }
  }
  if (typeof val !== "object" || Array.isArray(val)) return null;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(val)) {
    if (typeof k !== "string" || k.length > 100) continue;
    if (typeof v === "string" || typeof v === "number") {
      out[sanitizeInput(k, 100)] = v;
    }
  }
  return out;
}
