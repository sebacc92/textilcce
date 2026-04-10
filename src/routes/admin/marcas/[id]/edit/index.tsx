import { $, component$, useSignal } from '@builder.io/qwik';
import { routeAction$, Form, routeLoader$, Link, z, zod$, type DocumentHead } from '@builder.io/qwik-city';
import { getDb } from '../../../../../db/client';
import { brands } from '../../../../../db/schema';
import { put } from '@vercel/blob';
import imageCompression from 'browser-image-compression';
import { eq } from 'drizzle-orm';

export const useBrandLoader = routeLoader$(async ({ env, params, redirect }) => {
  const db = getDb(env);
  const brand = await db.select().from(brands).where(eq(brands.id, params.id)).get();
  if (!brand) {
    throw redirect(302, '/admin/marcas/');
  }
  return brand;
});

export const useEditBrandAction = routeAction$(
  async (data, requestEvent) => {
    try {
      let imageUrl: string | null = null;

      if (data.image && typeof data.image === 'object' && (data.image as Blob).size > 0) {
        const file = data.image as File;
        const fileName = file.name || `marca-${Date.now()}.webp`;
        const { url } = await put(`brands/${fileName}`, file, {
          access: 'public',
          token: requestEvent.env.get('BLOB_READ_WRITE_TOKEN'),
        });
        imageUrl = url;
      }

      const db = getDb(requestEvent.env);
      const isActive = data.isActive === 'on' || data.isActive === true;

      const updateData: any = {
        name: data.name,
        display_order: data.displayOrder ? parseInt(data.displayOrder.toString(), 10) : 0,
        isActive,
      };

      if (imageUrl) {
        updateData.imageUrl = imageUrl;
      }

      await db.update(brands).set(updateData).where(eq(brands.id, requestEvent.params.id));

      throw requestEvent.redirect(302, '/admin/marcas/');
    } catch (e: any) {
      if (e.status === 302) throw e;
      console.error(e);
      return requestEvent.fail(500, { message: e.message || 'Error interno al procesar el formulario' });
    }
  },
  zod$({
    name: z.string().min(1, 'El nombre es obligatorio'),
    displayOrder: z.union([z.string(), z.number()]).optional(),
    image: z.any().optional(),
    isActive: z.union([z.string(), z.boolean()]).optional(),
  }),
);

export default component$(() => {
  const action = useEditBrandAction();
  const brand = useBrandLoader();
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
          maxWidthOrHeight: 800,
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
      console.error('Error al comprimir/subir logo:', error);
    } finally {
      isCompressing.value = false;
    }
  });

  return (
    <div class="max-w-2xl mx-auto space-y-6">
      <div class="flex items-center gap-4">
        <Link href="/admin/marcas/" class="text-slate-400 hover:text-slate-800 transition">← Volver</Link>
        <h1 class="text-3xl font-bold text-slate-800">Editar Marca</h1>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        <Form
          action={action}
          class="space-y-6"
          spaReset={false}
          preventdefault:submit
          onSubmit$={handleSubmit}
        >
          <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div class="sm:col-span-2">
              <label for="name" class="block text-sm font-medium text-slate-700">Nombre de la Marca</label>
              <input type="text" id="name" name="name" value={brand.value.name} required class="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-slate-500 focus:ring-slate-500 sm:text-sm border px-3 py-2" />
            </div>

            <div class="sm:col-span-2">
              <label for="image" class="block text-sm font-medium text-slate-700">Logo</label>
              {brand.value.imageUrl && (
                <div class="mt-4 mb-6">
                  <p class="text-xs text-slate-500 mb-2 uppercase tracking-wider font-semibold">Logo actual:</p>
                  <div class="h-24 w-40 rounded-lg border border-slate-200 bg-white p-2 flex items-center justify-center">
                    <img src={brand.value.imageUrl} alt={brand.value.name} class="max-h-full max-w-full object-contain" />
                  </div>
                </div>
              )}
              <input type="file" id="image" name="image" accept="image/*" class="mt-1 block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-slate-50 file:text-slate-700 hover:file:bg-slate-100" />
              <p class="mt-1 text-xs text-slate-400">Si seleccionas una nueva imagen, reemplazará al logo actual.</p>
            </div>

            <div class="sm:col-span-1">
              <label for="displayOrder" class="block text-sm font-medium text-slate-700">Orden de visualización</label>
              <input type="number" id="displayOrder" name="displayOrder" value={brand.value.display_order} class="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-slate-500 focus:ring-slate-500 sm:text-sm border px-3 py-2" />
            </div>

            <div class="sm:col-span-2 mt-2">
              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" name="isActive" class="sr-only peer" checked={brand.value.isActive || false} />
                <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-slate-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                <span class="ml-3 text-sm font-medium text-slate-700">Marca Activa (Visible en el inicio)</span>
              </label>
            </div>
          </div>

          {action.value?.failed && (
            <div class="text-sm font-medium text-red-600 bg-red-50 p-3 rounded">{action.value.message}</div>
          )}

          <div class="pt-4 flex justify-end gap-3 border-t border-slate-100">
            <Link href="/admin/marcas/" class="px-4 py-2 font-medium text-slate-600 hover:text-slate-800 transition">Cancelar</Link>
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
                'Guardar Cambios'
              )}
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: 'Editar Marca | Textil CCE Admin',
};
