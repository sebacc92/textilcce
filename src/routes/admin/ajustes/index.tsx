import { $, component$, useSignal } from '@builder.io/qwik';
import { routeLoader$, routeAction$, Form, z, zod$, type DocumentHead } from '@builder.io/qwik-city';
import { getDb } from '../../../db/client';
import { siteSettings } from '../../../db/schema';
import { eq } from 'drizzle-orm';
import { put } from '@vercel/blob';
import imageCompression from 'browser-image-compression';

const DEFAULT_SETTINGS = {
  id: '1',
  heroTitle: 'Telas por Mayor en Once',
  heroSubtitle: '',
  heroImageUrl: null,
  whatsappNumber: '',
  instagramUrl: '',
  facebookUrl: '',
  tiktokUrl: '',
  address: '',
  businessHours: '',
  contactEmail: '',
  chatbotEnabled: true,
  aiTone: '',
  chatbotKnowledge: '',
  updatedAt: null,
};

export const useSettingsLoader = routeLoader$(async ({ env }) => {
  const db = getDb(env);
  const [settings] = await db.select().from(siteSettings).where(eq(siteSettings.id, '1')).limit(1);
  return settings ?? DEFAULT_SETTINGS;
});

export const useUpdateSettingsAction = routeAction$(
  async (data, requestEvent) => {
    try {
      let heroImageUrl: string | undefined;

      if (data.heroImage && typeof data.heroImage === 'object' && (data.heroImage as Blob).size > 0) {
        const file = data.heroImage as File;
        const fileName = file.name || `hero-${Date.now()}.webp`;
        const { url } = await put(fileName, file, {
          access: 'public',
          token: requestEvent.env.get('BLOB_READ_WRITE_TOKEN'),
        });
        heroImageUrl = url;
      }

      const db = getDb(requestEvent.env);

      const updateData: Record<string, any> = {
        heroTitle: data.heroTitle,
        heroSubtitle: data.heroSubtitle || null,
        whatsappNumber: data.whatsappNumber || null,
        instagramUrl: data.instagramUrl || null,
        facebookUrl: data.facebookUrl || null,
        tiktokUrl: data.tiktokUrl || null,
        address: data.address || null,
        businessHours: data.businessHours || null,
        contactEmail: data.contactEmail || null,
        chatbotEnabled: data.chatbotEnabled === 'on', // Checkboxes send "on" if checked, missing if not
        aiTone: data.aiTone || null,
        chatbotKnowledge: data.chatbotKnowledge || null,
        updatedAt: new Date(),
      };

      if (heroImageUrl) {
        updateData.heroImageUrl = heroImageUrl;
      }

      await db.update(siteSettings).set(updateData).where(eq(siteSettings.id, '1'));

      return { success: true };
    } catch (e: any) {
      console.error('Error updating settings:', e);
      return requestEvent.fail(500, { message: e.message || 'Error al guardar los ajustes.' });
    }
  },
  zod$({
    heroTitle: z.string().min(1, 'El título es obligatorio'),
    heroSubtitle: z.string().optional(),
    heroImage: z.any().optional(),
    whatsappNumber: z.string().optional(),
    instagramUrl: z.string().optional(),
    facebookUrl: z.string().optional(),
    tiktokUrl: z.string().optional(),
    address: z.string().optional(),
    businessHours: z.string().optional(),
    contactEmail: z.string().optional(),
    chatbotEnabled: z.string().optional(),
    aiTone: z.string().optional(),
    chatbotKnowledge: z.string().optional(),
  }),
);

