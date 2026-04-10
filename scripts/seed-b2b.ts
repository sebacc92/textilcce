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

  console.log('🗑️ Clearing existing products and categories...');
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
      name: 'Friza',
      slug: 'friza',
      description: 'Telas cálidas, frisas peinadas y cardadas para invierno',
      display_order: 3,
    },
    {
      id: crypto.randomUUID(),
      name: 'Rústico',
      slug: 'rustico',
      description: 'Rústico y Verano, especiales para climas cálidos y confección liviana',
      display_order: 4,
    },
    {
      id: crypto.randomUUID(),
      name: 'Productos Escolares',
      slug: 'productos-escolares',
      description: 'Telas y artículos para uniformes colegiales',
      display_order: 5,
    },
  ];

  console.log('📦 Inserting 5 B2B categories...');
  await db.insert(schema.categories).values(categoriesToInsert);

  const productsToInsert: (typeof schema.products.$inferInsert)[] = [];
  const now = new Date();

  // Helper to find category id
  const getCatId = (slug: string) => categoriesToInsert.find((c) => c.slug === slug)?.id!;

  const productList = [
    // Gabardinas
    { name: 'Gabardina Tecotex 8oz', catSlug: 'gabardinas', desc: 'Resistente y duradera. Especial para ropa de trabajo pesado. Parte de la Línea Mundial (Celeste y Blanca).' },
    { name: 'Gabardina Tecotex 7oz con lycra', catSlug: 'gabardinas', desc: 'Ajuste cómodo con lycra. ¡Oferta imperdible de esta temporada!' },
    { name: 'Gabardina Tecotex 6oz', catSlug: 'gabardinas', desc: 'Más liviana, especial para media estación. Parte de la Línea Mundial (Celeste y Blanca).' },
    { name: 'Gabardina Producción Propia 7oz lycra', catSlug: 'gabardinas', desc: 'Calidad inigualable de nuestra propia tejeduría con elasticidad ideal. ¡Excelente Oferta mayorista!' },
    // Batista
    { name: 'Batista Marca Cladd (65/35)', catSlug: 'batista', desc: 'Mezcla perfecta 65% poliéster y 35% algodón de Marca Cladd. ¡Oportunidad en Oferta permanente!' },
    // Friza
    { name: 'Friza Peinada Premium (50/50)', catSlug: 'friza', desc: 'Calidad superior, no hace peeling (50% algodón / 50% poliéster). Parte de la Línea Mundial (Celeste y Blanca).'},
    { name: 'Friza Cardado (100% algodón)', catSlug: 'friza', desc: 'Friza clásica 100% algodón puro, textura suave. ¡Gran Oferta por volumen!'},
    // Rústico
    { name: 'Jersey 24-1', catSlug: 'rustico', desc: 'Tejido de punto 100% algodón, suave y fresco. Parte de la Línea Mundial (Celeste y Blanca).' },
    { name: 'Lienzo 20/20', catSlug: 'rustico', desc: 'Lienzo rústico versátil para decoración y manualidades. ¡Llevalo en Oferta!' },
    { name: 'Fibranas', catSlug: 'rustico', desc: 'Tela fresca para prendas de verano con caída fluida. ¡Liquidación y Oferta especial!' },
    // Productos Escolares
    { name: 'Acrocel para Pintorcitos', catSlug: 'productos-escolares', desc: 'Tela antimanchas para guardapolvos, con gran resistencia a lavados frecuentes. Parte de la Línea Mundial (Celeste y Blanca).' },
    { name: 'Cuadrillé Escolar', catSlug: 'productos-escolares', desc: 'Clásica tela para uniformes colegiales. ¡Oferta exclusiva para clientes B2B!' },
  ];

  for (const p of productList) {
    productsToInsert.push({
      id: crypto.randomUUID(),
      categoryId: getCatId(p.catSlug),
      name: p.name,
      description: p.desc,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
  }

  console.log(`📦 Inserting ${productsToInsert.length} technical B2B products...`);
  await db.insert(schema.products).values(productsToInsert);

  console.log('✅ B2B Categories and Products seeded successfully.');
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
