import { $, component$, useSignal, useTask$ } from '@builder.io/qwik';
import { routeAction$, routeLoader$, Form, type DocumentHead, z, zod$ } from '@builder.io/qwik-city';
import { getDb } from '../../../db/client';
import { categories } from '../../../db/schema';
import { eq } from 'drizzle-orm';
import { put } from '@vercel/blob';
import imageCompression from 'browser-image-compression';

export const useCategoriesLoader = routeLoader$(async ({ env }) => {
  const db = getDb(env);
  return await db.select().from(categories).orderBy(categories.display_order);
});

const generateSlug = (name: string) => {
  return name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, '');
};

export const useAddCategoryAction = routeAction$(async (data, requestEvent) => {
  const name = (data.name as string)?.trim();
  const slug = generateSlug(name);
  const description = (data.description as string)?.trim();
  const displayOrder = parseInt(data.displayOrder as string, 10);
  const isFeatured = data.isFeatured === 'on';

  if (!name) {
    return requestEvent.fail(400, { message: 'El nombre es obligatorio.' });
  }

  let imageUrl: string | undefined = undefined;
  try {
    if (data.categoryImage && typeof data.categoryImage === 'object' && (data.categoryImage as Blob).size > 0) {
      const file = data.categoryImage as File;
      const fileName = file.name || `cat-${Date.now()}.webp`;
      const { url } = await put(fileName, file, {
        access: 'public',
        token: requestEvent.env.get('BLOB_READ_WRITE_TOKEN'),
      });
      imageUrl = url;
    }

    const db = getDb(requestEvent.env);
    await db.insert(categories).values({
      id: crypto.randomUUID(),
      name,
      slug,
      description: description || null,
      display_order: isNaN(displayOrder) ? 0 : displayOrder,
      imageUrl: imageUrl || null,
      isFeatured,
    });
    return { success: true };
  } catch (e: any) {
    if (e.message?.includes('UNIQUE')) {
      return requestEvent.fail(409, { message: `Ya existe una categoría con ese nombre (slug: "${slug}").` });
    }
    console.error('Error creating category:', e);
    return requestEvent.fail(500, { message: 'Error interno al crear la categoría.' });
  }
}, zod$({
  name: z.string().min(1),
  description: z.string().optional(),
  displayOrder: z.string().optional(),
  isFeatured: z.string().optional(),
  categoryImage: z.any().optional(),
}));

export const useEditCategoryAction = routeAction$(async (data, requestEvent) => {
  const id = data.id as string;
  const name = (data.name as string)?.trim();
  const slug = generateSlug(name);
  const description = (data.description as string)?.trim();
  const displayOrder = parseInt(data.displayOrder as string, 10);
  const isFeatured = data.isFeatured === 'on';

  if (!id || !name) {
    return requestEvent.fail(400, { message: 'ID y Nombre son obligatorios.' });
  }

  try {
    let imageUrl: string | undefined = undefined;
    if (data.categoryImage && typeof data.categoryImage === 'object' && (data.categoryImage as Blob).size > 0) {
      const file = data.categoryImage as File;
      const fileName = file.name || `cat-${Date.now()}.webp`;
      const { url } = await put(fileName, file, {
        access: 'public',
        token: requestEvent.env.get('BLOB_READ_WRITE_TOKEN'),
      });
      imageUrl = url;
    }

    const db = getDb(requestEvent.env);

    const updateData: any = {
      name,
      slug,
      description: description || null,
      display_order: isNaN(displayOrder) ? 0 : displayOrder,
      isFeatured,
    };
    if (imageUrl !== undefined) {
      updateData.imageUrl = imageUrl;
    }

    await db.update(categories).set(updateData).where(eq(categories.id, id));
    return { success: true };
  } catch (e: any) {
    if (e.message?.includes('UNIQUE')) {
      return requestEvent.fail(409, { message: `Ya existe una categoría con ese nombre (slug "${slug}").` });
    }
    console.error('Error updating category:', e);
    return requestEvent.fail(500, { message: 'Error interno al actualizar la categoría.' });
  }
}, zod$({
  id: z.string(),
  name: z.string().min(1),
  description: z.string().optional(),
  displayOrder: z.string().optional(),
  isFeatured: z.string().optional(),
  categoryImage: z.any().optional(),
}));

export const useReorderCategoriesAction = routeAction$(async (data, requestEvent) => {
  const orderedIds = data.orderedIds as string[];
  if (!orderedIds || !Array.isArray(orderedIds)) return requestEvent.fail(400, { message: 'Formato incorrecto.' });

  try {
    const db = getDb(requestEvent.env);

    // Simple loop to update the order based on their index
    for (let i = 0; i < orderedIds.length; i++) {
      await db.update(categories).set({ display_order: i }).where(eq(categories.id, orderedIds[i]));
    }

    return { success: true };
  } catch (e: any) {
    console.error('Error reordering categories:', e);
    return requestEvent.fail(500, { message: 'Error interno al reordenar.' });
  }
}, zod$({
  orderedIds: z.array(z.string())
}));

