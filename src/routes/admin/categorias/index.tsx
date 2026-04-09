import { component$, useSignal } from '@builder.io/qwik';
import { routeAction$, routeLoader$, Form, type DocumentHead } from '@builder.io/qwik-city';
import { getDb } from '../../../db/client';
import { categories } from '../../../db/schema';
import { eq } from 'drizzle-orm';

export const useCategoriesLoader = routeLoader$(async ({ env }) => {
  const db = getDb(env);
  return await db.select().from(categories).orderBy(categories.display_order);
});

export const useAddCategoryAction = routeAction$(async (_, { request, env, fail }) => {
  const formData = await request.formData();
  const name = (formData.get('name') as string)?.trim();
  const slug = (formData.get('slug') as string)?.trim();
  const description = (formData.get('description') as string)?.trim();
  const displayOrder = parseInt(formData.get('displayOrder') as string, 10);

  if (!name || !slug) {
    return fail(400, { message: 'Nombre y Slug son obligatorios.' });
  }

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return fail(400, { message: 'El slug solo puede contener letras minúsculas, números y guiones.' });
  }

  try {
    const db = getDb(env);
    await db.insert(categories).values({
      id: crypto.randomUUID(),
      name,
      slug,
      description: description || null,
      display_order: isNaN(displayOrder) ? 0 : displayOrder,
    });
    return { success: true };
  } catch (e: any) {
    if (e.message?.includes('UNIQUE')) {
      return fail(409, { message: `Ya existe una categoría con el slug "${slug}".` });
    }
    console.error('Error creating category:', e);
    return fail(500, { message: 'Error interno al crear la categoría.' });
  }
});

export const useEditCategoryAction = routeAction$(async (_, { request, env, fail }) => {
  const formData = await request.formData();
  const id = formData.get('id') as string;
  const name = (formData.get('name') as string)?.trim();
  const slug = (formData.get('slug') as string)?.trim();
  const description = (formData.get('description') as string)?.trim();
  const displayOrder = parseInt(formData.get('displayOrder') as string, 10);

  if (!id || !name || !slug) {
    return fail(400, { message: 'ID, Nombre y Slug son obligatorios.' });
  }

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return fail(400, { message: 'El slug solo puede contener letras minúsculas, números y guiones.' });
  }

  try {
    const db = getDb(env);
    await db.update(categories).set({
      name,
      slug,
      description: description || null,
      display_order: isNaN(displayOrder) ? 0 : displayOrder,
    }).where(eq(categories.id, id));
    return { success: true };
  } catch (e: any) {
    if (e.message?.includes('UNIQUE')) {
      return fail(409, { message: `Ya existe una categoría con el slug "${slug}".` });
    }
    console.error('Error updating category:', e);
    return fail(500, { message: 'Error interno al actualizar la categoría.' });
  }
});

export const useDeleteCategoryAction = routeAction$(async (_, { request, env, fail }) => {
  const formData = await request.formData();
  const id = formData.get('id') as string;
  
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

export default component$(() => {
  const cats = useCategoriesLoader();
  const addAction = useAddCategoryAction();
  const editAction = useEditCategoryAction();
  const deleteAction = useDeleteCategoryAction();
  const showModal = useSignal(false);
  const editingCategory = useSignal<any>(null);

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
                <th class="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Orden</th>
                <th class="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Nombre</th>
                <th class="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Slug</th>
                <th class="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Descripción</th>
                <th class="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              {cats.value.map((cat) => (
                <tr key={cat.id} class="hover:bg-slate-50 transition">
                  <td class="px-6 py-4">
                    <span class="inline-flex items-center justify-center w-8 h-8 bg-slate-100 text-slate-700 font-bold text-sm rounded-lg">
                      {cat.display_order}
                    </span>
                  </td>
                  <td class="px-6 py-4 font-medium text-slate-900">{cat.name}</td>
                  <td class="px-6 py-4">
                    <code class="text-sm bg-slate-100 text-slate-600 px-2 py-0.5 rounded">{cat.slug}</code>
                  </td>
                  <td class="px-6 py-4 text-sm text-slate-500 max-w-xs truncate">{cat.description || '—'}</td>
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
                    <Form action={deleteAction}>
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

            <Form
              action={editingCategory.value ? editAction : addAction}
              class="space-y-5"
              onSubmitCompleted$={() => {
                if (addAction.value?.success || editAction.value?.success) {
                  showModal.value = false;
                  editingCategory.value = null;
                }
              }}
              spaReset
            >
              {editingCategory.value && (
                <input type="hidden" name="id" value={editingCategory.value.id} />
              )}
              <div>
                <label for="name" class="block text-sm font-medium text-slate-700 mb-1">Nombre</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={editingCategory.value?.name || ''}
                  required
                  placeholder="Ej: Telas de Moda"
                  class="block w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm shadow-sm focus:border-slate-500 focus:ring-1 focus:ring-slate-500 transition"
                />
              </div>

              <div>
                <label for="slug" class="block text-sm font-medium text-slate-700 mb-1">Slug</label>
                <input
                  type="text"
                  id="slug"
                  name="slug"
                  value={editingCategory.value?.slug || ''}
                  required
                  placeholder="Ej: telas-de-moda"
                  class="block w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm shadow-sm focus:border-slate-500 focus:ring-1 focus:ring-slate-500 transition font-mono"
                />
                <p class="mt-1 text-xs text-slate-400">Solo minúsculas, números y guiones.</p>
              </div>

              <div>
                <label for="description" class="block text-sm font-medium text-slate-700 mb-1">Descripción (Opcional)</label>
                <textarea
                  id="description"
                  name="description"
                  value={editingCategory.value?.description || ''}
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
                  value={editingCategory.value?.display_order ?? ''}
                  min={0}
                  placeholder="0"
                  class="block w-24 rounded-lg border border-slate-300 px-3 py-2.5 text-sm shadow-sm focus:border-slate-500 focus:ring-1 focus:ring-slate-500 transition"
                />
              </div>

              {(addAction.value?.failed || editAction.value?.failed) && (
                <div class="text-sm font-medium text-red-600 bg-red-50 border border-red-200 p-3 rounded-lg">
                  {addAction.value?.message || editAction.value?.message}
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
                  class="bg-slate-900 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-800 transition shadow-sm"
                >
                  {editingCategory.value ? 'Actualizar' : 'Crear Categoría'}
                </button>
              </div>
            </Form>
          </div>
        </div>
      )}
    </div>
  );
});

export const head: DocumentHead = {
  title: 'Categorías | Textil CCE Admin',
};
