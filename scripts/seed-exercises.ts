/**
 * Seed the exercise_master table with the standard exercise list.
 * Skips exercises that already exist (same name + muscleGroup).
 * Run: npx tsx scripts/seed-exercises.ts
 */
import "dotenv/config";
import { eq, and } from "drizzle-orm";
import { db } from "../lib/db";
import { exerciseMaster } from "../drizzle/schema";

const EXERCISES: { name: string; muscleGroup: string; equipment?: string }[] = [
  // CHEST
  { name: "Barbell Bench Press", muscleGroup: "chest" },
  { name: "Incline Dumbbell Press", muscleGroup: "chest" },
  { name: "Decline Dumbbell Press", muscleGroup: "chest" },
  { name: "Chest Dips", muscleGroup: "chest" },
  { name: "Cable Fly", muscleGroup: "chest" },
  { name: "Decline Cable Fly", muscleGroup: "chest" },
  { name: "Pec Deck", muscleGroup: "chest" },
  { name: "Machine Chest Press", muscleGroup: "chest" },
  { name: "Incline Cable Fly", muscleGroup: "chest" },
  { name: "Push-ups", muscleGroup: "chest" },
  // TRICEPS
  { name: "Close Grip Bench Press", muscleGroup: "triceps" },
  { name: "Skull Crushers", muscleGroup: "triceps" },
  { name: "Rope Pushdown", muscleGroup: "triceps" },
  { name: "Overhead Cable Triceps Extension", muscleGroup: "triceps" },
  { name: "Dumbbell Overhead Triceps Extension", muscleGroup: "triceps" },
  { name: "Triceps Dips", muscleGroup: "triceps" },
  { name: "Cable Kickbacks", muscleGroup: "triceps" },
  { name: "EZ Bar Skull Crushers", muscleGroup: "triceps" },
  { name: "Reverse Grip Pushdown", muscleGroup: "triceps" },
  { name: "Diamond Push-ups", muscleGroup: "triceps" },
  // BACK
  { name: "Pull-ups", muscleGroup: "back" },
  { name: "Lat Pulldown", muscleGroup: "back" },
  { name: "Bent Over Row", muscleGroup: "back" },
  { name: "Single Arm Dumbbell Row", muscleGroup: "back" },
  { name: "Seated Cable Row", muscleGroup: "back" },
  { name: "T-Bar Row", muscleGroup: "back" },
  { name: "Straight Arm Pulldown", muscleGroup: "back" },
  { name: "Face Pull", muscleGroup: "back" },
  { name: "Rack Pull", muscleGroup: "back" },
  { name: "Chest Supported Row", muscleGroup: "back" },
  // BICEPS
  { name: "Barbell Curl", muscleGroup: "biceps" },
  { name: "EZ Bar Curl", muscleGroup: "biceps" },
  { name: "Incline Dumbbell Curl", muscleGroup: "biceps" },
  { name: "Preacher Curl", muscleGroup: "biceps" },
  { name: "Hammer Curl", muscleGroup: "biceps" },
  { name: "Cable Curl", muscleGroup: "biceps" },
  { name: "Spider Curl", muscleGroup: "biceps" },
  { name: "Concentration Curl", muscleGroup: "biceps" },
  { name: "Reverse Curl", muscleGroup: "biceps" },
  { name: "Cable Bicep Curl", muscleGroup: "biceps" },
  // SHOULDERS
  { name: "Seated Dumbbell Shoulder Press", muscleGroup: "shoulders" },
  { name: "Barbell Overhead Press", muscleGroup: "shoulders" },
  { name: "Arnold Press", muscleGroup: "shoulders" },
  { name: "Dumbbell Lateral Raise", muscleGroup: "shoulders" },
  { name: "Cable Lateral Raise", muscleGroup: "shoulders" },
  { name: "Rear Delt Fly", muscleGroup: "shoulders" },
  { name: "Face Pull", muscleGroup: "shoulders" },
  { name: "Machine Shoulder Press", muscleGroup: "shoulders" },
  { name: "Front Raise", muscleGroup: "shoulders" },
  { name: "Upright Row", muscleGroup: "shoulders" },
  // LEGS
  { name: "Barbell Squat", muscleGroup: "legs" },
  { name: "Romanian Deadlift", muscleGroup: "legs" },
  { name: "Leg Press", muscleGroup: "legs" },
  { name: "Leg Extension", muscleGroup: "legs" },
  { name: "Leg Curl", muscleGroup: "legs" },
  { name: "Walking Lunges", muscleGroup: "legs" },
  { name: "Bulgarian Split Squat", muscleGroup: "legs" },
  { name: "Hack Squat", muscleGroup: "legs" },
  { name: "Glute Bridge", muscleGroup: "legs" },
  { name: "Standing Calf Raise", muscleGroup: "legs" },
  // ABS (6)
  { name: "Hanging Leg Raise", muscleGroup: "abs" },
  { name: "Reverse Crunch", muscleGroup: "abs" },
  { name: "Decline Sit-up", muscleGroup: "abs" },
  { name: "Cable Crunch", muscleGroup: "abs" },
  { name: "Bicycle Crunch", muscleGroup: "abs" },
  { name: "Flutter Kicks", muscleGroup: "abs" },
  // CORE (6)
  { name: "Plank", muscleGroup: "core" },
  { name: "Ab Rollout", muscleGroup: "core" },
  { name: "Dead Bug", muscleGroup: "core" },
  { name: "Russian Twist", muscleGroup: "core" },
  { name: "Cable Woodchop", muscleGroup: "core" },
  { name: "Side Plank", muscleGroup: "core" },
  // FUNCTIONAL (6)
  { name: "Kettlebell Swing", muscleGroup: "functional" },
  { name: "Farmer's Carry", muscleGroup: "functional" },
  { name: "Box Jump", muscleGroup: "functional" },
  { name: "Battle Rope Slams", muscleGroup: "functional" },
  { name: "Medicine Ball Slam", muscleGroup: "functional" },
  { name: "Sled Push", muscleGroup: "functional" },
];

async function seed() {
  console.log("Seeding exercise_master...");
  let added = 0;
  for (const e of EXERCISES) {
    const [existing] = await db
      .select()
      .from(exerciseMaster)
      .where(
        and(
          eq(exerciseMaster.name, e.name),
          eq(exerciseMaster.muscleGroup, e.muscleGroup)
        )
      )
      .limit(1);
    if (existing) continue;
    await db.insert(exerciseMaster).values({
      name: e.name,
      muscleGroup: e.muscleGroup,
      equipment: e.equipment ?? null,
    });
    added++;
  }
  console.log(`Inserted ${added} new exercises (${EXERCISES.length - added} already existed).`);
}

seed().catch(console.error).finally(() => process.exit(0));
