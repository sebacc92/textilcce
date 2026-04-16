import { $, component$, useSignal } from '@builder.io/qwik';
import { routeAction$, Form, routeLoader$, Link, z, zod$, type DocumentHead } from '@builder.io/qwik-city';
import { getDb } from '../../../../db/client';
import { products, categories } from '../../../../db/schema';
import { put } from '@vercel/blob';
import imageCompression from 'browser-image-compression';

export const useCategoriesLoader = routeLoader$(async ({ env }) => {
  const db = getDb(env);
  return await db
    .select({ id: categories.id, name: categories.name })
    .from(categories)
    .orderBy(categories.display_order);
});

export const useCreateProductAction = routeAction$(
  async (data, requestEvent) => {
    try {
      let imageUrl: string | null = null;

      if (data.image && typeof data.image === 'object' && (data.image as Blob).size > 0) {
        const file = data.image as File;
        const fileName = file.name || `producto-${Date.now()}.webp`;
        const { url } = await put(fileName, file, {
          access: 'public',
          token: requestEvent.env.get('BLOB_READ_WRITE_TOKEN'),
        });
        imageUrl = url;
      }

      const db = getDb(requestEvent.env);
      const coloresArray = data.colores
        ? data.colores.split(',').map(c => c.trim()).filter(Boolean)
        : [];

      await db.insert(products).values({
        id: crypto.randomUUID(),
        name: data.name,
        categoryId: data.categoryId,
        description: data.description || null,
        colores: coloresArray,
        imageUrl,
        fabricante: data.fabricante || null,
        oz: data.oz || null,
        composicion: data.composicion || null,
        ancho: data.ancho || null,
        rinde: data.rinde || null,
        complemento: data.complemento || null,
        sublimar: data.sublimar === 'on' || data.sublimar === true,
        estampar: data.estampar === 'on' || data.estampar === true,
        bordar: data.bordar === 'on' || data.bordar === true,
        isOffer: data.isOffer === 'on' || data.isOffer === true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      throw requestEvent.redirect(302, '/admin/productos/');
    } catch (e: any) {
      if (e.status === 302) throw e;
      console.error(e);
      return requestEvent.fail(500, { message: e.message || 'Error interno al procesar el formulario' });
    }
  },
  zod$({
    name: z.string().min(1, 'El nombre es obligatorio'),
    categoryId: z.string().min(1, 'La categoría es obligatoria'),
    description: z.string().optional(),
    image: z.any().optional(),
    colores: z.string().optional(),
    fabricante: z.string().optional(),
    oz: z.string().optional(),
    composicion: z.string().optional(),
    ancho: z.string().optional(),
    rinde: z.string().optional(),
    complemento: z.string().optional(),
    sublimar: z.union([z.string(), z.boolean()]).optional(),
    estampar: z.union([z.string(), z.boolean()]).optional(),
    bordar: z.union([z.string(), z.boolean()]).optional(),
    isOffer: z.union([z.string(), z.boolean()]).optional(),
  }),
);

export default component$(() => {
  const action = useCreateProductAction();
  const cats = useCategoriesLoader();
  const isCompressing = useSignal(false);

  const handleSubmit = $(async (e: Event, currentTarget: HTMLFormElement) => {
    if (isCompressing.value || action.isRunning) return;

    isCompressing.value = true;
    try {
      const formData = new FormData(currentTarget);
      const imageFile = formData.get('image') as File | null;

      if (imageFile && imageFile.size > 0 && imageFile.name) {
        const options = {
          maxSizeMB: 1,
          maxWidthOrHeight: 1200,
          useWebWorker: true,
          fileType: 'image/webp' as const,
          initialQuality: 0.8,
        };
        const compressedBlob = await imageCompression(imageFile, options);
        const newFileName = imageFile.name.replace(/\.[^/.]+$/, '') + '.webp';
        const compressedFile = new File([compressedBlob], newFileName, { type: 'image/webp' });
        formData.set('image', compressedFile);
      }

      await action.submit(formData);
    } catch (error) {
      console.error('Error al comprimir/subir imagen:', error);
    } finally {
      isCompressing.value = false;
    }
  });

  return (
    <div class="max-w-2xl mx-auto space-y-6">
      <div class="flex items-center gap-4">
        <Link href="/admin/productos/" class="text-slate-400 hover:text-slate-800 transition">← Volver</Link>
        <h1 class="text-3xl font-bold text-slate-800">Nuevo Producto</h1>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        <Form
          action={action}
          class="space-y-6"
          spaReset
          preventdefault:submit
          onSubmit$={handleSubmit}
        >
          <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div class="sm:col-span-2">
              <label for="name" class="block text-sm font-medium text-slate-700">Nombre del producto</label>
              <input type="text" id="name" name="name" required class="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-slate-500 focus:ring-slate-500 sm:text-sm border px-3 py-2" />
            </div>

            <div class="sm:col-span-2">
              <label for="categoryId" class="block text-sm font-medium text-slate-700">Categoría</label>
              <select id="categoryId" name="categoryId" required class="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-slate-500 focus:ring-slate-500 sm:text-sm border px-3 py-2 bg-white">
                <option value="" disabled selected>Selecciona una categoría</option>
                {cats.value.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div class="sm:col-span-2">
              <label for="description" class="block text-sm font-medium text-slate-700">Descripción (Opcional)</label>
              <textarea id="description" name="description" rows={3} class="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-slate-500 focus:ring-slate-500 sm:text-sm border px-3 py-2"></textarea>
            </div>

            <div class="sm:col-span-2">
              <label for="colores" class="block text-sm font-medium text-slate-700">Colores Disponibles</label>
              <textarea id="colores" name="colores" rows={2} placeholder="Ej: Blanco, Negro, Azul Marino" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-slate-500 focus:ring-slate-500 sm:text-sm border px-3 py-2"></textarea>
              <p class="mt-1 text-xs text-slate-400">Separe los colores con una coma (,). Esto creará un botón por cada color.</p>
            </div>

            {/* Oferta Especial */}
            <div class="sm:col-span-2 py-4 border-t border-slate-100 mt-2">
              <label class="relative inline-flex items-center cursor-pointer group">
                <input type="checkbox" name="isOffer" class="sr-only peer" />
                <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                <span class="ml-3 text-sm font-bold text-slate-700 group-hover:text-orange-600 transition-colors">Marcar como Oferta Especial (Home)</span>
              </label>
            </div>

            {/* Nuevos Campos (Procesos) */}
            <div class="sm:col-span-2 space-y-3 mt-2 border-t pt-4 border-slate-200">
              <h3 class="text-sm font-semibold text-slate-800">Procesos Soportados</h3>
              <div class="flex gap-6">
                <label class="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" name="sublimar" class="sr-only peer" />
                  <div class="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                  <span class="ml-2 text-sm font-medium text-slate-700">Sublimar</span>
                </label>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" name="estampar" class="sr-only peer" />
                  <div class="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                  <span class="ml-2 text-sm font-medium text-slate-700">Estampar</span>
                </label>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" name="bordar" class="sr-only peer" />
                  <div class="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                  <span class="ml-2 text-sm font-medium text-slate-700">Bordar</span>
                </label>
              </div>
            </div>

            {/* Nuevos Campos (Técnicos) */}
            <div class="sm:col-span-2 grid grid-cols-1 gap-6 sm:grid-cols-2 mt-2">
              <div>
                <label for="fabricante" class="block text-sm font-medium text-slate-700">Fabricante</label>
                <input type="text" id="fabricante" name="fabricante" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-slate-500 focus:ring-slate-500 sm:text-sm border px-3 py-2" />
              </div>
              <div>
                <label for="composicion" class="block text-sm font-medium text-slate-700">Composición</label>
                <input type="text" id="composicion" name="composicion" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-slate-500 focus:ring-slate-500 sm:text-sm border px-3 py-2" />
              </div>
              <div>
                <label for="ancho" class="block text-sm font-medium text-slate-700">Ancho</label>
                <input type="text" id="ancho" name="ancho" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-slate-500 focus:ring-slate-500 sm:text-sm border px-3 py-2" />
              </div>
              <div>
                <label for="oz" class="block text-sm font-medium text-slate-700">OZ</label>
                <input type="text" id="oz" name="oz" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-slate-500 focus:ring-slate-500 sm:text-sm border px-3 py-2" />
              </div>
              <div>
                <label for="rinde" class="block text-sm font-medium text-slate-700">Rinde</label>
                <input type="text" id="rinde" name="rinde" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-slate-500 focus:ring-slate-500 sm:text-sm border px-3 py-2" />
              </div>
              <div>
                <label for="complemento" class="block text-sm font-medium text-slate-700">Complemento (ej: Puño)</label>
                <input type="text" id="complemento" name="complemento" class="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-slate-500 focus:ring-slate-500 sm:text-sm border px-3 py-2" />
              </div>
            </div>

            <div class="sm:col-span-2">
              <label for="image" class="block text-sm font-medium text-slate-700">Imagen</label>
              <input type="file" id="image" name="image" accept="image/*" class="mt-1 block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-slate-50 file:text-slate-700 hover:file:bg-slate-100" />
              <p class="mt-1 text-xs text-slate-400">La imagen se optimizará automáticamente a .webp (1200px) al guardar.</p>
            </div>
          </div>

          {action.value?.failed && (
            <div class="text-sm font-medium text-red-600 bg-red-50 p-3 rounded">{action.value.message}</div>
          )}

          <div class="pt-4 flex justify-end gap-3 border-t border-slate-100">
            <Link href="/admin/productos/" class="px-4 py-2 font-medium text-slate-600 hover:text-slate-800 transition">Cancelar</Link>
            <button
              type="submit"
              disabled={isCompressing.value || action.isRunning}
              class="bg-slate-900 text-white px-6 py-2 rounded-md font-medium hover:bg-slate-800 transition shadow-sm inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCompressing.value || action.isRunning ? (
                <>
                  <svg class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {isCompressing.value ? 'Optimizando...' : 'Guardando...'}
                </>
              ) : (
                'Guardar Producto'
              )}
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: 'Nuevo Producto | Textil CCE Admin',
};
