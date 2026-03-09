import { TRAINING_SPLIT_DETAILS } from "@/drizzle/schema";
import { normalizeProfileSplit } from "@/lib/workout-split-map";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

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
  return new Date().toISOString().slice(0, 10);
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
    start: monday.toISOString().slice(0, 10),
    end: sunday.toISOString().slice(0, 10),
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
      date: d.toISOString().slice(0, 10),
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
  const normalized = normalizeProfileSplit(trainingSplit);
  if (!normalized || !preferredDays || !(normalized in TRAINING_SPLIT_DETAILS)) {
    return null;
  }
  const details = TRAINING_SPLIT_DETAILS[normalized as keyof typeof TRAINING_SPLIT_DETAILS];
  const days = preferredDays.split(/[,\s]+/).filter(Boolean);
  const today = getTodayWeekday();
  const idx = days.findIndex((d) => d.toLowerCase() === today.toLowerCase());
  if (idx < 0) return null;
  const line = details[idx];
  return line ? line.replace(/^Day \d+ — /, "") : null;
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
    const dateStr = d.toISOString().slice(0, 10);
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
