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
      name: 'Telas de Moda',
      slug: 'telas-de-moda',
      description: 'Telas pensadas para colecciones actuales.',
      display_order: 1,
    },
    {
      id: crypto.randomUUID(),
      name: 'Telas para Confección',
      slug: 'telas-para-confeccion',
      description: 'Materiales ideales para talleres y fábricas.',
      display_order: 2,
    },
    {
      id: crypto.randomUUID(),
      name: 'Telas para Moda Urbana',
      slug: 'moda-urbana',
      description: 'Opciones para ropa casual y streetwear.',
      display_order: 3,
    },
    {
      id: crypto.randomUUID(),
      name: 'Colores de Temporada',
      slug: 'colores-de-temporada',
      description: 'Variedad de colores para tendencias de cada estación.',
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
