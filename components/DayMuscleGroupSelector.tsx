"use client";

import { useState, useEffect } from "react";
import { MUSCLE_GROUPS } from "@/drizzle/schema";

const MUSCLE_GROUP_LABELS: Record<string, string> = {
  chest: "Chest",
  triceps: "Triceps",
  back: "Back",
  biceps: "Biceps",
  shoulders: "Shoulders",
  legs: "Legs",
  abs: "Abs",
  core: "Core",
  functional: "Functional Training",
};

type DayMuscleGroupSelectorProps = {
  dayId: string;
  dayName: string;
  dayOrder: number;
  muscleGroups: string[];
  onSave: (muscleGroups: string[]) => Promise<void>;
};

export function DayMuscleGroupSelector({
  dayName,
  muscleGroups,
  onSave,
}: DayMuscleGroupSelectorProps) {
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(muscleGroups)
  );

  useEffect(() => {
    setSelected(new Set(muscleGroups));
  }, [muscleGroups]);

  const handleChange = (mg: string) => {
    const next = new Set(selected);
    if (next.has(mg)) next.delete(mg);
    else next.add(mg);
    setSelected(next);
    void onSave(Array.from(next));
  };

  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <p className="mb-2 text-sm font-medium text-foreground">{dayName}</p>
      <div className="flex flex-wrap gap-2">
        {MUSCLE_GROUPS.map((mg) => (
          <label
            key={mg}
            className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-1.5 text-sm transition-colors ${
              selected.has(mg)
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-surface-muted/50 text-foreground hover:bg-surface-muted"
            }`}
          >
            <input
              type="checkbox"
              checked={selected.has(mg)}
              onChange={() => handleChange(mg)}
              className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
            />
            {MUSCLE_GROUP_LABELS[mg] ?? mg}
          </label>
        ))}
      </div>
    </div>
  );
}
