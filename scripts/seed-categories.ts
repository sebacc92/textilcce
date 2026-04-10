import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { config } from 'dotenv';
import * as schema from '../src/db/schema';

config({ path: '.env.local' });

async function seed() {
  const url = process.env.PRIVATE_TURSO_DATABASE_URL;
  const authToken = process.env.PRIVATE_TURSO_AUTH_TOKEN;

  if (!url) {
    throw new Error('Missing PRIVATE_TURSO_DATABASE_URL in .env.local');
  }

  console.log('🔌 Connecting to Turso...');
  const client = createClient({ url, authToken });
  const db = drizzle(client, { schema });

  console.log('🗑️ Clearing existing categories and products...');
  await db.delete(schema.products);
  await db.delete(schema.categories);

  const categoriesToInsert = [
    {
      id: crypto.randomUUID(),
      name: 'Gabardinas',
      slug: 'gabardinas',
      description: 'Variedad de Gabardinas en diferentes onzas y calidades',
      display_order: 1,
    },
    {
      id: crypto.randomUUID(),
      name: 'Batista',
      slug: 'batista',
      description: 'Telas Batista ideales para camisería y forrería',
      display_order: 2,
    },
    {
      id: crypto.randomUUID(),
      name: 'Frisa',
      slug: 'frisa',
      description: 'Telas cálidas, frisas peinadas y cardadas para invierno',
      display_order: 3,
    },
    {
      id: crypto.randomUUID(),
      name: 'Rústico',
      slug: 'rustico',
      description: 'Rústico y Verano, especiales para climas cálidos y confección liviana',
      display_order: 4,
    }
  ];

  console.log('📦 Inserting 4 B2B categories...');
  await db.insert(schema.categories).values(categoriesToInsert);

  console.log('✅ Categories seeded successfully.');
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
