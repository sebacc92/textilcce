import { $, component$, useSignal } from '@builder.io/qwik';
import { routeLoader$, routeAction$, Form, z, zod$, type DocumentHead } from '@builder.io/qwik-city';
import { getDb } from '../../../db/client';
import { siteSettings, siteContentLists } from '../../../db/schema';
import { eq } from 'drizzle-orm';
import { put } from '@vercel/blob';
import imageCompression from 'browser-image-compression';


export const useSettingsLoader = routeLoader$(async ({ env }) => {
  const db = getDb(env);
  const [settings] = await db.select().from(siteSettings).where(eq(siteSettings.id, '1')).limit(1);
  return settings;
});

export const useListsLoader = routeLoader$(async ({ env }) => {
  const db = getDb(env);
  return await db.select().from(siteContentLists).orderBy(siteContentLists.displayOrder);
});

export const useUpdateAboutAction = routeAction$(async (data, { env }) => {
  const db = getDb(env);
  await db.update(siteSettings).set({
    aboutP1: data.aboutP1 || undefined,
    aboutP2: data.aboutP2 || undefined,
    commitmentText: data.commitmentText || undefined,
    statsYears: data.statsYears || undefined,
    statsCoverage: data.statsCoverage || undefined,
  }).where(eq(siteSettings.id, '1'));
  return { success: true };
}, zod$({
  aboutP1: z.string().optional(),
  aboutP2: z.string().optional(),
  commitmentText: z.string().optional(),
  statsYears: z.string().optional(),
  statsCoverage: z.string().optional(),
}));

export const useUpdateContactAction = routeAction$(async (data, { env }) => {
  const db = getDb(env);
  await db.update(siteSettings).set({
    address: data.address || undefined,
    businessHours: data.businessHours || undefined,
    contactEmail: data.contactEmail || undefined,
    whatsappNumber: data.whatsappNumber || undefined,
    mapEmbedUrl: data.mapEmbedUrl || undefined,
  }).where(eq(siteSettings.id, '1'));
  return { success: true };
}, zod$({
  address: z.string().optional(),
  businessHours: z.string().optional(),
  contactEmail: z.string().optional(),
  whatsappNumber: z.string().optional(),
  mapEmbedUrl: z.string().optional(),
}));

export const useAddListItemAction = routeAction$(async (data, { env }) => {
  const db = getDb(env);
  await db.insert(siteContentLists).values({
    id: crypto.randomUUID(),
    type: data.type,
    title: data.title,
    description: data.description,
    icon: data.icon,
    displayOrder: Number(data.displayOrder) || 0,
  });
  return { success: true };
}, zod$({
  type: z.string(),
  title: z.string(),
  description: z.string().optional(),
  icon: z.string().optional(),
  displayOrder: z.string().optional(),
}));

export const useDeleteListItemAction = routeAction$(async (data, { env }) => {
  const db = getDb(env);
  await db.delete(siteContentLists).where(eq(siteContentLists.id, data.id));
  return { success: true };
}, zod$({ id: z.string() }));

export const useUpdateCtaAction = routeAction$(async (data, requestEvent) => {
  try {
    let ctaImageUrl: string | undefined;

    if (data.ctaImage && typeof data.ctaImage === 'object' && (data.ctaImage as Blob).size > 0) {
      const file = data.ctaImage as File;
      const fileName = file.name || `cta-${Date.now()}.webp`;
      const { url } = await put(fileName, file, {
        access: 'public',
        token: requestEvent.env.get('BLOB_READ_WRITE_TOKEN'),
      });
      ctaImageUrl = url;
    }

    const db = getDb(requestEvent.env);
    const updateData: Record<string, any> = {
      ctaTitle: data.ctaTitle,
      ctaSubtitle: data.ctaSubtitle || null,
      ctaButtonText: data.ctaButtonText || null,
    };

    if (ctaImageUrl) {
      updateData.ctaImageUrl = ctaImageUrl;
    }

    await db.update(siteSettings).set(updateData).where(eq(siteSettings.id, '1'));
    return { success: true };
  } catch (e: any) {
    return requestEvent.fail(500, { message: e.message || 'Error al guardar.' });
  }
}, zod$({
  ctaTitle: z.string().min(1, 'El título es obligatorio'),
  ctaSubtitle: z.string().optional(),
  ctaButtonText: z.string().optional(),
  ctaImage: z.any().optional(),
}));

