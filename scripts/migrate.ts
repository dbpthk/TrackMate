import "dotenv/config";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { db } from "../lib/db";

async function run() {
  await migrate(db, {
    migrationsFolder: "./drizzle/migrations",
  });
  console.log("Migrations complete");
  process.exit(0);
}

run().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