export const useDeleteCategoryAction = routeAction$(async (data, { env, fail }) => {
  const id = data.id as string;

  if (!id) return fail(400, { message: 'ID no proporcionado.' });

  try {
    const db = getDb(env);
    await db.delete(categories).where(eq(categories.id, id));
    return { success: true };
  } catch (e: any) {
    console.error('Error deleting category:', e);
    return fail(500, { message: 'Error al eliminar la categoría. Asegúrate de que no tenga productos asociados.' });
  }
});

export const useToggleFeaturedCategoryAction = routeAction$(async (data, requestEvent) => {
  const id = data.id as string;
  const isFeatured = data.isFeatured === 'true';

  if (!id) return requestEvent.fail(400, { message: 'ID no proporcionado.' });

  try {
    const db = getDb(requestEvent.env);
    await db.update(categories).set({ isFeatured }).where(eq(categories.id, id));
    return { success: true };
  } catch (e: any) {
    console.error('Error toggling featured:', e);
    return requestEvent.fail(500, { message: 'Error interno al cambiar estado.' });
  }
}, zod$({
  id: z.string(),
  isFeatured: z.string(),
}));

export default component$(() => {
  const cats = useCategoriesLoader();
  const addAction = useAddCategoryAction();
  const editAction = useEditCategoryAction();
  const deleteAction = useDeleteCategoryAction();
  const reorderAction = useReorderCategoriesAction();
  const toggleFeaturedAction = useToggleFeaturedCategoryAction();

  const showModal = useSignal(false);
  const editingCategory = useSignal<any>(null);
  const isCompressing = useSignal(false);

  // Drag and Drop state
  const localCats = useSignal([...cats.value]);
  const draggingId = useSignal<string | null>(null);

  // Sync localCats with DB state when it loads/reloads
  useTask$(({ track }) => {
    track(() => cats.value);
    localCats.value = [...cats.value];
  });

  const handleSubmit = $(async (_e: Event, currentTarget: HTMLFormElement) => {
    if (isCompressing.value) return;
    const action = editingCategory.value ? editAction : addAction;
    if (action.isRunning) return;

    isCompressing.value = true;
    try {
      const formData = new FormData(currentTarget);
      const imageFile = formData.get('categoryImage') as File | null;

      if (imageFile && imageFile.size > 0 && imageFile.name) {
        const options = {
          maxSizeMB: 1,
          maxWidthOrHeight: 1000,
          useWebWorker: true,
          fileType: 'image/webp' as const,
          initialQuality: 0.85,
        };
        const compressedBlob = await imageCompression(imageFile, options);
        const newFileName = imageFile.name.replace(/\.[^/.]+$/, '') + '.webp';
        const compressedFile = new File([compressedBlob], newFileName, { type: 'image/webp' });
        formData.set('categoryImage', compressedFile);
      }

      await action.submit(formData);
    } catch (error) {
      console.error('Error al subir imagen:', error);
    } finally {
      isCompressing.value = false;
    }
  });

  return (
    <div class="space-y-6">
      {/* Header */}
      <div class="flex items-center justify-between">
        <h1 class="text-3xl font-bold text-slate-800">Categorías</h1>
        <button
          onClick$={() => {
            editingCategory.value = null;
            showModal.value = true;
          }}
          class="bg-slate-900 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-slate-800 transition shadow-sm flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
          </svg>
          Nueva Categoría
        </button>
      </div>

      {/* Success message */}
      {addAction.value?.success && (
        <div class="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg text-sm font-medium">
          ✅ Categoría creada exitosamente.
        </div>
      )}
      {editAction.value?.success && (
        <div class="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg text-sm font-medium">
          ✅ Categoría actualizada exitosamente.
        </div>
      )}
      {deleteAction.value?.success && (
        <div class="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg text-sm font-medium">
          ✅ Categoría eliminada exitosamente.
        </div>
      )}
      {deleteAction.value?.failed && (
        <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm font-medium">
          {deleteAction.value.message}
        </div>
      )}

      {/* Table */}
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {cats.value.length === 0 ? (
          <div class="text-center py-16 text-slate-400">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <p class="text-lg font-medium">No hay categorías aún</p>
            <p class="text-sm mt-1">Ejecuta el seed o crea una desde el botón superior.</p>
          </div>
        ) : (
          <table class="w-full text-left">
            <thead>
              <tr class="bg-slate-50 border-b border-slate-200">
                <th class="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider w-10 flex-shrink-0"></th>
                <th class="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Orden</th>
                <th class="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Nombre</th>
                <th class="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Descripción</th>
                <th class="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Destacado</th>
                <th class="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              {localCats.value.map((cat, index) => (
                <tr
                  key={cat.id}
                  class={`hover:bg-slate-50 transition cursor-move ${draggingId.value === cat.id ? 'opacity-40 blur-[1px] bg-slate-100' : ''}`}
                  draggable
                  onDragStart$={(e) => {
                    draggingId.value = cat.id;
                    if (e.dataTransfer) {
                      e.dataTransfer.effectAllowed = 'move';
                      e.dataTransfer.setData('text/plain', cat.id);
                    }
                  }}
                  onDragOver$={(e) => {
                    e.preventDefault();
                    if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
                    const overId = cat.id;
                    if (draggingId.value && draggingId.value !== overId) {
                      const items = [...localCats.value];
                      const draggedIndex = items.findIndex(item => item.id === draggingId.value);
                      const overIndex = index;

                      const [draggedItem] = items.splice(draggedIndex, 1);
                      items.splice(overIndex, 0, draggedItem);
                      localCats.value = items;
                    }
                  }}
                  onDragEnd$={() => {
                    if (draggingId.value) {
                      const orderedIds = localCats.value.map(c => c.id);
                      // We can do an optimistic local recalculation of display_order before server responds
                      localCats.value = localCats.value.map((c, i) => ({ ...c, display_order: i }));
                      reorderAction.submit({ orderedIds });
                    }
                    draggingId.value = null;
                  }}
                >
                  <td class="px-6 py-4">
                    <svg class="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd" />
                    </svg>
                  </td>
                  <td class="px-6 py-4">
                    <span class="inline-flex items-center justify-center w-8 h-8 bg-slate-100 text-slate-700 font-bold text-sm rounded-lg">
                      {index + 1}
                    </span>
                  </td>
                  <td class="px-6 py-4 font-medium text-slate-900">
                    {cat.name}
                  </td>
                  <td class="px-6 py-4 text-sm text-slate-500 max-w-xs truncate">{cat.description || '—'}</td>
                  <td class="px-6 py-4">
                    <label class="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        class="sr-only peer" 
                        checked={cat.isFeatured} 
                        onChange$={(_, el) => {
                           toggleFeaturedAction.submit({ id: cat.id, isFeatured: el.checked.toString() });
                        }} 
                      />
                      <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#6272b3]"></div>
                    </label>
                  </td>
                  <td class="px-6 py-4 flex justify-end gap-2">
                    <button
                      onClick$={() => {
                        editingCategory.value = cat;
                        showModal.value = true;
                      }}
                      class="text-[#6272b3] hover:text-[#1e2c53] font-medium text-sm transition"
                    >
                      Editar
                    </button>
                    <Form action={deleteAction} onSubmit$={(e) => { if (!confirm('¿Estás seguro de eliminar esta categoría y sus dependencias?')) e.preventDefault(); }}>
                      <input type="hidden" name="id" value={cat.id} />
                      <button
                        type="submit"
                        class="text-red-500 hover:text-red-700 font-medium text-sm transition"
                        onClick$={(e) => {
                          if (!confirm('¿Estás seguro de que deseas eliminar esta categoría?')) {
                            e.preventDefault();
                          }
                        }}
                      >
                        Eliminar
                      </button>
                    </Form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {showModal.value && (
        <div class="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            class="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick$={() => (showModal.value = false)}
          />

          {/* Modal Content */}
          <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-8">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-xl font-bold text-slate-800">{editingCategory.value ? 'Editar Categoría' : 'Nueva Categoría'}</h2>
              <button
                onClick$={() => { showModal.value = false; editingCategory.value = null; }}
                class="text-slate-400 hover:text-slate-600 transition"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {editingCategory.value ? (
              <Form
                action={editAction}
                class="space-y-5"
                preventdefault:submit
                onSubmit$={handleSubmit}
                onSubmitCompleted$={() => {
                  if (editAction.value?.success) {
                    showModal.value = false;
                    editingCategory.value = null;
                  }
                }}
              >
                <input type="hidden" name="id" value={editingCategory.value.id} />

                <div>
                  <label for="name" class="block text-sm font-medium text-slate-700 mb-1">Nombre</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={editingCategory.value.name}
                    required
                    placeholder="Ej: Telas de Moda"
                    class="block w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm shadow-sm focus:border-slate-500 focus:ring-1 focus:ring-slate-500 transition"
                  />
                </div>

                <div class="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isFeatured"
                    name="isFeatured"
                    checked={editingCategory.value.isFeatured}
                    class="w-5 h-5 rounded text-slate-900 border-slate-300 focus:ring-slate-500 transition"
                  />
                  <label for="isFeatured" class="text-sm font-medium text-slate-700">Destacar Categoría</label>
                </div>

                <div>
                  <label for="categoryImage" class="block text-sm font-medium text-slate-700 mb-1">Imagen de presentación</label>
                  {editingCategory.value.imageUrl && (
                    <div class="mb-3">
                      <img src={editingCategory.value.imageUrl} class="rounded-lg border border-slate-200 max-h-40 object-cover" />
                    </div>
                  )}
                  <input
                    type="file"
                    id="categoryImage"
                    name="categoryImage"
                    accept="image/*"
                    class="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 transition"
                  />
                </div>

                <div>
                  <label for="description" class="block text-sm font-medium text-slate-700 mb-1">Descripción (Opcional)</label>
                  <textarea
                    id="description"
                    name="description"
                    value={editingCategory.value.description || ''}
                    rows={3}
                    placeholder="Breve descripción de la categoría..."
                    class="block w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm shadow-sm focus:border-slate-500 focus:ring-1 focus:ring-slate-500 transition"
                  />
                </div>

                <div>
                  <label for="displayOrder" class="block text-sm font-medium text-slate-700 mb-1">Orden de visualización</label>
                  <input
                    type="number"
                    id="displayOrder"
                    name="displayOrder"
                    value={editingCategory.value.display_order ?? ''}
                    min={0}
                    placeholder="0"
                    class="block w-24 rounded-lg border border-slate-300 px-3 py-2.5 text-sm shadow-sm focus:border-slate-500 focus:ring-1 focus:ring-slate-500 transition"
                  />
                </div>

                {editAction.value?.failed && (
                  <div class="text-sm font-medium text-red-600 bg-red-50 border border-red-200 p-3 rounded-lg">
                    {editAction.value.message}
                  </div>
                )}

                <div class="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick$={() => { showModal.value = false; editingCategory.value = null; }}
                    class="px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-800 transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isCompressing.value || editAction.isRunning}
                    class="bg-slate-900 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-800 transition shadow-sm disabled:opacity-50 inline-flex items-center gap-2"
                  >
                    {isCompressing.value || editAction.isRunning ? 'Guardando...' : 'Actualizar'}
                  </button>
                </div>
              </Form>
            ) : (
              <Form
                action={addAction}
                class="space-y-5"
                preventdefault:submit
                onSubmit$={handleSubmit}
                onSubmitCompleted$={() => {
                  if (addAction.value?.success) {
                    showModal.value = false;
                  }
                }}
              >
                <div>
                  <label for="name" class="block text-sm font-medium text-slate-700 mb-1">Nombre</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    placeholder="Ej: Telas de Moda"
                    class="block w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm shadow-sm focus:border-slate-500 focus:ring-1 focus:ring-slate-500 transition"
                  />
                </div>

                <div class="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isFeatured"
                    name="isFeatured"
                    class="w-5 h-5 rounded text-slate-900 border-slate-300 focus:ring-slate-500 transition"
                  />
                  <label for="isFeatured" class="text-sm font-medium text-slate-700">Destacar Categoría</label>
                </div>

                <div>
                  <label for="categoryImage" class="block text-sm font-medium text-slate-700 mb-1">Imagen de presentación</label>
                  <input
                    type="file"
                    id="categoryImage"
                    name="categoryImage"
                    accept="image/*"
                    class="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 transition"
                  />
                </div>

                <div>
                  <label for="description" class="block text-sm font-medium text-slate-700 mb-1">Descripción (Opcional)</label>
                  <textarea
                    id="description"
                    name="description"
                    rows={3}
                    placeholder="Breve descripción de la categoría..."
                    class="block w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm shadow-sm focus:border-slate-500 focus:ring-1 focus:ring-slate-500 transition"
                  />
                </div>

                <div>
                  <label for="displayOrder" class="block text-sm font-medium text-slate-700 mb-1">Orden de visualización</label>
                  <input
                    type="number"
                    id="displayOrder"
                    name="displayOrder"
                    min={0}
                    placeholder="0"
                    class="block w-24 rounded-lg border border-slate-300 px-3 py-2.5 text-sm shadow-sm focus:border-slate-500 focus:ring-1 focus:ring-slate-500 transition"
                  />
                </div>

                {addAction.value?.failed && (
                  <div class="text-sm font-medium text-red-600 bg-red-50 border border-red-200 p-3 rounded-lg">
                    {addAction.value.message}
                  </div>
                )}

                <div class="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick$={() => { showModal.value = false; }}
                    class="px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-800 transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isCompressing.value || addAction.isRunning}
                    class="bg-slate-900 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-800 transition shadow-sm disabled:opacity-50 inline-flex items-center gap-2"
                  >
                    {isCompressing.value || addAction.isRunning ? 'Creando...' : 'Crear Categoría'}
                  </button>
                </div>
              </Form>
            )}
          </div>
        </div>
      )}
    </div>
  );
});

export const head: DocumentHead = {
  title: 'Categorías | Textil CCE Admin',
};
