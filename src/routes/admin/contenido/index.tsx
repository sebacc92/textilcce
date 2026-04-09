import { component$, useSignal } from '@builder.io/qwik';
import { routeLoader$, routeAction$, Form, z, zod$, type DocumentHead } from '@builder.io/qwik-city';
import { getDb } from '../../../db/client';
import { siteSettings, siteContentLists } from '../../../db/schema';
import { eq } from 'drizzle-orm';


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

export default component$(() => {
  const activeTab = useSignal<'home' | 'nosotros' | 'mayoristas' | 'contacto'>('home');
  const settings = useSettingsLoader();
  const listsData = useListsLoader();
  const updateAboutAction = useUpdateAboutAction();
  const updateContactAction = useUpdateContactAction();
  const addListItemAction = useAddListItemAction();
  const deleteListItemAction = useDeleteListItemAction();

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
            onClick$={() => activeTab.value = 'nosotros'}
             class={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab.value === 'nosotros' ? 'border-[#6272b3] text-[#6272b3]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            Nosotros
          </button>
          <button
            onClick$={() => activeTab.value = 'mayoristas'}
             class={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab.value === 'mayoristas' ? 'border-[#6272b3] text-[#6272b3]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            Mayoristas (B2B)
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
                   <Form action={deleteListItemAction}>
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
               <input type="text" name="title" required placeholder="Título" class="rounded border-gray-300 p-2 text-sm" />
               <input type="text" name="icon" placeholder="Icono Lucide (ej: star, truck, check)" class="rounded border-gray-300 p-2 text-sm" />
               <input type="text" name="description" placeholder="Descripción corta" class="rounded border-gray-300 p-2 text-sm sm:col-span-2" />
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
               <textarea name="aboutP1" rows={4} class="w-full rounded border-gray-300 p-3 text-sm focus:ring-[#6272b3]" value={settings.value?.aboutP1 || ''}></textarea>
             </div>
             <div>
               <label class="block text-sm font-medium text-slate-700 mb-1">Párrafo Secundario (Local / Filosofía)</label>
               <textarea name="aboutP2" rows={4} class="w-full rounded border-gray-300 p-3 text-sm focus:ring-[#6272b3]" value={settings.value?.aboutP2 || ''}></textarea>
             </div>
             <div>
               <label class="block text-sm font-medium text-slate-700 mb-1">Nuestro Compromiso (Caja Azul)</label>
               <textarea name="commitmentText" rows={3} class="w-full rounded border-gray-300 p-3 text-sm focus:ring-[#6272b3]" value={settings.value?.commitmentText || ''}></textarea>
             </div>
             <div class="grid grid-cols-2 gap-4">
               <div>
                  <label class="block text-sm font-medium text-slate-700 mb-1">Estadística Métrica 1 (Años)</label>
                  <input type="text" name="statsYears" class="w-full rounded border-gray-300 p-2 text-sm" placeholder="20+" value={settings.value?.statsYears || ''} />
               </div>
               <div>
                  <label class="block text-sm font-medium text-slate-700 mb-1">Estadística Métrica 2 (Cobertura)</label>
                  <input type="text" name="statsCoverage" class="w-full rounded border-gray-300 p-2 text-sm" placeholder="TODO" value={settings.value?.statsCoverage || ''} />
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
                     <Form action={deleteListItemAction} class="shrink-0 absolute right-2 top-2 opacity-50 hover:opacity-100">
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
                   <input type="text" name="title" required placeholder="Título" class="w-full rounded border-gray-300 p-2 text-sm" />
                   <input type="text" name="description" placeholder="Descripción" class="w-full rounded border-gray-300 p-2 text-sm" />
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
                     <Form action={deleteListItemAction}>
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
                   <input type="text" name="title" required placeholder="Ej: Emprendedores textiles" class="w-full rounded border-gray-300 p-2 text-sm" />
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
                  <input type="email" name="contactEmail" class="w-full rounded border-gray-300 p-2 text-sm" placeholder="info@textilcce.com" value={settings.value?.contactEmail || ''} />
               </div>
               <div>
                  <label class="block text-sm font-medium text-slate-700 mb-1">WhatsApp (Número)</label>
                  <input type="text" name="whatsappNumber" class="w-full rounded border-gray-300 p-2 text-sm" placeholder="5491100000000" value={settings.value?.whatsappNumber || ''} />
               </div>
             </div>
             
             <div>
               <label class="block text-sm font-medium text-slate-700 mb-1">Dirección Física</label>
               <input type="text" name="address" class="w-full rounded border-gray-300 p-2 text-sm" placeholder="Azcuénaga 650, Once, Buenos Aires" value={settings.value?.address || ''} />
             </div>

             <div>
               <label class="block text-sm font-medium text-slate-700 mb-1">Horarios de Atención</label>
               <textarea name="businessHours" rows={2} class="w-full rounded border-gray-300 p-3 text-sm focus:ring-[#6272b3] font-mono" placeholder="L a V: 9 a 18 hs&#10;Sábados: 9 a 14 hs" value={settings.value?.businessHours || ''}></textarea>
             </div>

             <div>
               <label class="block text-sm font-medium text-slate-700 mb-1">URL de Inserción del Mapa (Google Maps)</label>
               <input type="text" name="mapEmbedUrl" class="w-full rounded border-gray-300 p-2 text-sm font-mono text-gray-600" placeholder="https://www.google.com/maps/embed?pb=..." value={settings.value?.mapEmbedUrl || ''} />
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
    </div>
  );
});

export const head: DocumentHead = {
  title: 'Gestión de Contenido | Textil CCE',
};
