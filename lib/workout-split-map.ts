import { TRAINING_SPLIT_DETAILS } from "@/drizzle/schema";

/** Map profile training split to workout_splits split_type */
export const PROFILE_SPLIT_TO_TYPE: Record<string, string> = {
  "3-Day Split (Push/Pull/Legs)": "push_pull_legs",
  "4-Day Split": "bro_split",
  "5-Day Split": "bro_split",
  "6-Day Split": "bro_split",
};

export function getDayNamesFromProfileSplit(profileSplit: string | null): string[] {
  if (!profileSplit || !(profileSplit in TRAINING_SPLIT_DETAILS)) {
    return ["Day 1", "Day 2", "Day 3"];
  }
  const details =
    TRAINING_SPLIT_DETAILS[profileSplit as keyof typeof TRAINING_SPLIT_DETAILS];
  return details.map((d) => d.replace(/^Day \d+ — /, ""));
}

export function getSplitTypeFromProfile(profileSplit: string | null): string {
  if (!profileSplit) return "push_pull_legs";
  return PROFILE_SPLIT_TO_TYPE[profileSplit] ?? "push_pull_legs";
}
