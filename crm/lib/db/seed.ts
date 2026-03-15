import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { users } from "./schema";
import bcrypt from "bcryptjs";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL is required");
    process.exit(1);
  }

  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME || "Admin";

  if (!email || !password) {
    console.error("ADMIN_EMAIL and ADMIN_PASSWORD are required");
    process.exit(1);
  }

  const client = postgres(url, { max: 1 });
  const db = drizzle(client);

  const passwordHash = await bcrypt.hash(password, 12);

  await db
    .insert(users)
    .values({ email, passwordHash, name })
    .onConflictDoUpdate({
      target: users.email,
      set: { passwordHash, name },
    });

  console.log(`Admin user seeded: ${email}`);
  await client.end();
  process.exit(0);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
