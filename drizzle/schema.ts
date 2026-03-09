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

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  goal: text("goal"),
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
