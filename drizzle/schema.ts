import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  date,
  jsonb,
  primaryKey,
  uuid,
  timestamp,
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

// --- Workout template / split structure (master exercises, splits, days) ---

export const MUSCLE_GROUPS = [
  "chest",
  "triceps",
  "back",
  "biceps",
  "shoulders",
  "legs",
  "abs",
  "core",
  "functional",
] as const;

/** Recommended muscle groups per day (Day 1–6) */
export const RECOMMENDED_SPLIT_MUSCLE_GROUPS: string[][] = [
  ["chest", "triceps"],
  ["back", "biceps"],
  ["legs", "shoulders"],
  ["chest", "triceps", "abs"],
  ["back", "biceps", "shoulders"],
  ["functional", "core"],
];

export const SPLIT_TYPES = [
  "push_pull_legs",
  "bro_split",
  "upper_lower",
  "full_body",
] as const;

export const exerciseMaster = pgTable("exercise_master", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  muscleGroup: text("muscle_group").notNull(),
  equipment: text("equipment"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const workoutSplits = pgTable("workout_splits", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  splitType: text("split_type").notNull(),
});

export const workoutDays = pgTable("workout_days", {
  id: uuid("id").primaryKey().defaultRandom(),
  splitId: uuid("split_id")
    .notNull()
    .references(() => workoutSplits.id, { onDelete: "cascade" }),
  dayName: text("day_name").notNull(),
  dayOrder: integer("day_order").notNull().default(0),
  muscleGroups: jsonb("muscle_groups").$type<string[]>(),
});

export const workoutDayExercises = pgTable("workout_day_exercises", {
  id: uuid("id").primaryKey().defaultRandom(),
  workoutDayId: uuid("workout_day_id")
    .notNull()
    .references(() => workoutDays.id, { onDelete: "cascade" }),
  exerciseId: uuid("exercise_id")
    .notNull()
    .references(() => exerciseMaster.id, { onDelete: "cascade" }),
  sets: integer("sets"),
  reps: text("reps"),
  order: integer("order").notNull().default(0),
});

export const usersRelations = relations(users, ({ many }) => ({
  workouts: many(workouts),
  buddies: many(buddies),
  workoutSplits: many(workoutSplits),
}));

export const workoutsRelations = relations(workouts, ({ one, many }) => ({
  user: one(users),
  exercises: many(exercises),
}));

export const exercisesRelations = relations(exercises, ({ one }) => ({
  workout: one(workouts),
}));

export const exerciseMasterRelations = relations(exerciseMaster, ({ many }) => ({
  workoutDayExercises: many(workoutDayExercises),
}));

export const workoutSplitsRelations = relations(workoutSplits, ({ one, many }) => ({
  user: one(users),
  workoutDays: many(workoutDays),
}));

export const workoutDaysRelations = relations(workoutDays, ({ one, many }) => ({
  split: one(workoutSplits),
  workoutDayExercises: many(workoutDayExercises),
}));

export const workoutDayExercisesRelations = relations(workoutDayExercises, ({ one }) => ({
  workoutDay: one(workoutDays),
  exercise: one(exerciseMaster),
}));

export type User = typeof users.$inferSelect;
export type Workout = typeof workouts.$inferSelect;
export type Exercise = typeof exercises.$inferSelect;
export type Buddy = typeof buddies.$inferSelect;
export type ExerciseMaster = typeof exerciseMaster.$inferSelect;
export type WorkoutSplit = typeof workoutSplits.$inferSelect;
export type WorkoutDay = typeof workoutDays.$inferSelect;
export type WorkoutDayExercise = typeof workoutDayExercises.$inferSelect;
