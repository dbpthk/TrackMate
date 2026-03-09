/**
 * Sanitize string to prevent XSS. Escapes HTML entities.
 */
export function escapeHtml(str: string): string {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

/**
 * Sanitize for storage: trim and limit length. Use when persisting to DB.
 */
export function sanitizeInput(str: string, maxLength = 255): string {
  return String(str ?? "").trim().slice(0, maxLength);
}
