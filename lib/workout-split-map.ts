import { TRAINING_SPLIT_DETAILS } from "@/drizzle/schema";

/** Normalize legacy profile values to current TRAINING_SPLITS */
const LEGACY_SPLIT_MAP: Record<string, string> = {
  "3-Day Split (Push/Pull/Legs)": "3-Day Split",
};

export function normalizeProfileSplit(profileSplit: string | null): string | null {
  if (!profileSplit) return null;
  return LEGACY_SPLIT_MAP[profileSplit] ?? profileSplit;
}

/** Map profile training split to workout_splits split_type */
export const PROFILE_SPLIT_TO_TYPE: Record<string, string> = {
  "3-Day Split": "bro_split",
  "4-Day Split": "bro_split",
  "5-Day Split": "bro_split",
  "6-Day Split": "bro_split",
};

export function getDayNamesFromProfileSplit(profileSplit: string | null): string[] {
  const normalized = normalizeProfileSplit(profileSplit);
  if (!normalized || !(normalized in TRAINING_SPLIT_DETAILS)) {
    return ["Day 1", "Day 2", "Day 3"];
  }
  const details =
    TRAINING_SPLIT_DETAILS[normalized as keyof typeof TRAINING_SPLIT_DETAILS];
  return details.map((d) => d.replace(/^Day \d+ — /, ""));
}

export function getSplitTypeFromProfile(profileSplit: string | null): string {
  const normalized = normalizeProfileSplit(profileSplit);
  if (!normalized) return "bro_split";
  return PROFILE_SPLIT_TO_TYPE[normalized] ?? "bro_split";
}
