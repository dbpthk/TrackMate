/**
 * Add Abs, Core, and Functional Training exercises to exercise_master.
 * Run: npx tsx scripts/add-exercises.ts
 */
import "dotenv/config";
import { eq, and } from "drizzle-orm";
import { db } from "../lib/db";
import { exerciseMaster } from "../drizzle/schema";

const NEW_EXERCISES: { name: string; muscleGroup: string }[] = [
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

async function add() {
  console.log("Adding exercises to exercise_master...");
  let added = 0;
  for (const ex of NEW_EXERCISES) {
    const [existing] = await db
      .select()
      .from(exerciseMaster)
      .where(
        and(
          eq(exerciseMaster.name, ex.name),
          eq(exerciseMaster.muscleGroup, ex.muscleGroup)
        )
      )
      .limit(1);
    if (existing) {
      console.log(`  - ${ex.name} (${ex.muscleGroup}) - exists`);
      continue;
    }
    await db.insert(exerciseMaster).values({
      name: ex.name,
      muscleGroup: ex.muscleGroup,
      equipment: null,
    });
    added++;
    console.log(`  + ${ex.name} (${ex.muscleGroup})`);
  }
  console.log(`Added ${added} new exercises.`);
}

add().catch(console.error).finally(() => process.exit(0));
