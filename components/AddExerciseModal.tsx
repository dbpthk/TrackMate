"use client";

import { useState, useEffect, useMemo } from "react";
import { Modal } from "./Modal";
import { Button } from "./Button";
import { Input } from "./Input";
import { MUSCLE_GROUPS } from "@/drizzle/schema";

type ExerciseMaster = {
  id: string;
  name: string;
  muscleGroup: string;
  equipment: string | null;
  createdAt: string;
};

type AddExerciseModalProps = {
  isOpen: boolean;
  onClose: () => void;
  dayName: string;
  workoutDayId: string;
  dayMuscleGroups?: string[];
  onSave: () => void | Promise<void>;
};

/** Map day name keywords to suggested muscle groups */
function getSuggestedGroupsForDay(dayName: string): string[] {
  const lower = dayName.toLowerCase();
  const groups: string[] = [];
  if (lower.includes("chest") || lower.includes("push")) groups.push("chest");
  if (lower.includes("tricep") || lower.includes("push"))
    groups.push("triceps");
  if (lower.includes("back") || lower.includes("pull")) groups.push("back");
  if (lower.includes("bicep") || lower.includes("pull")) groups.push("biceps");
  if (lower.includes("shoulder") || lower.includes("delt"))
    groups.push("shoulders");
  if (lower.includes("leg")) groups.push("legs");
  if (lower.includes("abs") || lower.includes("core")) groups.push("abs");
  return groups.length > 0 ? groups : [];
}

