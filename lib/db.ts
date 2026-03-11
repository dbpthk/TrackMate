import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

let connectionString = process.env.DATABASE_URL;
if (connectionString && /[?&]sslmode=(prefer|require|verify-ca)(&|$)/.test(connectionString)) {
  connectionString = connectionString.replace(
    /([?&])sslmode=(prefer|require|verify-ca)(&|$)/,
    "$1sslmode=verify-full$3"
  );
}

const pool = new Pool({
  connectionString,
});

export const db = drizzle(pool);
