import { Button } from "./Button";

export type SentFollowRequest = {
  id: number;
  recipientId: number;
  recipientName: string;
  recipientEmail: string;
  createdAt: string;
};

type SentFollowRequestsSectionProps = {
  requests: SentFollowRequest[];
  onCancel: (id: number) => Promise<void>;
  loadingId: number | null;
};

function formatDate(d: string | number | Date | null | undefined) {
  if (d == null) return "";
  const date = typeof d === "string"
    ? d.includes("T")
      ? new Date(d)
      : new Date(d + "T12:00:00")
    : new Date(d);
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export function SentFollowRequestsSection({
  requests,
  onCancel,
  loadingId,
}: SentFollowRequestsSectionProps) {
  if (requests.length === 0) return null;

  return (
    <section aria-labelledby="sent-requests-heading">
      <h2 id="sent-requests-heading" className="mb-4 text-lg font-semibold text-foreground">
        Sent follow requests
      </h2>
      <ul className="space-y-3" role="list" aria-label="Pending follow requests you sent">
        {requests.map((r) => (
          <li
            key={r.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-surface p-4"
          >
            <div>
              <span className="font-medium text-foreground">{r.recipientName}</span>
              <span className="ml-2 text-sm text-muted-foreground">
                {r.recipientEmail}
              </span>
              <span className="ml-2 text-xs text-muted-foreground">
                {formatDate(r.createdAt)}
              </span>
              <span className="ml-2 text-xs text-muted-foreground">(pending)</span>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onCancel(r.id)}
              disabled={loadingId === r.id}
              aria-label={`Cancel request to ${r.recipientName}`}
            >
              {loadingId === r.id ? "…" : "Cancel"}
            </Button>
          </li>
        ))}
      </ul>
    </section>
  );
}
