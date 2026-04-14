import { component$, Slot } from "@builder.io/qwik";
import { routeLoader$, type RequestHandler } from "@builder.io/qwik-city";
import { Header } from "../../components/header/header";
import { Footer } from "../../components/footer/footer";
import { WhatsAppButton } from "../../components/whatsapp-button";
import { Chatbot } from "../../components/chatbot/chatbot";
import { getDb } from "../../db/client";
import { siteSettings } from "../../db/schema";
import { eq } from "drizzle-orm";

export const onGet: RequestHandler = async ({ cacheControl }) => {
  cacheControl({
    staleWhileRevalidate: 60 * 60 * 24 * 7,
    maxAge: 5,
  });
};

export const useSiteSettingsLoader = routeLoader$(async ({ env }) => {
  const db = getDb(env);
  const [settings] = await db
    .select()
    .from(siteSettings)
    .where(eq(siteSettings.id, '1'))
    .limit(1);

  return settings ?? {
    id: '1',
    heroTitle: 'Telas por Mayor en Once',
    heroSubtitle: null,
    heroImageUrl: null,
    whatsappNumber: '+5491144048614',
    instagramUrl: 'https://www.instagram.com/textil_cce/',
    facebookUrl: 'https://www.facebook.com/TextilCCE',
    tiktokUrl: 'https://www.tiktok.com/@textil_cce',
    address: 'Azcuénaga 650 – Once, Buenos Aires',
    businessHours: 'Lunes a Viernes: 9 a 17 hs',
    contactEmail: null,
    aiEnabled: true,
    catalogTitle: 'Catálogo de Telas',
    catalogDescription: 'En Textil CCE ofrecemos un amplio catálogo de telas por rollo en colores clásicos para producción continua, pensadas para cubrir las necesidades de fábricas de indumentaria, talleres y confeccionistas del rubro textil.\n\nNuestro objetivo es brindar stock permanente, calidad y disponibilidad para que cada cliente pueda desarrollar su moldería con materiales confiables.',
    heroVideoUrl: 'https://sap3cnfy0vc6nzdk.public.blob.vercel-storage.com/output.mp4',
    updatedAt: null,
  };
});

export default component$(() => {
  const settings = useSiteSettingsLoader();
  const whatsapp = settings.value.whatsappNumber?.replace(/[^0-9]/g, '') || '5491144048614';

  return (
    <div class="flex min-h-screen flex-col font-sans">
      <Header />
      <main class="flex-1">
        <Slot />
      </main>
      <Footer settings={settings.value} />
      <WhatsAppButton phone={whatsapp} message="Hola Textil CCE, me gustaría recibir más información sobre venta mayorista." />
      {settings.value.aiEnabled && <Chatbot />}
    </div>
  );
});
