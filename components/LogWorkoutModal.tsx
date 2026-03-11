"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "./Card";
import { Button } from "./Button";

export type LogExercise = {
  id: string;
  name: string;
  muscleGroup: string;
  sets?: number;
  reps?: string;
};

export type LogEntry = {
  exerciseId: string;
  name: string;
  sets: number | null;
  reps: number | null;
  weight: number | null;
};

type ExistingExerciseLog = {
  id: number;
  name: string;
  sets: number | null;
  reps: number | null;
  weight: number | null;
};

type LogWorkoutModalProps = {
  isOpen: boolean;
  onClose: () => void;
  dayName: string;
  exercises: LogExercise[];
  date: string;
  /** Existing workout for this date (to pre-fill and override) */
  existingWorkout?: { exercises: ExistingExerciseLog[] } | null;
  onSave: () => void;
};

export function LogWorkoutModal({
  isOpen,
  onClose,
  dayName,
  exercises,
  date,
  existingWorkout,
  onSave,
}: LogWorkoutModalProps) {
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && exercises.length > 0) {
      const existingByName = new Map(
        (existingWorkout?.exercises ?? []).map((e) => [
          e.name.trim().toLowerCase(),
          e,
        ])
      );
      setEntries(
        exercises.map((ex) => {
          const existing = existingByName.get(ex.name.trim().toLowerCase());
          return {
            exerciseId: ex.id,
            name: ex.name,
            sets: existing?.sets ?? ex.sets ?? null,
            reps:
              existing?.reps != null
                ? existing.reps
                : ex.reps != null && ex.reps !== ""
                  ? parseInt(String(ex.reps), 10) || null
                  : null,
            weight: existing?.weight ?? null,
          };
        })
      );
      setError(null);
    }
  }, [isOpen, exercises, existingWorkout]);

  const updateEntry = (idx: number, field: keyof LogEntry, value: number | null) => {
    setEntries((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      return next;
    });
  };

  const handleSubmit = async () => {
    const toSend = entries.filter(
      (e) => (e.sets != null && e.sets > 0) || (e.reps != null && e.reps > 0) || (e.weight != null && e.weight > 0)
    );
    if (toSend.length === 0) {
      setError("Add at least one exercise with sets, reps, or weight.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/workouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date,
          type: dayName,
          exercises: toSend.map((e) => ({
            name: e.name,
            sets: e.sets ?? undefined,
            reps: e.reps ?? undefined,
            weight: e.weight ?? undefined,
          })),
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to save workout");
      }
      onSave();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="log-workout-title"
    >
      <Card className="max-h-[90dvh] w-full max-w-lg overflow-hidden rounded-t-xl border-b-0 shadow-xl sm:max-h-[85vh] sm:rounded-lg sm:border">
        <CardHeader className="flex flex-row items-center justify-between border-b border-border">
          <CardTitle id="log-workout-title">Log Workout — {dayName}</CardTitle>
          <button
            type="button"
            onClick={onClose}
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded text-xl text-muted-foreground hover:bg-surface-muted hover:text-foreground"
            aria-label="Close"
          >
            ×
          </button>
        </CardHeader>
        <CardContent className="max-h-[75dvh] overflow-y-auto space-y-4 pt-4 sm:max-h-[70vh]">
          <p className="text-sm text-muted-foreground">
            Enter sets, reps, and weight for each exercise. New personal records will appear on your Stats page.
          </p>
          {exercises.length === 0 ? (
            <p className="text-sm text-muted-foreground">No exercises in this day. Add exercises to your split first.</p>
          ) : (
            <div className="space-y-4">
              {entries.map((entry, idx) => (
                <div
                  key={entry.exerciseId}
                  className="rounded-lg border border-border bg-surface p-3"
                >
                  <p className="mb-2 font-medium text-foreground">{entry.name}</p>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-xs text-muted-foreground">Sets</label>
                      <input
                        type="number"
                        min={0}
                        placeholder="—"
                        value={entry.sets ?? ""}
                        onChange={(e) =>
                          updateEntry(idx, "sets", e.target.value === "" ? null : parseInt(e.target.value, 10))
                        }
                        className="mt-0.5 w-full rounded border border-border bg-background px-2 py-1.5 text-base"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Reps</label>
                      <input
                        type="number"
                        min={0}
                        placeholder="—"
                        value={entry.reps ?? ""}
                        onChange={(e) =>
                          updateEntry(idx, "reps", e.target.value === "" ? null : parseInt(e.target.value, 10))
                        }
                        className="mt-0.5 w-full rounded border border-border bg-background px-2 py-1.5 text-base"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Weight (kg)</label>
                      <input
                        type="number"
                        min={0}
                        step={0.5}
                        placeholder="—"
                        value={entry.weight ?? ""}
                        onChange={(e) =>
                          updateEntry(idx, "weight", e.target.value === "" ? null : parseFloat(e.target.value))
                        }
                        className="mt-0.5 w-full rounded border border-border bg-background px-2 py-1.5 text-base"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}
        </CardContent>
        <div className="flex justify-end gap-2 border-t border-border p-4">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={saving || exercises.length === 0}>
            {saving ? "Saving…" : "Save Workout"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
