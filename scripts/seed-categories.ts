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

  const categoriesToInsert = [
    {
      id: crypto.randomUUID(),
      name: 'Gabardinas y Rígidos',
      slug: 'gabardinas',
      description: 'Especialistas en Gabardinas con Lycra, 8oz y 6oz en colores clásicos.',
      display_order: 1,
    },
    {
      id: crypto.randomUUID(),
      name: 'Telas para Camisería',
      slug: 'camiseria',
      description: 'Amplia variedad en Batista y telas ligeras de alta calidad.',
      display_order: 2,
    },
    {
      id: crypto.randomUUID(),
      name: 'Punto y Algodón',
      slug: 'punto-y-algodon',
      description: 'Frisa peinada y algodón para confección de indumentaria cómoda.',
      display_order: 3,
    },
    {
      id: crypto.randomUUID(),
      name: 'Telas Estampadas (Temporada)',
      slug: 'telas-estampadas',
      description: 'Gabardinas estampadas e ingresos con colores de moda.',
      display_order: 4,
    },
  ];

  console.log('📦 Inserting 4 categories...');
  await db.insert(schema.categories).values(categoriesToInsert);

  console.log('✅ Categories seeded successfully:');
  categoriesToInsert.forEach((c) => {
    console.log(`   - ${c.name} (${c.slug})`);
  });

  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
