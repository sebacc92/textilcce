import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { eq } from 'drizzle-orm';
import { config } from 'dotenv';
import * as schema from '../src/db/schema';
import crypto from 'crypto';

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

  console.log('⚙️  Updating existing site settings with new columns...');
  try {
    const existing = await db.select().from(schema.siteSettings).where(eq(schema.siteSettings.id, '1'));
    if (existing.length > 0) {
      await db.update(schema.siteSettings).set({
        aboutP1: 'Textil CCE es un mayorista de telas para indumentaria ubicado en Once, Buenos Aires. Desde hace más de 20 años abastecemos a marcas de ropa, talleres de confección, confeccionistas y emprendedores de todo el país con telas de calidad a precios competitivos. Nos especializamos en abastecer a la industria con materiales de alto rendimiento: Gabardinas con Lycra, Batistas para camisería, Frisa peinada y Algodón. Trabajamos un stock permanente de colores clásicos, incorporando opciones de moda para cada temporada.',
        aboutP2: 'Nuestro local, ubicado en Azcuénaga 650, se encuentra en uno de los centros textiles más importantes de Argentina, donde ofrecemos una amplia variedad de telas mayoristas. Trabajamos con reposición permanente de stock para que nuestros clientes puedan producir sin interrupciones.',
        commitmentText: 'Nuestro compromiso es ofrecer telas de calidad, variedad de colores y disponibilidad permanente para acompañar el crecimiento de nuestros clientes.',
        statsYears: '20+',
        statsCoverage: 'TODO',
      }).where(eq(schema.siteSettings.id, '1'));
    }
  } catch (error) {
    console.log('Skipping settings update for now, might need SQL migration first:', error);
  }

  console.log('🧹 Clearing old lists...');
  try {
    await db.delete(schema.siteContentLists);
  } catch (error) {
     console.log('Table siteContentLists might not exist yet:', error);
     return process.exit(1);
  }

  const listsData = [
    // Home Features
    { id: crypto.randomUUID(), type: 'home_feature', title: 'Más de 20 años en el mercado', description: 'Trayectoria comprobada y experiencia abasteciendo al rubro textil en Once.', icon: 'shield', displayOrder: 1 },
    { id: crypto.randomUUID(), type: 'home_feature', title: 'Ventas Mayoristas', description: 'Condiciones ideales y precios competitivos para marcas, talleres y emprendedores.', icon: 'package-check', displayOrder: 2 },
    { id: crypto.randomUUID(), type: 'home_feature', title: 'Amplio Surtido', description: 'Gran variedad de telas para indumentaria con reposición constante.', icon: 'layers', displayOrder: 3 },
    { id: crypto.randomUUID(), type: 'home_feature', title: 'Stock Permanente', description: 'Disponibilidad continua de colores clásicos para producción ininterrumpida.', icon: 'archive', displayOrder: 4 },
    { id: crypto.randomUUID(), type: 'home_feature', title: 'Excelente Relación Precio-Calidad', description: 'Materiales confiables que optimizan la rentabilidad de tu producción.', icon: 'piggy-bank', displayOrder: 5 },
    { id: crypto.randomUUID(), type: 'home_feature', title: 'Envíos a todo el país', description: 'Despachamos mercadería a toda Argentina de forma rápida y segura.', icon: 'truck', displayOrder: 6 },
    
    // B2B Benefits
    { id: crypto.randomUUID(), type: 'b2b_benefit', title: 'Precios mayoristas competitivos', description: 'Pensados para maximizar la rentabilidad y el margen de tu negocio.', icon: 'check', displayOrder: 1 },
    { id: crypto.randomUUID(), type: 'b2b_benefit', title: 'Amplio stock disponible', description: 'Evitá quiebres de stock en medio de tu temporada. Contamos con depósitos propios.', icon: 'check', displayOrder: 2 },
    { id: crypto.randomUUID(), type: 'b2b_benefit', title: 'Variedad de telas y colores', description: 'Opciones actualizadas que siguen las últimas tendencias de cada temporada.', icon: 'check', displayOrder: 3 },
    { id: crypto.randomUUID(), type: 'b2b_benefit', title: 'Atención personalizada', description: 'Te asesoramos para elegir los rendimientos y texturas adecuadas para tu moldería.', icon: 'check', displayOrder: 4 },
    { id: crypto.randomUUID(), type: 'b2b_benefit', title: 'Envíos a todo el país', description: 'Logística asegurada para que tu mercadería llegue en tiempo y forma a cualquier provincia.', icon: 'check', displayOrder: 5 },

    // B2B Clients
    { id: crypto.randomUUID(), type: 'b2b_client', title: 'Fábricas de indumentaria', icon: 'chevron-right', displayOrder: 1 },
    { id: crypto.randomUUID(), type: 'b2b_client', title: 'Talleres de confección', icon: 'chevron-right', displayOrder: 2 },
    { id: crypto.randomUUID(), type: 'b2b_client', title: 'Marcas de ropa', icon: 'chevron-right', displayOrder: 3 },
    { id: crypto.randomUUID(), type: 'b2b_client', title: 'Confeccionistas y Modistas', icon: 'chevron-right', displayOrder: 4 },
    { id: crypto.randomUUID(), type: 'b2b_client', title: 'Emprendedores textiles', icon: 'chevron-right', displayOrder: 5 },
  ];

  console.log('📦 Inserting default content lists...');
  await db.insert(schema.siteContentLists).values(listsData);
  
  console.log('✅ Content seeded successfully.');
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