export function AddExerciseModal({
  isOpen,
  onClose,
  dayName,
  workoutDayId,
  dayMuscleGroups = [],
  onSave,
}: AddExerciseModalProps) {
  const [allExercises, setAllExercises] = useState<ExerciseMaster[]>([]);
  const [selectedMuscleGroups, setSelectedMuscleGroups] = useState<Set<string>>(
    new Set()
  );
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectedExercises, setSelectedExercises] = useState<ExerciseMaster[]>(
    []
  );
  const [sets, setSets] = useState("");
  const [reps, setReps] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const suggestedGroups = getSuggestedGroupsForDay(dayName);
  const muscleGroupsToShow = [...MUSCLE_GROUPS];

  /** Group all exercises by muscle group */
  const exercisesByGroup = useMemo(() => {
    const map: Record<string, ExerciseMaster[]> = {};
    for (const ex of allExercises) {
      const mg = ex.muscleGroup;
      if (!map[mg]) map[mg] = [];
      map[mg].push(ex);
    }
    return Object.entries(map)
      .filter(([, exs]) => exs.length > 0)
      .sort(([a], [b]) => a.localeCompare(b));
  }, [allExercises]);

  /** Selected exercises grouped by muscle */
  const selectedByGroup = useMemo(() => {
    const map: Record<string, ExerciseMaster[]> = {};
    for (const ex of selectedExercises) {
      const mg = ex.muscleGroup;
      if (!map[mg]) map[mg] = [];
      map[mg].push(ex);
    }
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
  }, [selectedExercises]);

  useEffect(() => {
    if (!isOpen) return;
    const toSelect =
      dayMuscleGroups.length > 0 ? dayMuscleGroups : suggestedGroups;
    setSelectedMuscleGroups(new Set(toSelect));
    setSelectedIds(new Set());
    setSelectedExercises([]);
    setSets("");
    setReps("");
    setError("");
  }, [isOpen, dayName, dayMuscleGroups]);

  useEffect(() => {
    if (!isOpen) return;
    const fetchAll = async () => {
      const res = await fetch("/api/exercise-master");
      if (res.ok) {
        const data = await res.json();
        setAllExercises(data);
      } else {
        setAllExercises([]);
      }
    };
    fetchAll();
  }, [isOpen]);

  const toggleMuscleGroup = (mg: string) => {
    setSelectedMuscleGroups((prev) => {
      const next = new Set(prev);
      if (next.has(mg)) next.delete(mg);
      else next.add(mg);
      return next;
    });
  };

  const toggleExercise = (ex: ExerciseMaster) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(ex.id)) next.delete(ex.id);
      else next.add(ex.id);
      return next;
    });
    setSelectedExercises((prev) => {
      const exists = prev.some((e) => e.id === ex.id);
      if (exists) return prev.filter((e) => e.id !== ex.id);
      return [...prev, ex];
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedExercises.length === 0) {
      setError("Select at least one exercise");
      return;
    }
    setLoading(true);
    setError("");
    const setsVal = sets ? Math.max(0, parseInt(sets, 10)) : undefined;
    const repsVal = reps.trim() || undefined;
    try {
      for (const ex of selectedExercises) {
        const res = await fetch("/api/workout-day-exercises", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            workoutDayId,
            exerciseId: ex.id,
            sets: setsVal,
            reps: repsVal,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Failed to add");
      }
      await onSave();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add exercises");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Add Exercise — ${dayName}`}
      aria-describedby={error ? "add-exercise-error" : undefined}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">
            Select muscle groups for this day
          </label>
          <div className="flex flex-wrap gap-2">
            {muscleGroupsToShow.map((mg) => (
              <label
                key={mg}
                className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm capitalize transition-colors ${
                  selectedMuscleGroups.has(mg)
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-surface text-foreground hover:bg-surface-muted"
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedMuscleGroups.has(mg)}
                  onChange={() => toggleMuscleGroup(mg)}
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                />
                {mg}
              </label>
            ))}
          </div>
        </div>

        {selectedMuscleGroups.size > 0 && (
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">
              Select exercises for each muscle group
            </label>
            <div className="max-h-64 space-y-4 overflow-y-auto rounded-lg border border-border bg-surface p-3">
              {exercisesByGroup
                .filter(([group]) => selectedMuscleGroups.has(group))
                .map(([group, exs]) => (
                  <div key={group}>
                    <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {group}
                    </span>
                    <ul className="mt-1.5 space-y-0.5">
                      {exs.map((ex) => (
                        <li key={ex.id}>
                          <label className="flex cursor-pointer items-center gap-3 rounded px-2 py-1.5 text-sm transition-colors hover:bg-surface-muted">
                            <input
                              type="checkbox"
                              checked={selectedIds.has(ex.id)}
                              onChange={() => toggleExercise(ex)}
                              className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                            />
                            <span className="text-foreground">{ex.name}</span>
                          </label>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
            </div>
          </div>
        )}

        {selectedByGroup.length > 0 && (
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">
              Selected ({selectedExercises.length}) — grouped by muscle
            </label>
            <div className="max-h-28 space-y-2 overflow-y-auto rounded-lg border border-border bg-surface-muted/50 p-3">
              {selectedByGroup.map(([group, exs]) => (
                <div key={group}>
                  <span className="text-xs font-medium capitalize text-muted-foreground">
                    {group}
                  </span>
                  <ul className="mt-1 space-y-0.5">
                    {exs.map((ex) => (
                      <li
                        key={ex.id}
                        className="flex items-center justify-between text-sm text-foreground"
                      >
                        {ex.name}
                        <button
                          type="button"
                          onClick={() => toggleExercise(ex)}
                          className="rounded px-1.5 text-muted-foreground hover:bg-surface-muted hover:text-red-600"
                          aria-label={`Remove ${ex.name}`}
                        >
                          ×
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Sets"
            type="number"
            min={0}
            value={sets}
            onChange={(e) => setSets(e.target.value)}
            placeholder="e.g. 4"
          />
          <Input
            label="Reps"
            type="text"
            value={reps}
            onChange={(e) => setReps(e.target.value)}
            placeholder="e.g. 8-12 or 10"
          />
        </div>

        {error && (
          <p
            id="add-exercise-error"
            role="alert"
            className="text-sm text-red-600 dark:text-red-400"
          >
            {error}
          </p>
        )}

        <div className="flex gap-3">
          <Button
            type="submit"
            disabled={loading || selectedExercises.length === 0}
            aria-busy={loading}
          >
            {loading
              ? "Adding…"
              : `Add ${selectedExercises.length} exercise${selectedExercises.length !== 1 ? "s" : ""}`}
          </Button>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
}
