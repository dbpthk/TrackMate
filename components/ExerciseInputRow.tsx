import { useEffect, useRef } from "react";
import { Input } from "./Input";

export type ExerciseInput = {
  id?: number;
  name: string;
  sets: string;
  reps: string;
  weight: string;
};

type ExerciseInputRowProps = {
  value: ExerciseInput;
  onChange: (value: ExerciseInput) => void;
  onRemove?: () => void;
  suggestion?: { sets: number | null; reps: number | null; weight: number | null };
  onNameBlur?: (name: string) => void;
};

const toStr = (n: number | null | undefined) =>
  n != null ? String(n) : "";

export function ExerciseInputRow({
  value,
  onChange,
  onRemove,
  suggestion,
  onNameBlur,
}: ExerciseInputRowProps) {
  const appliedRef = useRef<string>("");

  useEffect(() => {
    if (!suggestion) return;
    const key = value.name.trim();
    if (!key || (value.sets || value.weight)) return;
    const cacheKey = `${key}-${suggestion.sets}-${suggestion.reps}-${suggestion.weight}`;
    if (appliedRef.current === cacheKey) return;
    const sets = suggestion.sets != null ? toStr(suggestion.sets) : "";
    const reps = suggestion.reps != null ? toStr(suggestion.reps) : "";
    const weight = suggestion.weight != null ? toStr(suggestion.weight) : "";
    if (sets || reps || weight) {
      onChange({ ...value, sets, reps, weight });
      appliedRef.current = cacheKey;
    }
  }, [suggestion, value.name]);

  const update = (field: keyof ExerciseInput, val: string) => {
    const next = { ...value, [field]: val };
    if (field === "sets" || field === "reps" || field === "weight") {
      const num = val === "" ? "" : String(Math.max(0, Math.floor(Number(val) || 0)));
      next[field] = num;
    }
    onChange(next);
  };

  return (
    <div
      className="grid gap-3 rounded border border-border bg-surface-muted/30 p-3 sm:grid-cols-2 lg:grid-cols-[1fr_4rem_4rem_4rem_auto]"
      role="group"
      aria-label="Exercise row"
    >
      <Input
        label="Exercise"
        value={value.name}
        onChange={(e) => update("name", e.target.value)}
        onBlur={() => onNameBlur?.(value.name)}
        placeholder="e.g. Bench Press"
        maxLength={255}
        aria-label="Exercise name"
      />
      <Input
        label="Sets"
        type="number"
        min={0}
        value={value.sets}
        onChange={(e) => update("sets", e.target.value)}
        placeholder={suggestion?.sets != null ? String(suggestion.sets) : "—"}
        aria-label="Sets"
      />
      <Input
        label="Reps"
        type="number"
        min={0}
        value={value.reps}
        onChange={(e) => update("reps", e.target.value)}
        placeholder={suggestion?.reps != null ? String(suggestion.reps) : "—"}
        aria-label="Reps"
      />
      <Input
        label="Weight (kg)"
        type="number"
        min={0}
        value={value.weight}
        onChange={(e) => update("weight", e.target.value)}
        placeholder={suggestion?.weight != null ? String(suggestion.weight) : "—"}
        aria-label="Weight in kilograms"
      />
      {onRemove && (
        <div className="flex items-end">
          <button
            type="button"
            onClick={onRemove}
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded px-3 py-2 text-xl text-red-600 hover:bg-red-500/10 focus:outline-none focus:ring-2 focus:ring-red-500 dark:text-red-400"
            aria-label="Remove exercise"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}