export default component$(() => {
  const activeTab = useSignal<'home' | 'nosotros' | 'mayoristas' | 'contacto' | 'cta'>('home');
  const settings = useSettingsLoader();
  const listsData = useListsLoader();
  const updateAboutAction = useUpdateAboutAction();
  const updateContactAction = useUpdateContactAction();
  const addListItemAction = useAddListItemAction();
  const deleteListItemAction = useDeleteListItemAction();
  const updateCtaAction = useUpdateCtaAction();
  const isCompressing = useSignal(false);

  const handleCtaSubmit = $(async (_e: Event, currentTarget: HTMLFormElement) => {
    if (isCompressing.value || updateCtaAction.isRunning) return;

    isCompressing.value = true;
    try {
      const formData = new FormData(currentTarget);
      const imageFile = formData.get('ctaImage') as File | null;

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
        formData.set('ctaImage', compressedFile);
      }

      await updateCtaAction.submit(formData);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      isCompressing.value = false;
    }
  });

  const homeFeatures = listsData.value.filter(l => l.type === 'home_feature');
  const b2bBenefits = listsData.value.filter(l => l.type === 'b2b_benefit');
  const b2bClients = listsData.value.filter(l => l.type === 'b2b_client');

  return (
    <div class="max-w-5xl mx-auto space-y-6">
      <h1 class="text-3xl font-bold text-slate-800">Gestión de Contenido</h1>

      {/* Tabs */}
      <div class="border-b border-gray-200">
        <nav class="-mb-px flex space-x-8">
          <button
            onClick$={() => activeTab.value = 'home'}
            class={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab.value === 'home' ? 'border-[#6272b3] text-[#6272b3]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            Home (Características)
          </button>
          <button
            onClick$={() => activeTab.value = 'cta'}
            class={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab.value === 'cta' ? 'border-[#6272b3] text-[#6272b3]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            Final CTA
          </button>
          <button
            onClick$={() => activeTab.value = 'mayoristas'}
            class={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab.value === 'mayoristas' ? 'border-[#6272b3] text-[#6272b3]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            Mayoristas (B2B)
          </button>
          <button
            onClick$={() => activeTab.value = 'nosotros'}
            class={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab.value === 'nosotros' ? 'border-[#6272b3] text-[#6272b3]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            Nosotros
          </button>
          <button
            onClick$={() => activeTab.value = 'contacto'}
            class={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab.value === 'contacto' ? 'border-[#6272b3] text-[#6272b3]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            Contacto & Mapa
          </button>
        </nav>
      </div>

      {/* HOME TAB */}
      {activeTab.value === 'home' && (
        <div class="space-y-6 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div class="border-b border-gray-100 pb-3">
            <h2 class="text-xl font-bold text-slate-800">Características y Ventajas</h2>
            <p class="text-sm text-gray-500 mt-1">Administra la grilla de items destacables (Home).</p>
          </div>

          <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {homeFeatures.map(item => (
              <div key={item.id} class="border border-gray-200 rounded-lg p-4 bg-gray-50 relative group">
                <Form action={deleteListItemAction} onSubmit$={(e) => { if (!confirm('¿Estás seguro de eliminar este elemento?')) e.preventDefault(); }}>
                  <input type="hidden" name="id" value={item.id} />
                  <button type="submit" class="absolute top-2 right-2 text-red-500 hover:text-red-700 opacity-50 group-hover:opacity-100 transition-opacity p-1">
                    <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </Form>
                <h3 class="font-bold text-slate-800 pr-6">{item.title}</h3>
                <p class="text-sm text-gray-600 mt-1">{item.description}</p>
                <p class="text-xs text-slate-400 mt-2">Icono: {item.icon || 'default'} | Orden: {item.displayOrder}</p>
              </div>
            ))}
          </div>

          <div class="mt-8 bg-slate-50 p-6 rounded-lg border border-slate-200 border-dashed">
            <h3 class="font-semibold text-slate-800 mb-4">Añadir nueva ventaja</h3>
            <Form action={addListItemAction} class="grid gap-4 sm:grid-cols-2">
              <input type="hidden" name="type" value="home_feature" />
              <input type="text" name="title" required placeholder="Título" class="w-full bg-white border border-gray-300 rounded-md py-2 px-3 text-sm text-slate-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6272b3] focus:border-transparent transition-all" />
              <input type="text" name="icon" placeholder="Icono Lucide (ej: star, truck, check)" class="w-full bg-white border border-gray-300 rounded-md py-2 px-3 text-sm text-slate-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6272b3] focus:border-transparent transition-all" />
              <input type="text" name="description" placeholder="Descripción corta" class="w-full bg-white border border-gray-300 rounded-md py-2 px-3 text-sm text-slate-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6272b3] focus:border-transparent transition-all sm:col-span-2" />
              <div class="sm:col-span-2 flex justify-end">
                <button type="submit" class="bg-slate-900 text-white px-4 py-2 rounded font-medium text-sm hover:bg-slate-800">Añadir Feature</button>
              </div>
            </Form>
          </div>
        </div>
      )}

      {/* NOSOTROS TAB */}
      {activeTab.value === 'nosotros' && (
        <div class="space-y-6 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div class="border-b border-gray-100 pb-3">
            <h2 class="text-xl font-bold text-slate-800">Textos ("Nosotros")</h2>
            <p class="text-sm text-gray-500 mt-1">Configura la narrativa y estadísticas clave de la empresa.</p>
          </div>

          <Form action={updateAboutAction} class="space-y-6">
            {updateAboutAction.value?.success && (
              <div class="bg-emerald-50 text-emerald-700 p-3 rounded text-sm">Textos guardados correctamente.</div>
            )}

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Párrafo Principal (Historia)</label>
              <textarea name="aboutP1" rows={4} class="w-full bg-white border border-gray-300 rounded-md py-2 px-3 text-sm text-slate-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6272b3] focus:border-transparent transition-all" value={settings.value?.aboutP1 || ''}></textarea>
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Párrafo Secundario (Local / Filosofía)</label>
              <textarea name="aboutP2" rows={4} class="w-full bg-white border border-gray-300 rounded-md py-2 px-3 text-sm text-slate-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6272b3] focus:border-transparent transition-all" value={settings.value?.aboutP2 || ''}></textarea>
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Nuestro Compromiso (Caja Azul)</label>
              <textarea name="commitmentText" rows={3} class="w-full bg-white border border-gray-300 rounded-md py-2 px-3 text-sm text-slate-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6272b3] focus:border-transparent transition-all" value={settings.value?.commitmentText || ''}></textarea>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Estadística Métrica 1 (Años)</label>
                <input type="text" name="statsYears" class="w-full bg-white border border-gray-300 rounded-md py-2 px-3 text-sm text-slate-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6272b3] focus:border-transparent transition-all" placeholder="20+" value={settings.value?.statsYears || ''} />
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Estadística Métrica 2 (Cobertura)</label>
                <input type="text" name="statsCoverage" class="w-full bg-white border border-gray-300 rounded-md py-2 px-3 text-sm text-slate-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6272b3] focus:border-transparent transition-all" placeholder="TODO" value={settings.value?.statsCoverage || ''} />
              </div>
            </div>

            <div class="flex justify-end">
              <button type="submit" class="bg-[#1e2c53] text-white px-6 py-2.5 rounded font-medium hover:bg-[#6272b3] transition relative">
                {updateAboutAction.isRunning ? 'Guardando...' : 'Guardar Textos'}
              </button>
            </div>
          </Form>
        </div>
      )}

      {/* MAYORISTAS TAB */}
      {activeTab.value === 'mayoristas' && (
        <div class="grid md:grid-cols-2 gap-6">
          {/* Benefits */}
          <div class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div class="border-b border-gray-100 pb-3 mb-4">
              <h2 class="text-xl font-bold text-slate-800">Beneficios (Lista)</h2>
            </div>

            <ul class="space-y-3 mb-6">
              {b2bBenefits.map(item => (
                <li key={item.id} class="flex items-start gap-3 p-3 bg-gray-50 rounded border border-gray-100 relative group">
                  <Form action={deleteListItemAction} class="shrink-0 absolute right-2 top-2 opacity-50 hover:opacity-100" onSubmit$={(e) => { if (!confirm('¿Estás seguro de eliminar este elemento?')) e.preventDefault(); }}>
                    <input type="hidden" name="id" value={item.id} />
                    <button type="submit" class="text-red-500 hover:text-red-700">X</button>
                  </Form>
                  <div>
                    <span class="font-semibold text-sm text-slate-800 block">{item.title}</span>
                    <span class="text-xs text-gray-500 block">{item.description}</span>
                  </div>
                </li>
              ))}
            </ul>

            <div class="bg-slate-50 p-4 rounded border border-gray-200 border-dashed">
              <h3 class="font-medium text-sm text-slate-800 mb-3">Agregar Beneficio</h3>
              <Form action={addListItemAction} class="space-y-3">
                <input type="hidden" name="type" value="b2b_benefit" />
                <input type="text" name="title" required placeholder="Título" class="w-full bg-white border border-gray-300 rounded-md py-2 px-3 text-sm text-slate-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6272b3] focus:border-transparent transition-all" />
                <input type="text" name="description" placeholder="Descripción" class="w-full bg-white border border-gray-300 rounded-md py-2 px-3 text-sm text-slate-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6272b3] focus:border-transparent transition-all" />
                <button type="submit" class="w-full bg-slate-800 text-white rounded py-2 text-sm font-medium hover:bg-slate-700">Añadir</button>
              </Form>
            </div>
          </div>

          {/* Clients */}
          <div class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div class="border-b border-gray-100 pb-3 mb-4">
              <h2 class="text-xl font-bold text-slate-800">Tipos de Clientes</h2>
            </div>

            <ul class="space-y-2 mb-6">
              {b2bClients.map(item => (
                <li key={item.id} class="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-100">
                  <span class="font-medium text-sm text-slate-800">{item.title}</span>
                  <Form action={deleteListItemAction} onSubmit$={(e) => { if (!confirm('¿Estás seguro de eliminar este elemento?')) e.preventDefault(); }}>
                    <input type="hidden" name="id" value={item.id} />
                    <button type="submit" class="text-red-500 hover:text-red-700 text-xs font-bold px-2">X</button>
                  </Form>
                </li>
              ))}
            </ul>

            <div class="bg-slate-50 p-4 rounded border border-gray-200 border-dashed">
              <h3 class="font-medium text-sm text-slate-800 mb-3">Agregar Cliente Base</h3>
              <Form action={addListItemAction} class="space-y-3">
                <input type="hidden" name="type" value="b2b_client" />
                <input type="text" name="title" required placeholder="Ej: Emprendedores textiles" class="w-full bg-white border border-gray-300 rounded-md py-2 px-3 text-sm text-slate-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6272b3] focus:border-transparent transition-all" />
                <button type="submit" class="w-full bg-slate-800 text-white rounded py-2 text-sm font-medium hover:bg-slate-700">Añadir Cliente</button>
              </Form>
            </div>
          </div>
        </div>
      )}

      {/* CONTACTO TAB */}
      {activeTab.value === 'contacto' && (
        <div class="space-y-6 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div class="border-b border-gray-100 pb-3">
            <h2 class="text-xl font-bold text-slate-800">Información de Contacto</h2>
            <p class="text-sm text-gray-500 mt-1">Configura la dirección, horarios, mapa y otros datos de contacto.</p>
          </div>

          <Form action={updateContactAction} class="space-y-6">
            {updateContactAction.value?.success && (
              <div class="bg-emerald-50 text-emerald-700 p-3 rounded text-sm">Textos de contacto guardados correctamente.</div>
            )}

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">Email de Contacto</label>
                <input type="email" name="contactEmail" class="w-full bg-white border border-gray-300 rounded-md py-2 px-3 text-sm text-slate-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6272b3] focus:border-transparent transition-all" placeholder="info@textilcce.com" value={settings.value?.contactEmail || ''} />
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1">WhatsApp (Número)</label>
                <input type="text" name="whatsappNumber" class="w-full bg-white border border-gray-300 rounded-md py-2 px-3 text-sm text-slate-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6272b3] focus:border-transparent transition-all" placeholder="5491100000000" value={settings.value?.whatsappNumber || ''} />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Dirección Física</label>
              <input type="text" name="address" class="w-full bg-white border border-gray-300 rounded-md py-2 px-3 text-sm text-slate-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6272b3] focus:border-transparent transition-all" placeholder="Azcuénaga 650, Once, Buenos Aires" value={settings.value?.address || ''} />
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Horarios de Atención</label>
              <textarea name="businessHours" rows={2} class="w-full bg-white border border-gray-300 rounded-md py-2 px-3 text-sm text-slate-800 font-mono placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6272b3] focus:border-transparent transition-all" placeholder="L a V: 9 a 18 hs&#10;Sábados: 9 a 14 hs" value={settings.value?.businessHours || ''}></textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">URL de Inserción del Mapa (Google Maps)</label>
              <input type="text" name="mapEmbedUrl" class="w-full bg-white border border-gray-300 rounded-md py-2 px-3 text-sm text-slate-800 font-mono placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6272b3] focus:border-transparent transition-all" placeholder="https://www.google.com/maps/embed?pb=..." value={settings.value?.mapEmbedUrl || ''} />
              <p class="text-xs text-gray-400 mt-1">Ingresa solo la URL que se encuentra dentro del atributo <code>src="..."</code> del código iframe de Google Maps.</p>
            </div>

            <div class="flex justify-end">
              <button type="submit" class="bg-[#1e2c53] text-white px-6 py-2.5 rounded font-medium hover:bg-[#6272b3] transition relative">
                {updateContactAction.isRunning ? 'Guardando...' : 'Guardar Contacto'}
              </button>
            </div>
          </Form>
        </div>
      )}

      {/* FINAL CTA TAB */}
      {activeTab.value === 'cta' && (
        <div class="space-y-6 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div class="border-b border-gray-100 pb-3">
            <h2 class="text-xl font-bold text-slate-800">Final CTA (Llamado a la Acción)</h2>
            <p class="text-sm text-gray-500 mt-1">Configura el texto y la imagen de fondo de la última sección de la página principal.</p>
          </div>

          <Form action={updateCtaAction} class="space-y-6" preventdefault:submit onSubmit$={handleCtaSubmit}>
            {updateCtaAction.value?.success && (
              <div class="bg-emerald-50 text-emerald-700 p-3 rounded text-sm mb-4">Sección CTA guardada correctamente.</div>
            )}
            {updateCtaAction.value?.failed && (
              <div class="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm mb-4">Error: {updateCtaAction.value.message}</div>
            )}

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Título principal</label>
              <input type="text" name="ctaTitle" required class="w-full bg-white border border-gray-300 rounded-md py-2 px-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#6272b3] focus:border-transparent transition-all" value={settings.value?.ctaTitle || '¿Buscás telas por mayor para tu próxima colección?'} />
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Párrafo Descriptivo</label>
              <textarea name="ctaSubtitle" rows={3} class="w-full bg-white border border-gray-300 rounded-md py-2 px-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#6272b3] focus:border-transparent transition-all">{settings.value?.ctaSubtitle || 'Nuestro equipo está listo para asesorarte. Escribinos por WhatsApp y recibí atención personalizada al instante.'}</textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Texto del botón</label>
              <input type="text" name="ctaButtonText" class="w-full bg-white border border-gray-300 rounded-md py-2 px-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#6272b3] focus:border-transparent transition-all" value={settings.value?.ctaButtonText || 'Escribinos por WhatsApp'} />
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Imagen de fondo</label>
              {settings.value?.ctaImageUrl && (
                <div class="mb-3">
                  <img src={settings.value.ctaImageUrl} alt="CTA Fondo" class="rounded-lg border border-slate-200 max-h-40 object-cover" />
                </div>
              )}
              <input type="file" name="ctaImage" accept="image/*" class="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 transition" />
            </div>

            <div class="flex justify-end">
              <button type="submit" disabled={isCompressing.value || updateCtaAction.isRunning} class="bg-[#1e2c53] text-white px-6 py-2.5 rounded font-medium hover:bg-[#6272b3] transition disabled:opacity-50">
                {isCompressing.value ? 'Optimizando...' : updateCtaAction.isRunning ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </Form>
        </div>
      )}
    </div>
  );
});

export const head: DocumentHead = {
  title: 'Gestión de Contenido | Textil CCE',
};
