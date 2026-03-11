"use client";

import { useState } from "react";

export type AcceptedRequest = {
  id: number;
  recipientId: number;
  recipientName: string;
  recipientEmail: string;
  createdAt: string;
};

type AcceptedRequestsSectionProps = {
  requests: AcceptedRequest[];
  viewedRecipientIds?: Set<number>;
  onView?: (recipientId: number) => void;
  onRemove?: (recipientId: number) => void;
};

function formatDate(d: string | number | Date | null | undefined) {
  if (d == null) return "";
  const date =
    typeof d === "string"
      ? d.includes("T")
        ? new Date(d)
        : new Date(d + "T12:00:00")
      : new Date(d);
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

/** Deduplicate by recipientId, keep most recent per user */
function dedupeByUser(requests: AcceptedRequest[]): AcceptedRequest[] {
  const byUser = new Map<number, AcceptedRequest>();
  const sorted = [...requests].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  for (const r of sorted) {
    if (!byUser.has(r.recipientId)) byUser.set(r.recipientId, r);
  }
  return Array.from(byUser.values()).sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function AcceptedRequestsSection({
  requests,
  viewedRecipientIds = new Set(),
  onView,
  onRemove,
}: AcceptedRequestsSectionProps) {
  const items = dedupeByUser(requests);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const unviewedCount = items.filter((i) => !viewedRecipientIds.has(i.recipientId)).length;
  if (items.length === 0) return null;

  return (
    <section aria-labelledby="notifications-heading">
      <button
        type="button"
        id="notifications-heading"
        onClick={() => setIsCollapsed((c) => !c)}
        className="mb-4 flex w-full items-center justify-between text-left text-lg font-semibold text-foreground"
        aria-expanded={!isCollapsed}
      >
        Notifications
        <span className="flex items-center gap-2">
          {unviewedCount > 0 && (
            <span className="rounded-full bg-primary px-2.5 py-0.5 text-xs font-medium text-primary-foreground">
              {unviewedCount}
            </span>
          )}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`transition-transform ${isCollapsed ? "" : "rotate-180"}`}
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </span>
      </button>
      {!isCollapsed && (
        <ul
          className="space-y-3"
          role="list"
          aria-label="Follow requests you sent that were accepted"
        >
          {items.map((r) => {
            const isViewed = viewedRecipientIds.has(r.recipientId);
            return (
            <li
              key={r.id}
              role="button"
              tabIndex={0}
              onClick={() => onView?.(r.recipientId)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onView?.(r.recipientId);
                }
              }}
              className={`flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-3 ${
                isViewed
                  ? "border-border bg-surface"
                  : "border-green-200 bg-green-50/50 dark:border-green-900/50 dark:bg-green-950/20"
              }`}
            >
              <span className="font-medium text-foreground">{r.recipientName}</span>
              <span className="text-sm text-muted-foreground">
                accepted your follow request
              </span>
              <span className="ml-auto flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {formatDate(r.createdAt)}
                </span>
                {onRemove && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemove(r.recipientId);
                    }}
                    className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                    aria-label="Remove notification"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M18 6 6 18" />
                      <path d="m6 6 12 12" />
                    </svg>
                  </button>
                )}
              </span>
            </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
