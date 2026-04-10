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
      categoryId: getCatId('gabardinas'),
      name: 'Gabardina con Lycra CCE',
      fabricante: 'CCE',
      colores: [
        'Amarillo', 'Azul Marino', 'Beige', 'Blanco', 'Bordo', 'Camel', 'Chocolate',
        'Celeste', 'Coral', 'Fucsia', 'Glade', 'Gris Topo', 'Human', 'Kaki',
        'Mostaza', 'Negro', 'Rojo', 'Rosa', 'Rosa Bebe', 'Terracota',
        'Topo Closs Según Muestra', 'Verde Agua', 'Verde Militar', 'Verde Cemento',
        'Camuflado Verde Militar', 'Camuflado Gris AP 3116', 'Leopardo'
      ],
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: crypto.randomUUID(),
      categoryId: getCatId('gabardinas'),
      name: 'Gabardina con Lycra Tecotex',
      fabricante: 'Tecotex',
      colores: [
        'Azul Marino', 'Beige Nuevo', 'Beige (viejo)', 'Bordo', 'Camel', 'Gris Topo',
        'Human', 'Kaki', 'Mostaza', 'Negro', 'Tostados', 'Verde Militar'
      ],
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: crypto.randomUUID(),
      categoryId: getCatId('gabardinas'),
      name: 'Gabardina 6OZ',
      oz: '6',
      colores: [
        'Azul Marino', 'Beige', 'Blanco', 'Bordo', 'Camel', 'Chocolate', 'Celeste',
        'Coral', 'Francia', 'Fucsia', 'Gris Topo', 'Gris Topo Nuevo', 'Human',
        'Kaki', 'Lila', 'Mostaza', 'Negro', 'Rojo', 'Rosa BB', 'Rosas', 'Rosa',
        'Verde Agua', 'Verde Ingles', 'Verde Militar'
      ],
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: crypto.randomUUID(),
      categoryId: getCatId('gabardinas'),
      name: 'Gabardina 8OZ',
      oz: '8',
      colores: [
        'Azul Marino', 'Beige', 'Beige Nuevo RP', 'Blanco', 'Bordo', 'Camel',
        'Francia', 'Topo', 'Human', 'Kaki', 'Negro', 'Negro C/Apresto', 'Rojo',
        'Verde Ingles', 'Verde Claro RP', 'Verde Militar'
      ],
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: crypto.randomUUID(),
      categoryId: getCatId('frisa'),
      name: 'Frisa Algodón',
      colores: [
        'Azul Marino (3471)', 'Azulino Jaspeado (4514)', 'Beige Rose Dust (8085)',
        'Beige Tartagal (10605)', 'Blanco (3010)', 'Bordo Brote (2659)',
        'Bordo Jaspeado (3355)', 'Bright Green (7740)', 'Celeste Chaten (10622)',
        'Chcolate Bom Bom (9196)', 'Chicle Jock (2254)', 'Chicle Viejo (2408)',
        'Francia (3491)', 'Francia Jaspeado (6533)', 'Fucsia (4282)', 'Geraneo (4171)',
        'Glazed Ginger O (7792)', 'Lila Magico (9691)', 'Melange (1829)',
        'Melange 25% (6483)', 'Melon (2839)', 'Natural (3170)', 'Negro (3310)',
        'Negro Jaspeado (4310)', 'Petroleo (3425)', 'Provincial Blueo (7842)',
        'Rojo (3060)', 'Rosa Penitente (10612)', 'Rosa Pozuelo (10614)',
        'Rosa Sofia (2263)', 'Topo Liso (4749)', 'Verde Aruba (4175)',
        'Verde Botella (3914)', 'Verde Cemento Tingasta (10639)', 'Verde Tanque (2265)',
        'Verde Tanque Jasp. (4897)', 'Viola (6712)', 'Violeta Lara (2883)'
      ],
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: crypto.randomUUID(),
      categoryId: getCatId('frisa'),
      name: 'Frisa Peinada',
      colores: [
        'Azul Marino (3471)', 'Azulino Jaspeado (4514)', 'Beige Rose Dust (8085)',
        'Beige Tartagal (10605)', 'Blanco (3010)', 'Bordo Brote (2659)',
        'Bordo Jaspeado (3355)', 'Bright Green (7740)', 'Celeste Chaten (10622)',
        'Chcolate Bom Bom (9196)', 'Chicle Jock (2254)', 'Chicle Viejo (2408)',
        'Francia (3491)', 'Francia Jaspeado (6533)', 'Fucsia (4282)', 'Geraneo (4171)',
        'Glazed Ginger O (7792)', 'Lila Magico (9691)', 'Melange (1644)',
        'Melange 25% (5498)', 'Melon (2839)', 'Natural (3170)', 'Negro (3310)',
        'Negro Jaspeado (4310)', 'Petroleo (3425)', 'Provincial Blue O (7842)',
        'Rojo (3060)', 'Rosa Penitente (10612)', 'Rosa Pozuelo (10614)',
        'Rosa Sofia (2263)', 'Topo Liso (4749)', 'Verde Aruba (4175)',
        'Verde Botella (3914)', 'Verde Cemento Tingasta (10639)', 'Verde Tanque (2265)',
        'Verde Tanque Jasp. (4897)', 'Viola (6712)', 'Violeta Lara (2883)'
      ],
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: crypto.randomUUID(),
      categoryId: getCatId('batista'),
      name: 'Batista',
      colores: [
        'Azul Marino', 'Blanco', 'Negro', 'Bordo', 'Verde botella', 'Chocolate',
        'Francia', 'Gris Topo', 'Rojo'
      ],
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
