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

  console.log('⚙️  Inserting default site settings...');
  await db
    .insert(schema.siteSettings)
    .values({
      id: '1',
      heroTitle: 'Textil CCE – Telas por Mayor para Indumentaria',
      heroSubtitle:
        'Más de 20 años ofreciendo telas de calidad, variedad de colores y precios competitivos en Once.',
      whatsappNumber: '+5491144048614',
      address: 'Azcuénaga 650 – Once, Buenos Aires',
      businessHours: 'Lunes a Viernes: 9 a 17 hs',
      instagramUrl: 'https://www.instagram.com/textil_cce/',
      facebookUrl: 'https://www.facebook.com/TextilCCE',
      tiktokUrl: 'https://www.tiktok.com/@textil_cce',
      updatedAt: new Date(),
    })
    .onConflictDoNothing();

  console.log('✅ Site settings seeded successfully.');
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
