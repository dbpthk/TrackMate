/**
 * Home page date utilities.
 *
 * TIMEZONE: Uses local timezone via getFullYear/getMonth/getDate.
 * On server: uses deployment timezone (often UTC on Vercel).
 * On client: uses browser timezone.
 * Avoid toISOString().slice(0,10) for "today" - it returns UTC date.
 */
import { TRAINING_SPLIT_DETAILS } from "@/drizzle/schema";
import { normalizeProfileSplit } from "@/lib/workout-split-map";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

/** Format date as YYYY-MM-DD in local timezone (avoids UTC shift from toISOString) */
function toLocalDateString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function getTodayWeekday(): (typeof WEEKDAYS)[number] {
  const day = new Date().getDay();
  const map: Record<number, (typeof WEEKDAYS)[number]> = {
    0: "Sun",
    1: "Mon",
    2: "Tue",
    3: "Wed",
    4: "Thu",
    5: "Fri",
    6: "Sat",
  };
  return map[day];
}

export function getTodayDate(): string {
  return toLocalDateString(new Date());
}

export function getWeekStartEnd(): { start: string; end: string } {
  const today = new Date();
  const day = today.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const monday = new Date(today);
  monday.setDate(today.getDate() + mondayOffset);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return {
    start: toLocalDateString(monday),
    end: toLocalDateString(sunday),
  };
}

export function getWeekDates(): { date: string; weekday: (typeof WEEKDAYS)[number] }[] {
  const today = new Date();
  const day = today.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const monday = new Date(today);
  monday.setDate(today.getDate() + mondayOffset);
  const result: { date: string; weekday: (typeof WEEKDAYS)[number] }[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const wd = getWeekdayFromDate(d);
    result.push({
      date: toLocalDateString(d),
      weekday: wd,
    });
  }
  return result;
}

function getWeekdayFromDate(d: Date): (typeof WEEKDAYS)[number] {
  const day = d.getDay();
  const map: Record<number, (typeof WEEKDAYS)[number]> = {
    0: "Sun",
    1: "Mon",
    2: "Tue",
    3: "Wed",
    4: "Thu",
    5: "Fri",
    6: "Sat",
  };
  return map[day];
}

export function getTodaysFocus(
  trainingSplit: string | null,
  preferredDays: string | null
): string | null {
  const upcoming = getUpcomingWorkouts(trainingSplit, preferredDays, 1);
  const todayWd = getWeekdayFromDate(new Date());
  const todaysEntry = upcoming[0];
  if (todaysEntry?.weekday.toLowerCase() === todayWd.toLowerCase()) {
    return todaysEntry.type;
  }
  return null;
}

/** True if user has set up training split and preferred days in profile */
export function hasWorkoutSplitSetup(
  trainingSplit: string | null,
  preferredDays: string | null
): boolean {
  const normalized = normalizeProfileSplit(trainingSplit);
  if (!normalized || !preferredDays || !(normalized in TRAINING_SPLIT_DETAILS)) {
    return false;
  }
  return preferredDays.split(/[,\s]+/).filter(Boolean).length > 0;
}

/** True if today is a rest day (user has setup but today is not a preferred workout day) */
export function isTodayRestDay(
  trainingSplit: string | null,
  preferredDays: string | null
): boolean {
  if (!hasWorkoutSplitSetup(trainingSplit, preferredDays)) return false;
  return getTodaysFocus(trainingSplit, preferredDays) === null;
}

/** All day options for a training split (short names for display/selection) */
export function getDayOptionsForSplit(
  trainingSplit: string | null
): { value: string; label: string }[] {
  const normalized = normalizeProfileSplit(trainingSplit);
  if (!normalized || !(normalized in TRAINING_SPLIT_DETAILS)) {
    return [];
  }
  const details = TRAINING_SPLIT_DETAILS[normalized as keyof typeof TRAINING_SPLIT_DETAILS];
  return details.map((d) => ({
    value: d.replace(/^Day \d+ — /, ""),
    label: d.replace(/^Day \d+ — /, ""),
  }));
}

export function getUpcomingWorkouts(
  trainingSplit: string | null,
  preferredDays: string | null,
  count: number
): { date: string; weekday: string; type: string }[] {
  const normalized = normalizeProfileSplit(trainingSplit);
  if (!normalized || !preferredDays || !(normalized in TRAINING_SPLIT_DETAILS)) {
    return [];
  }
  const details = TRAINING_SPLIT_DETAILS[normalized as keyof typeof TRAINING_SPLIT_DETAILS];
  const days = preferredDays.split(/[,\s]+/).filter(Boolean);
  const today = new Date();
  const result: { date: string; weekday: string; type: string }[] = [];
  let dayIdx = 0;
  const seen = new Set<string>();

  while (result.length < count) {
    const d = new Date(today);
    d.setDate(today.getDate() + dayIdx);
    const dateStr = toLocalDateString(d);
    const wd = getWeekdayFromDate(d);
    const preferredIdx = days.findIndex((x) => x.toLowerCase() === wd.toLowerCase());
    if (preferredIdx >= 0) {
      const type = details[preferredIdx]?.replace(/^Day \d+ — /, "") ?? "Workout";
      if (!seen.has(dateStr)) {
        seen.add(dateStr);
        result.push({
          date: dateStr,
          weekday: wd,
          type,
        });
      }
    }
    dayIdx++;
    if (dayIdx > 30) break;
  }
  return result.slice(0, count);
}

export const MOTIVATIONAL_QUOTES = [
  "Progress > Perfection",
  "Every rep counts",
  "Stay consistent",
  "Trust the process",
  "You're stronger than you think",
  "Small steps, big results",
  "Rest is part of the journey",
  "Fuel your body, fuel your mind",
];
