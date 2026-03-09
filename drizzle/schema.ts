import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  date,
  jsonb,
  primaryKey,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const EXPERIENCE_LEVELS = [
  "beginner",
  "novice",
  "intermediate",
  "advanced",
] as const;

export const TRAINING_SPLITS = [
  "3-Day Split (Push/Pull/Legs)",
  "4-Day Split",
  "5-Day Split",
  "6-Day Split",
] as const;

/** Day breakdown for each training split, shown when user selects a split */
export const TRAINING_SPLIT_DETAILS: Record<
  (typeof TRAINING_SPLITS)[number],
  string[]
> = {
  "3-Day Split (Push/Pull/Legs)": [
    "Day 1 — Push",
    "Day 2 — Pull",
    "Day 3 — Legs",
  ],
  "4-Day Split": [
    "Day 1 — Chest + Triceps",
    "Day 2 — Back + Biceps",
    "Day 3 — Shoulders + Legs",
    "Day 4 — Abs + General Fitness",
  ],
  "5-Day Split": [
    "Day 1 — Chest + Triceps",
    "Day 2 — Back + Biceps",
    "Day 3 — Shoulders + Legs",
    "Day 4 — Chest + Triceps + Abs",
    "Day 5 — Back + Biceps + Shoulders",
  ],
  "6-Day Split": [
    "Day 1 — Chest + Triceps",
    "Day 2 — Back + Biceps",
    "Day 3 — Shoulders + Legs",
    "Day 4 — Chest + Triceps + Abs",
    "Day 5 — Back + Biceps + Shoulders",
    "Day 6 — Abs + General Fitness",
  ],
};

/** Max selectable days per training split - explicit mapping */
export const TRAINING_SPLIT_MAX_DAYS: Record<
  (typeof TRAINING_SPLITS)[number],
  number
> = {
  "3-Day Split (Push/Pull/Legs)": 3,
  "4-Day Split": 4,
  "5-Day Split": 5,
  "6-Day Split": 6,
};

export const WEEKDAYS = [
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
  "Sun",
] as const;

export const UNITS = ["metric", "imperial"] as const;

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  goal: text("goal"),
  experienceLevel: varchar("experience_level", { length: 50 }),
  age: integer("age"),
  height: integer("height"),
  weight: integer("weight"),
  bodyFat: integer("body_fat"),
  trainingSplit: varchar("training_split", { length: 100 }),
  preferredDays: varchar("preferred_days", { length: 255 }),
  units: varchar("units", { length: 20 }),
  stats: jsonb("stats").$type<Record<string, unknown>>(),
});

export const workouts = pgTable("workouts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  date: date("date").notNull(),
  type: varchar("type", { length: 100 }).notNull(),
});

export const exercises = pgTable("exercises", {
  id: serial("id").primaryKey(),
  workoutId: integer("workout_id")
    .notNull()
    .references(() => workouts.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  sets: integer("sets"),
  reps: integer("reps"),
  weight: integer("weight"),
  duration: integer("duration"),
});

export const buddies = pgTable(
  "buddies",
  {
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    buddyId: integer("buddy_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.userId, t.buddyId] })]
);

export const usersRelations = relations(users, ({ many }) => ({
  workouts: many(workouts),
  buddies: many(buddies),
}));

export const workoutsRelations = relations(workouts, ({ one, many }) => ({
  user: one(users),
  exercises: many(exercises),
}));

export const exercisesRelations = relations(exercises, ({ one }) => ({
  workout: one(workouts),
}));

export type User = typeof users.$inferSelect;
export type Workout = typeof workouts.$inferSelect;
export type Exercise = typeof exercises.$inferSelect;
export type Buddy = typeof buddies.$inferSelect;
