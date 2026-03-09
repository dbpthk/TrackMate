import { useState, useEffect, useCallback } from "react";
import { Modal } from "./Modal";
import { Button } from "./Button";
import { Input } from "./Input";
import { ExerciseInputRow, type ExerciseInput } from "./ExerciseInputRow";
import type { WorkoutWithExercises } from "./WorkoutCard";

type AddWorkoutModalProps = {
  isOpen: boolean;
  onClose: () => void;
  initialData?: { date?: string; type?: string };
  onSave: (data: {
    date: string;
    type: string;
    exercises: Array<{
      name: string;
      sets?: number;
      reps?: number;
      weight?: number;
    }>;
  }) => Promise<void>;
  onDelete?: (workoutId: number) => Promise<void>;
  workout?: WorkoutWithExercises | null;
  getSuggestion?: (name: string) => Promise<{
    sets: number | null;
    reps: number | null;
    weight: number | null;
  }>;
};

const emptyExercise = (): ExerciseInput => ({
  name: "",
  sets: "",
  reps: "",
  weight: "",
});

export function AddWorkoutModal({
  isOpen,
  onClose,
  initialData,
  onSave,
  onDelete,
  workout,
  getSuggestion,
}: AddWorkoutModalProps) {
  const isEdit = !!workout;
  const [date, setDate] = useState("");
  const [type, setType] = useState("");
  const [exercises, setExercises] = useState<ExerciseInput[]>([]);
  const [suggestions, setSuggestions] = useState<
    Record<string, { sets: number | null; reps: number | null; weight: number | null }>
  >({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      const today = new Date().toISOString().slice(0, 10);
      if (workout) {
        setDate(workout.date);
        setType(workout.type);
        setExercises(
          (workout.exercises ?? []).map((ex) => ({
            id: ex.id,
            name: ex.name,
            sets: ex.sets != null ? String(ex.sets) : "",
            reps: ex.reps != null ? String(ex.reps) : "",
            weight: ex.weight != null ? String(ex.weight) : "",
          }))
        );
      } else {
        setDate(initialData?.date ?? today);
        setType(initialData?.type ?? "");
        setExercises([emptyExercise()]);
      }
      setError("");
      setSuggestions({});
    }
  }, [isOpen, workout, initialData]);

  const fetchSuggestion = useCallback(
    async (name: string) => {
      const n = name.trim();
      if (!n || !getSuggestion) return;
      try {
        const s = await getSuggestion(n);
        setSuggestions((prev) => ({ ...prev, [n]: s }));
      } catch {
        // ignore
      }
    },
    [getSuggestion]
  );

  const handleExerciseChange = (index: number, value: ExerciseInput) => {
    setExercises((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const handleAddExercise = () => {
    setExercises((prev) => [...prev, emptyExercise()]);
  };

  const handleRemoveExercise = (index: number) => {
    setExercises((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const t = type.trim();
    if (!t) {
      setError("Workout type required");
      return;
    }
    if (!date) {
      setError("Date required");
      return;
    }
    setLoading(true);
    try {
      const payload = exercises
        .filter((ex) => ex.name.trim())
        .map((ex) => ({
          name: ex.name.trim().slice(0, 255),
          sets: ex.sets ? Math.max(0, Math.floor(Number(ex.sets))) : undefined,
          reps: ex.reps ? Math.max(0, Math.floor(Number(ex.reps))) : undefined,
          weight: ex.weight ? Math.max(0, Math.floor(Number(ex.weight))) : undefined,
        }));
      await onSave({ date, type: t, exercises: payload });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!workout || !onDelete) return;
    if (!confirm("Delete this workout?")) return;
    setLoading(true);
    try {
      await onDelete(workout.id);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Edit workout" : "Add workout"}
      aria-describedby={error ? "modal-error" : undefined}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value.slice(0, 10))}
            required
            aria-required="true"
          />
          <Input
            label="Type"
            value={type}
            onChange={(e) => setType(e.target.value.slice(0, 100))}
            placeholder="e.g. Upper body"
            required
            aria-required="true"
          />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-sm font-medium text-foreground">
              Exercises
            </label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleAddExercise}
              aria-label="Add exercise"
            >
              + Add
            </Button>
          </div>
          <div className="space-y-3">
            {exercises.map((ex, i) => (
              <ExerciseInputRow
                key={i}
                value={ex}
                onChange={(v) => handleExerciseChange(i, v)}
                onRemove={exercises.length > 1 ? () => handleRemoveExercise(i) : undefined}
                suggestion={ex.name.trim() ? suggestions[ex.name.trim()] : undefined}
                onNameBlur={(n) => n.trim() && fetchSuggestion(n)}
              />
            ))}
          </div>
        </div>

        {error && (
          <p id="modal-error" role="alert" className="text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        )}

        <div className="flex flex-wrap gap-3">
          <Button type="submit" disabled={loading} aria-busy={loading}>
            {loading ? "Saving…" : isEdit ? "Save" : "Add workout"}
          </Button>
          {isEdit && onDelete && (
            <Button
              type="button"
              variant="danger"
              onClick={handleDelete}
              disabled={loading}
              aria-label="Delete workout"
            >
              Delete
            </Button>
          )}
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
}
