import { Button } from "./Button";

export type FollowRequest = {
  id: number;
  requesterId: number;
  requesterName: string;
  requesterEmail: string;
  createdAt: string;
};

type FollowRequestsSectionProps = {
  requests: FollowRequest[];
  onAccept: (id: number) => Promise<void>;
  onReject: (id: number) => Promise<void>;
  loadingId: number | null;
};

function formatDate(d: string) {
  const date = d.includes("T") ? new Date(d) : new Date(d + "T12:00:00");
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export function FollowRequestsSection({
  requests,
  onAccept,
  onReject,
  loadingId,
}: FollowRequestsSectionProps) {
  if (requests.length === 0) return null;

  return (
    <section aria-labelledby="follow-requests-heading">
      <h2 id="follow-requests-heading" className="mb-4 text-lg font-semibold text-foreground">
        Follow requests
      </h2>
      <ul className="space-y-3" role="list" aria-label="Pending follow requests">
        {requests.map((r) => (
          <li
            key={r.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-surface p-4"
          >
            <div>
              <span className="font-medium text-foreground">{r.requesterName}</span>
              <span className="ml-2 text-sm text-muted-foreground">
                {r.requesterEmail}
              </span>
              <span className="ml-2 text-xs text-muted-foreground">
                {formatDate(r.createdAt)}
              </span>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                onClick={() => onAccept(r.id)}
                disabled={loadingId === r.id}
                aria-label={`Accept ${r.requesterName}`}
              >
                {loadingId === r.id ? "…" : "Accept"}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onReject(r.id)}
                disabled={loadingId === r.id}
                aria-label={`Reject ${r.requesterName}`}
              >
                Reject
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
