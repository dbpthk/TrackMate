import { useState, useEffect } from "react";
import { sanitizeInput } from "@/utils/sanitize";

export type ProfileFormValues = {
  name: string;
  goal: string;
  stats: string;
};

export type ProfileFormProps = {
  initialValues: ProfileFormValues;
  onSubmit: (values: ProfileFormValues) => Promise<void>;
  error?: string;
};

export function ProfileForm({
  initialValues,
  onSubmit,
  error,
}: ProfileFormProps) {
  const [name, setName] = useState(initialValues.name);
  const [goal, setGoal] = useState(initialValues.goal);
  const [stats, setStats] = useState(initialValues.stats);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    setName(initialValues.name);
    setGoal(initialValues.goal);
    setStats(initialValues.stats);
  }, [initialValues]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");
    setLoading(true);
    try {
      await onSubmit({
        name: sanitizeInput(name, 255),
        goal: sanitizeInput(goal, 1000),
        stats: sanitizeInput(stats, 2000),
      });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setLoading(false);
    }
  };

  const displayError = submitError || error;

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4"
      aria-label="Edit profile form"
      noValidate
    >
      <div>
        <label
          htmlFor="profile-name"
          className="mb-1 block text-sm font-medium text-foreground"
        >
          Name
        </label>
        <input
          id="profile-name"
          type="text"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          maxLength={255}
          aria-required="true"
          aria-invalid={!!displayError}
          aria-describedby={displayError ? "profile-error" : undefined}
          className="w-full rounded border border-border bg-surface px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>
      <div>
        <label
          htmlFor="profile-goal"
          className="mb-1 block text-sm font-medium text-foreground"
        >
          Goal
        </label>
        <textarea
          id="profile-goal"
          rows={3}
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          maxLength={1000}
          aria-describedby={displayError ? "profile-error" : "profile-goal-hint"}
          className="w-full rounded border border-border bg-surface px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <p id="profile-goal-hint" className="mt-1 text-xs text-muted-foreground">
          Your fitness or training goal
        </p>
      </div>
      <div>
        <label
          htmlFor="profile-stats"
          className="mb-1 block text-sm font-medium text-foreground"
        >
          Stats (JSON)
        </label>
        <textarea
          id="profile-stats"
          rows={4}
          value={stats}
          onChange={(e) => setStats(e.target.value)}
          maxLength={2000}
          aria-describedby={
            displayError ? "profile-error" : "profile-stats-hint"
          }
          className="w-full rounded border border-border bg-surface px-3 py-2 font-mono text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <p
          id="profile-stats-hint"
          className="mt-1 text-xs text-muted-foreground"
        >
          Optional JSON object, e.g. {`{"weight": 70, "height": 175}`}
        </p>
      </div>
      {displayError && (
        <p
          id="profile-error"
          role="alert"
          className="text-sm text-red-600 dark:text-red-400"
        >
          {displayError}
        </p>
      )}
      <button
        type="submit"
        disabled={loading}
        aria-busy={loading}
        aria-disabled={loading}
        className="w-fit rounded bg-primary px-4 py-2 font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
      >
        {loading ? "Saving…" : "Save profile"}
      </button>
    </form>
  );
}
