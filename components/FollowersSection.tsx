import { Button } from "./Button";

export type Follower = {
  userId: number;
  name: string;
  email: string;
  iFollowThem: boolean;
};

type FollowersSectionProps = {
  followers: Follower[];
  onFollowBack: (userId: number) => Promise<void>;
  loadingId: number | null;
};

export function FollowersSection({
  followers,
  onFollowBack,
  loadingId,
}: FollowersSectionProps) {
  if (followers.length === 0) return null;

  return (
    <section aria-labelledby="followers-heading">
      <h2 id="followers-heading" className="mb-4 text-lg font-semibold text-foreground">
        People who follow you
      </h2>
      <ul className="space-y-3" role="list" aria-label="Users who follow you">
        {followers.map((f) => (
          <li
            key={f.userId}
            className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-surface p-4"
          >
            <div>
              <span className="font-medium text-foreground">{f.name}</span>
              <span className="ml-2 text-sm text-muted-foreground">
                {f.email}
              </span>
            </div>
            {f.iFollowThem ? (
              <span className="text-sm text-muted-foreground">Following</span>
            ) : (
              <Button
                type="button"
                size="sm"
                onClick={() => onFollowBack(f.userId)}
                disabled={loadingId === f.userId}
                aria-label={`Follow back ${f.name}`}
              >
                {loadingId === f.userId ? "…" : "Follow back"}
              </Button>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
