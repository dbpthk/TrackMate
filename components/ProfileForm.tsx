import { useState, useEffect } from "react";
import { sanitizeInput } from "@/utils/sanitize";
import {
  EXPERIENCE_LEVELS,
  TRAINING_SPLITS,
  TRAINING_SPLIT_MAX_DAYS,
  UNITS,
  WEEKDAYS,
} from "@/drizzle/schema";

export type ProfileFormValues = {
  name: string;
  email: string;
  goal: string;
  experienceLevel: string;
  age: string;
  height: string;
  weight: string;
  bodyFat: string;
  trainingSplit: string;
  preferredDays: string;
  units: string;
};

export type ProfileFormProps = {
  initialValues: ProfileFormValues;
  onSubmit: (values: ProfileFormValues) => Promise<void>;
  onSuccess?: () => void;
  onCancel?: () => void;
  error?: string;
};

export function ProfileForm({
  initialValues,
  onSubmit,
  onSuccess,
  onCancel,
  error,
}: ProfileFormProps) {
  const [name, setName] = useState(initialValues.name);
  const [goal, setGoal] = useState(initialValues.goal);
  const [experienceLevel, setExperienceLevel] = useState(
    initialValues.experienceLevel
  );
  const [age, setAge] = useState(initialValues.age);
  const [height, setHeight] = useState(initialValues.height);
  const [weight, setWeight] = useState(initialValues.weight);
  const [bodyFat, setBodyFat] = useState(initialValues.bodyFat);
  const [trainingSplit, setTrainingSplit] = useState(
    initialValues.trainingSplit
  );
  const [preferredDays, setPreferredDays] = useState<string[]>(() => {
    const raw = initialValues.preferredDays?.trim();
    if (!raw) return [];
    const parsed = raw.split(/[,\s]+/).filter(Boolean);
    const valid = parsed
      .map((d) => {
        const match = WEEKDAYS.find(
          (w) => w.toLowerCase() === d.trim().toLowerCase()
        );
        return match ?? null;
      })
      .filter((d): d is (typeof WEEKDAYS)[number] => d != null);
    return [...new Set(valid)];
  });
  const [units, setUnits] = useState(
    initialValues.units || "metric"
  );
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    setName(initialValues.name);
    setGoal(initialValues.goal);
    setExperienceLevel(initialValues.experienceLevel);
    setAge(initialValues.age);
    setHeight(initialValues.height);
    setWeight(initialValues.weight);
    setBodyFat(initialValues.bodyFat);
    setTrainingSplit(initialValues.trainingSplit);
    const raw = initialValues.preferredDays?.trim();
    if (!raw) {
      setPreferredDays([]);
    } else {
      const parsed = raw.split(/[,\s]+/).filter(Boolean);
      const valid = parsed
        .map((d) => {
          const match = WEEKDAYS.find(
            (w) => w.toLowerCase() === d.trim().toLowerCase()
          );
          return match ?? null;
        })
        .filter((d): d is (typeof WEEKDAYS)[number] => d != null);
      setPreferredDays([...new Set(valid)]);
    }
    setUnits(initialValues.units || "metric");
  }, [
    initialValues.name,
    initialValues.goal,
    initialValues.experienceLevel,
    initialValues.age,
    initialValues.height,
    initialValues.weight,
    initialValues.bodyFat,
    initialValues.trainingSplit,
    initialValues.preferredDays,
    initialValues.units,
  ]);

  // Trim preferred days when training split changes and exceeds max
  useEffect(() => {
    const split = trainingSplit?.trim();
    if (!split) return;
    let max: number = 0;
    const fromMap = TRAINING_SPLIT_MAX_DAYS[split as keyof typeof TRAINING_SPLIT_MAX_DAYS];
    if (typeof fromMap === "number") max = fromMap;
    else {
      const matched = TRAINING_SPLITS.find(
        (s) => s === split || s.toLowerCase() === split.toLowerCase()
      );
      if (matched) max = TRAINING_SPLIT_MAX_DAYS[matched];
      else {
        const m = split.match(/^(\d+)-Day/i);
        if (m) max = parseInt(m[1], 10);
      }
    }
    if (max === 0) return;
    setPreferredDays((prev) => {
      const valid = prev.filter((d) =>
        WEEKDAYS.includes(d as (typeof WEEKDAYS)[number])
      );
      if (valid.length <= max) return prev;
      return valid.slice(0, max);
    });
  }, [trainingSplit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");
    setLoading(true);
    try {
      await onSubmit({
        name: sanitizeInput(name, 255),
        email: initialValues.email,
        goal: sanitizeInput(goal, 500),
        experienceLevel: experienceLevel || "",
        age: age.trim(),
        height: height.trim(),
        weight: weight.trim(),
        bodyFat: bodyFat.trim(),
        trainingSplit: trainingSplit || "",
        preferredDays: preferredDays
          .filter((d) => WEEKDAYS.includes(d as (typeof WEEKDAYS)[number]))
          .join(", "),
        units: units || "",
      });
      onSuccess?.();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setLoading(false);
    }
  };

  const displayError = submitError || error;
  const isMetric = units !== "imperial";
  const maxDays = (() => {
    const split = trainingSplit?.trim();
    if (!split) return 0;
    const exact = TRAINING_SPLIT_MAX_DAYS[split as keyof typeof TRAINING_SPLIT_MAX_DAYS];
    if (typeof exact === "number") return exact;
    const matched = TRAINING_SPLITS.find(
      (s) => s === split || s.toLowerCase() === split.toLowerCase()
    );
    if (matched) return TRAINING_SPLIT_MAX_DAYS[matched];
    const match = split.match(/^(\d+)-Day/i);
    return match ? parseInt(match[1], 10) : 0;
  })();

  const inputClass =
    "profile-input w-full rounded-lg border border-border bg-surface px-4 py-3 text-base text-foreground transition-colors placeholder:text-muted-foreground hover:border-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus-visible:ring-2 focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60";
  const inputMutedClass =
    "profile-input w-full rounded-lg border border-border bg-surface-muted px-4 py-3 text-base text-muted-foreground";
  const labelClass = "mb-1.5 block text-sm font-medium text-foreground";

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-6 sm:gap-8"
      aria-label="Edit profile form"
      noValidate
    >
      <fieldset className="profile-section space-y-4 p-4 sm:space-y-5 sm:p-6">
        <legend className="text-base font-semibold leading-tight text-foreground sm:text-lg">
          User Info
        </legend>
        <div className="space-y-4">
          <div>
            <label htmlFor="profile-name" className={labelClass}>
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
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="profile-email" className={labelClass}>
              Email
            </label>
            <input
              id="profile-email"
              type="email"
              value={initialValues.email}
              readOnly
              disabled
              aria-readonly="true"
              className={inputMutedClass}
            />
            <p className="mt-1.5 text-xs text-muted-foreground">
              From your login
            </p>
          </div>
          <div>
            <label htmlFor="profile-goal" className={labelClass}>
              Goal
            </label>
            <input
              id="profile-goal"
              type="text"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              maxLength={500}
              placeholder="e.g. Build muscle, lose weight"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="profile-experience" className={labelClass}>
              Experience Level
            </label>
            <select
              id="profile-experience"
              value={experienceLevel}
              onChange={(e) => setExperienceLevel(e.target.value)}
              aria-label="Select experience level"
              className={inputClass}
            >
              <option value="">Select level</option>
              {EXPERIENCE_LEVELS.map((l) => (
                <option key={l} value={l}>
                  {l.charAt(0).toUpperCase() + l.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </fieldset>

      <fieldset className="profile-section space-y-4 p-4 sm:space-y-5 sm:p-6">
        <legend className="text-base font-semibold leading-tight text-foreground sm:text-lg">
          Body Stats
        </legend>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label htmlFor="profile-height" className={labelClass}>
              Height ({isMetric ? "cm" : "in"})
            </label>
            <input
              id="profile-height"
              type="number"
              min={50}
              max={300}
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              aria-label="Height"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="profile-weight" className={labelClass}>
              Weight ({isMetric ? "kg" : "lbs"})
            </label>
            <input
              id="profile-weight"
              type="number"
              min={20}
              max={500}
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              aria-label="Weight"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="profile-age" className={labelClass}>
              Age
            </label>
            <input
              id="profile-age"
              type="number"
              min={1}
              max={150}
              value={age}
              onChange={(e) => setAge(e.target.value)}
              aria-label="Age"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="profile-bodyfat" className={labelClass}>
              Body Fat %{" "}
              <span className="font-normal text-muted-foreground">
                (optional)
              </span>
            </label>
            <input
              id="profile-bodyfat"
              type="number"
              min={1}
              max={80}
              value={bodyFat}
              onChange={(e) => setBodyFat(e.target.value)}
              aria-label="Body fat percentage"
              className={inputClass}
            />
          </div>
        </div>
      </fieldset>

      <fieldset className="profile-section space-y-4 p-4 sm:space-y-5 sm:p-6">
        <legend className="text-base font-semibold leading-tight text-foreground sm:text-lg">
          Workout Preferences
        </legend>
        <div className="space-y-4 sm:space-y-5">
          <div>
            <label
              htmlFor="profile-training-split"
              className={labelClass}
            >
              Training Split
            </label>
            <select
              id="profile-training-split"
              value={trainingSplit}
              onChange={(e) => setTrainingSplit(e.target.value)}
              aria-label="Select training split"
              className={inputClass}
            >
              <option value="">Select split</option>
              {TRAINING_SPLITS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <fieldset>
              <legend className="mb-2 block text-sm font-medium text-foreground">
                Preferred Days
                {maxDays > 0 && (
                  <span className="ml-2 font-normal text-muted-foreground">
                    (select up to {maxDays})
                  </span>
                )}
              </legend>
              {maxDays === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Select a training split above to choose your preferred days.
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-3">
                  {WEEKDAYS.map((day) => {
                    const validDays = preferredDays.filter((d) =>
                      WEEKDAYS.includes(d as (typeof WEEKDAYS)[number])
                    );
                    const isChecked = validDays.includes(day);
                    const currentCount = validDays.length;
                    const atMax = currentCount >= maxDays;
                    const isDisabled = !isChecked && atMax;
                    return (
                      <label
                        key={day}
                        className={`flex min-h-[2.75rem] cursor-pointer items-center gap-2.5 rounded-lg border border-border bg-surface px-4 py-2.5 transition-all duration-150 has-checked:border-primary has-checked:bg-primary/10 has-checked:shadow-sm ${
                          isDisabled
                            ? "cursor-not-allowed opacity-50"
                            : "hover:border-muted-foreground/50 active:scale-[0.98]"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          disabled={isDisabled}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setPreferredDays((prev) => {
                                const validPrev = prev.filter((d) =>
                                  WEEKDAYS.includes(
                                    d as (typeof WEEKDAYS)[number]
                                  )
                                );
                                const next = [...new Set([...validPrev, day])];
                                if (next.length > maxDays) return prev;
                                return next.sort(
                                  (a, b) =>
                                    WEEKDAYS.indexOf(
                                      a as (typeof WEEKDAYS)[number]
                                    ) -
                                    WEEKDAYS.indexOf(
                                      b as (typeof WEEKDAYS)[number]
                                    )
                                );
                              });
                            } else {
                              setPreferredDays((prev) =>
                                prev.filter((d) => d !== day)
                              );
                            }
                          }}
                          className="h-4 w-4 shrink-0 rounded border-border text-primary focus:ring-2 focus:ring-primary/20 focus:ring-offset-0 disabled:cursor-not-allowed"
                          aria-label={`Select ${day}`}
                        />
                        <span className="text-sm font-medium text-foreground">
                          {day}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
            </fieldset>
          </div>
          <div>
            <label htmlFor="profile-units" className={labelClass}>
              Units
            </label>
            <select
              id="profile-units"
              value={units}
              onChange={(e) => setUnits(e.target.value)}
              aria-label="Select units"
              className={inputClass}
            >
              {UNITS.map((u) => (
                <option key={u} value={u}>
                  {u.charAt(0).toUpperCase() + u.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </fieldset>

      {displayError && (
        <p
          id="profile-error"
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400"
        >
          {displayError}
        </p>
      )}
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-3">
        <button
          type="submit"
          disabled={loading}
          aria-busy={loading}
          aria-disabled={loading}
          className="order-1 min-h-[2.75rem] rounded-lg bg-primary px-5 py-2.5 font-medium text-primary-foreground shadow-sm transition-all duration-150 hover:bg-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background active:bg-primary/95 disabled:opacity-50 sm:order-none"
        >
          {loading ? "Saving…" : "Save profile"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="min-h-[2.75rem] rounded-lg border border-border bg-surface px-5 py-2.5 font-medium text-foreground transition-all duration-150 hover:bg-surface-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background active:bg-surface-muted/80"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
