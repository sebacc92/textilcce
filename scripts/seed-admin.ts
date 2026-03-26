import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from '../src/db/schema';
import * as bcrypt from 'bcryptjs';

async function seed() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url) {
    throw new Error('Missing TURSO_DATABASE_URL in environment');
  }

  console.log('Connecting to Turso...');
  const client = createClient({ url, authToken });
  const db = drizzle(client, { schema });

  console.log('Hashing password...');
  const password_hash = await bcrypt.hash('password', 10);

  console.log('Inserting admin user...');
  await db.insert(schema.users).values({
    id: crypto.randomUUID(),
    username: 'admin',
    password_hash,
  });

  console.log('Admin user "admin" created successfully with password "password"');
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
