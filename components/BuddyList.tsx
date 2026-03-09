import { useState } from "react";
import { Input } from "./Input";
import { Button } from "./Button";

export type Buddy = {
  buddyId: number;
  name: string;
  email: string;
};

type BuddyListProps = {
  buddies: Buddy[];
  onUnfollow: (buddyId: number) => Promise<void>;
  onFollow: (email: string) => Promise<void>;
};

export function BuddyList({ buddies, onUnfollow, onFollow }: BuddyListProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [unfollowingId, setUnfollowingId] = useState<number | null>(null);
  const [error, setError] = useState("");

  const handleFollow = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await onFollow(email.trim());
      setEmail("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add");
    } finally {
      setLoading(false);
    }
  };

  const handleUnfollow = async (buddyId: number) => {
    setUnfollowingId(buddyId);
    setError("");
    try {
      await onUnfollow(buddyId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to unfollow");
    } finally {
      setUnfollowingId(null);
    }
  };

  return (
    <section aria-labelledby="buddy-list-heading">
      <h2 id="buddy-list-heading" className="mb-4 text-lg font-semibold text-foreground">
        My buddies
      </h2>

      <form
        onSubmit={handleFollow}
        className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end"
        aria-label="Add buddy by email"
      >
        <div className="flex-1">
          <Input
            label="Add by email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value.slice(0, 255))}
            placeholder="buddy@example.com"
            error={error}
            aria-describedby={error ? "add-buddy-error" : undefined}
          />
        </div>
        <Button
          type="submit"
          disabled={loading || !email.trim()}
          aria-busy={loading}
        >
          {loading ? "Adding…" : "Follow"}
        </Button>
      </form>

      {buddies.length === 0 ? (
        <p className="text-muted-foreground" role="status">
          No buddies yet. Search by email to follow someone.
        </p>
      ) : (
        <ul
          className="space-y-2"
          role="list"
          aria-label="List of buddies you follow"
        >
          {buddies.map((b) => (
            <li
              key={b.buddyId}
              className="flex flex-wrap items-center justify-between gap-2 rounded border border-border bg-surface p-3"
            >
              <div>
                <span className="font-medium text-foreground">{b.name}</span>
                <span className="ml-2 text-sm text-muted-foreground">
                  {b.email}
                </span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleUnfollow(b.buddyId)}
                disabled={unfollowingId === b.buddyId}
                aria-label={`Unfollow ${b.name}`}
              >
                {unfollowingId === b.buddyId ? "…" : "Unfollow"}
              </Button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
