import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from '../src/db/schema';
import * as bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
import path from 'path';

// Load .env then .env.local to ensure TURSO vars are present
dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function seedUsers() {
  const url = process.env.TURSO_DATABASE_URL || process.env.PRIVATE_TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN || process.env.PRIVATE_TURSO_AUTH_TOKEN;

  if (!url) {
    throw new Error('Missing TURSO_DATABASE_URL or PRIVATE_TURSO_DATABASE_URL in environment');
  }

  console.log('Connecting to Turso...');
  const client = createClient({ url, authToken });
  const db = drizzle(client, { schema });

  const newUsers = [
    { username: 'seba', password: 'seba_password_2026' },
    { username: 'diego', password: 'diego_password_2026' },
  ];

  for (const user of newUsers) {
    console.log(`Hashing password for ${user.username}...`);
    const password_hash = await bcrypt.hash(user.password, 10);

    console.log(`Inserting ${user.username}...`);
    await db.insert(schema.users).values({
      id: crypto.randomUUID(),
      username: user.username,
      password_hash,
    });
    console.log(`Created user: ${user.username} with password: ${user.password}`);
  }

  console.log('Finished successfully.');
  process.exit(0);
}

seedUsers().catch((err) => {
  console.error(err);
  process.exit(1);
});