export default component$(() => {
  const settings = useSettingsLoader();
  const action = useUpdateSettingsAction();
  const isCompressing = useSignal(false);

  const handleSubmit = $(async (_e: Event, currentTarget: HTMLFormElement) => {
    if (isCompressing.value || action.isRunning) return;

    isCompressing.value = true;
    try {
      const formData = new FormData(currentTarget);
      const imageFile = formData.get('heroImage') as File | null;

      if (imageFile && imageFile.size > 0 && imageFile.name) {
        const options = {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
          fileType: 'image/webp' as const,
          initialQuality: 0.85,
        };
        const compressedBlob = await imageCompression(imageFile, options);
        const newFileName = imageFile.name.replace(/\.[^/.]+$/, '') + '.webp';
        const compressedFile = new File([compressedBlob], newFileName, { type: 'image/webp' });
        formData.set('heroImage', compressedFile);
      }

      await action.submit(formData);
    } catch (error) {
      console.error('Error al comprimir/subir imagen:', error);
    } finally {
      isCompressing.value = false;
    }
  });

  const s = settings.value;

  return (
    <div class="max-w-4xl mx-auto space-y-6">
      <h1 class="text-3xl font-bold text-slate-800">Ajustes del Sitio</h1>

      {/* Success / Error Messages */}
      {action.value?.success && (
        <div class="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg text-sm font-medium">
          ✅ Ajustes guardados correctamente.
        </div>
      )}
      {action.value?.failed && (
        <div class="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm font-medium">
          ❌ {action.value.message}
        </div>
      )}

      <Form
        action={action}
        class="space-y-8"
        preventdefault:submit
        onSubmit$={handleSubmit}
      >
        {/* Hero Section */}
        <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-5">
          <div class="border-b border-slate-100 pb-3">
            <h2 class="text-lg font-semibold text-slate-800">🎯 Hero Banner</h2>
            <p class="text-sm text-slate-500 mt-1">Configuración del banner principal del sitio.</p>
          </div>

          <div>
            <label for="heroTitle" class="block text-sm font-medium text-slate-700 mb-1">Título principal</label>
            <input
              type="text"
              id="heroTitle"
              name="heroTitle"
              value={s.heroTitle}
              required
              class="block w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm shadow-sm focus:border-slate-500 focus:ring-1 focus:ring-slate-500 transition"
            />
          </div>

          <div>
            <label for="heroSubtitle" class="block text-sm font-medium text-slate-700 mb-1">Subtítulo descriptivo</label>
            <textarea
              id="heroSubtitle"
              name="heroSubtitle"
              rows={3}
              class="block w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm shadow-sm focus:border-slate-500 focus:ring-1 focus:ring-slate-500 transition"
            >{s.heroSubtitle || ''}</textarea>
          </div>

          <div>
            <label for="heroImage" class="block text-sm font-medium text-slate-700 mb-1">Imagen de fondo</label>
            {s.heroImageUrl && (
              <div class="mb-3">
                <img
                  src={s.heroImageUrl}
                  alt="Hero actual"
                  width={400}
                  height={200}
                  class="rounded-lg border border-slate-200 max-h-40 object-cover"
                />
                <p class="text-xs text-slate-400 mt-1">Imagen actual. Subí una nueva para reemplazar.</p>
              </div>
            )}
            <input
              type="file"
              id="heroImage"
              name="heroImage"
              accept="image/*"
              class="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 transition"
            />
            <p class="text-xs text-slate-400 mt-1">Se optimizará automáticamente a .webp (1920px max). Recomendación: 1920×1080px.</p>
          </div>
        </div>

        {/* Contact Section */}
        <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-5">
          <div class="border-b border-slate-100 pb-3">
            <h2 class="text-lg font-semibold text-slate-800">📞 Contacto y Local</h2>
            <p class="text-sm text-slate-500 mt-1">Datos de contacto que aparecen en el sitio.</p>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label for="whatsappNumber" class="block text-sm font-medium text-slate-700 mb-1">WhatsApp</label>
              <input
                type="text"
                id="whatsappNumber"
                name="whatsappNumber"
                value={s.whatsappNumber || ''}
                placeholder="+5491144048614"
                class="block w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm shadow-sm focus:border-slate-500 focus:ring-1 focus:ring-slate-500 transition"
              />
              <p class="text-xs text-slate-400 mt-1">Formato internacional con +.</p>
            </div>

            <div>
              <label for="contactEmail" class="block text-sm font-medium text-slate-700 mb-1">Email de contacto</label>
              <input
                type="email"
                id="contactEmail"
                name="contactEmail"
                value={s.contactEmail || ''}
                placeholder="ventas@textilcce.com"
                class="block w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm shadow-sm focus:border-slate-500 focus:ring-1 focus:ring-slate-500 transition"
              />
            </div>
          </div>

          <div>
            <label for="address" class="block text-sm font-medium text-slate-700 mb-1">Dirección</label>
            <input
              type="text"
              id="address"
              name="address"
              value={s.address || ''}
              placeholder="Azcuénaga 650 – Once, Buenos Aires"
              class="block w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm shadow-sm focus:border-slate-500 focus:ring-1 focus:ring-slate-500 transition"
            />
          </div>

          <div>
            <label for="businessHours" class="block text-sm font-medium text-slate-700 mb-1">Horarios de atención</label>
            <input
              type="text"
              id="businessHours"
              name="businessHours"
              value={s.businessHours || ''}
              placeholder="Lunes a Viernes: 9 a 17 hs"
              class="block w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm shadow-sm focus:border-slate-500 focus:ring-1 focus:ring-slate-500 transition"
            />
          </div>
        </div>

        {/* Social Networks Section */}
        <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-5">
          <div class="border-b border-slate-100 pb-3">
            <h2 class="text-lg font-semibold text-slate-800">🌐 Redes Sociales</h2>
            <p class="text-sm text-slate-500 mt-1">URLs completas de las redes sociales.</p>
          </div>

          <div class="space-y-4">
            <div>
              <label for="instagramUrl" class="block text-sm font-medium text-slate-700 mb-1">Instagram</label>
              <input
                type="url"
                id="instagramUrl"
                name="instagramUrl"
                value={s.instagramUrl || ''}
                placeholder="https://www.instagram.com/textil_cce/"
                class="block w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm shadow-sm focus:border-slate-500 focus:ring-1 focus:ring-slate-500 transition"
              />
            </div>

            <div>
              <label for="facebookUrl" class="block text-sm font-medium text-slate-700 mb-1">Facebook</label>
              <input
                type="url"
                id="facebookUrl"
                name="facebookUrl"
                value={s.facebookUrl || ''}
                placeholder="https://www.facebook.com/TextilCCE"
                class="block w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm shadow-sm focus:border-slate-500 focus:ring-1 focus:ring-slate-500 transition"
              />
            </div>

            <div>
              <label for="tiktokUrl" class="block text-sm font-medium text-slate-700 mb-1">TikTok</label>
              <input
                type="url"
                id="tiktokUrl"
                name="tiktokUrl"
                value={s.tiktokUrl || ''}
                placeholder="https://www.tiktok.com/@textil_cce"
                class="block w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm shadow-sm focus:border-slate-500 focus:ring-1 focus:ring-slate-500 transition"
              />
            </div>
          </div>
        </div>

        {/* Chatbot Section */}
        <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-5">
          <div class="border-b border-slate-100 pb-3">
            <h2 class="text-lg font-semibold text-slate-800">🤖 AI Chatbot</h2>
            <p class="text-sm text-slate-500 mt-1">Configuración y personalidad del asistente virtual impulsado por IA.</p>
          </div>

          <div class="flex items-center gap-3">
            <input
              type="checkbox"
              id="chatbotEnabled"
              name="chatbotEnabled"
              checked={s.chatbotEnabled ?? true}
              class="w-5 h-5 rounded text-slate-900 border-slate-300 focus:ring-slate-500 transition"
            />
            <label for="chatbotEnabled" class="text-sm font-medium text-slate-700">Activar Chatbot en la página pública</label>
          </div>

          <div class="pt-2">
            <label for="aiTone" class="block text-sm font-medium text-slate-700 mb-1">Tono y Personalidad de la IA</label>
            <input
              type="text"
              id="aiTone"
              name="aiTone"
              value={s.aiTone || ''}
              placeholder="Ej: Profesional, directo y amable..."
              class="block w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm shadow-sm focus:border-slate-500 focus:ring-1 focus:ring-slate-500 transition"
            />
          </div>

          <div>
            <label for="chatbotKnowledge" class="block text-sm font-medium text-slate-700 mb-1">Instrucciones del Negocio (Base de Conocimiento)</label>
            <textarea
              id="chatbotKnowledge"
              name="chatbotKnowledge"
              rows={4}
              placeholder="Ingresa reglas extra para la IA. Ej: Promociones actuales 20% off abonando en efectivo en el local."
              class="block w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm shadow-sm focus:border-slate-500 focus:ring-1 focus:ring-slate-500 transition"
            >{s.chatbotKnowledge || ''}</textarea>
            <p class="text-xs text-slate-400 mt-1">Reglas personalizadas que la IA adoptará como memoria obligatoria.</p>
          </div>
        </div>

        {/* Submit */}
        <div class="flex justify-end">
          <button
            type="submit"
            disabled={isCompressing.value || action.isRunning}
            class="bg-slate-900 text-white px-8 py-3 rounded-lg font-medium hover:bg-slate-800 transition shadow-sm inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCompressing.value || action.isRunning ? (
              <>
                <svg class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {isCompressing.value ? 'Optimizando imagen...' : 'Guardando...'}
              </>
            ) : (
              'Guardar Cambios'
            )}
          </button>
        </div>
      </Form>
    </div>
  );
});

export const head: DocumentHead = {
  title: 'Ajustes del Sitio | Textil CCE Admin',
};
