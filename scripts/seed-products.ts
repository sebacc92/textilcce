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

  const categories = await db.select().from(schema.categories);
  const getCatId = (slug: string) => {
    const cat = categories.find((c) => c.slug === slug);
    if (!cat) throw new Error(`Category ${slug} not found`);
    return cat.id;
  };

  const now = new Date();
  
  const productsToInsert = [
    {
      id: crypto.randomUUID(),
      categoryId: getCatId('batista'),
      name: 'Batista',
      fabricante: 'Cladd',
      composicion: '65% Algodón 35% poliéster',
      ancho: '1,50MTS',
      season: 'Atemporal',
      colores: ["Blanco Optico", "Beige", "Celeste Cielo", "Francia", "Negro", "Rosa Bebe"],
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: crypto.randomUUID(),
      categoryId: getCatId('gabardinas'),
      name: 'Gabardina con Lycra Lisa',
      fabricante: 'CCE',
      oz: '7',
      composicion: '97% Algodón 3% Elastano',
      ancho: '1,55 MTS',
      colores: ["Azul Marino", "Beige", "Blanco", "Negro", "Gris Topo", "Verde Militar"],
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: crypto.randomUUID(),
      categoryId: getCatId('gabardinas'),
      name: 'Gabardina Lisa 8 Oz',
      fabricante: 'Tecotex',
      oz: '8',
      composicion: '100% Algodón',
      ancho: '1,6 MTS',
      colores: ["Celeste", "Blanco"],
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: crypto.randomUUID(),
      categoryId: getCatId('friza'),
      name: 'Friza Peinada Premium 50/50',
      season: 'Invierno',
      colores: ["Azul Marino", "Gris Melange", "Negro", "Bordo", "Francia"],
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: crypto.randomUUID(),
      categoryId: getCatId('rustico'),
      name: 'Fibrana Estampada Rayon',
      fabricante: 'Importada',
      composicion: '100% Rayon',
      ancho: '1,55MTS',
      season: 'Verano',
      colores: ["Surtido Estampado"],
      isOffer: true,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: crypto.randomUUID(),
      categoryId: getCatId('escolares'),
      name: 'Guardapolvo Importado',
      fabricante: 'Cladd',
      composicion: '65/35',
      ancho: '1,6 MTS',
      colores: [],
      isActive: true,
      createdAt: now,
      updatedAt: now,
    }
  ];

  console.log('🗑️ Clearing existing products...');
  await db.delete(schema.products);

  console.log(`📦 Inserting ${productsToInsert.length} B2B products...`);
  await db.insert(schema.products).values(productsToInsert);

  console.log('✅ Products seeded successfully.');
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
