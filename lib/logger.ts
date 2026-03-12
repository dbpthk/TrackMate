/**
 * Safe error logging. In development, logs full error with stack trace.
 * In production, logs a generic message to avoid exposing internal details.
 */

export function logError(context: string, err: unknown): void {
  if (process.env.NODE_ENV === "development") {
    console.error(`[${context}]`, err);
  } else {
    console.error(`[${context}] An error occurred.`);
  }
}
