import { component$, useSignal, useTask$ } from '@builder.io/qwik';
import { routeLoader$, routeAction$, Form, Link, z, zod$ } from '@builder.io/qwik-city';
import { getDb } from '../../../db/client';
import { products, categories } from '../../../db/schema';
import { desc, eq, asc } from 'drizzle-orm';

export const useProductsLoader = routeLoader$(async ({ env }) => {
  const db = getDb(env);
  const rows = await db
    .select({
      id: products.id,
      name: products.name,
      isActive: products.isActive,
      colores: products.colores,
      categoryName: categories.name,
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .orderBy(asc(products.display_order), desc(products.createdAt));

  return rows;
});

export const useReorderProductsAction = routeAction$(async (data, requestEvent) => {
  const orderedIds = data.orderedIds as string[];
  if (!orderedIds || !Array.isArray(orderedIds)) return requestEvent.fail(400, { message: 'Formato incorrecto.' });

  try {
    const db = getDb(requestEvent.env);

    // Simple loop to update the order based on their index
    for (let i = 0; i < orderedIds.length; i++) {
      await db.update(products).set({ display_order: i }).where(eq(products.id, orderedIds[i]));
    }

    return { success: true };
  } catch (e: any) {
    console.error('Error reordering products:', e);
    return requestEvent.fail(500, { message: 'Error interno al reordenar.' });
  }
}, zod$({
  orderedIds: z.array(z.string())
}));

export const useDeleteProductAction = routeAction$(async (data, { env, fail }) => {
  const id = data.id as string;
  if (!id) return fail(400, { message: 'ID no proporcionado.' });

  try {
    const db = getDb(env);
    await db.delete(products).where(eq(products.id, id));
    return { success: true };
  } catch (err) {
    console.error('Error deleting product', err);
    return fail(500, { message: 'Error interno al eliminar el producto.' });
  }
});

export default component$(() => {
  const productsList = useProductsLoader();
  const deleteAction = useDeleteProductAction();
  const reorderAction = useReorderProductsAction();

  // Drag and drop state
  const localProducts = useSignal([...productsList.value]);
  const draggingId = useSignal<string | null>(null);

  useTask$(({ track }) => {
    track(() => productsList.value);
    localProducts.value = [...productsList.value];
  });

  return (
    <div class="space-y-6">
      {deleteAction.value?.success && (
        <div class="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg text-sm font-medium">
          ✅ Producto eliminado exitosamente.
        </div>
      )}
      {deleteAction.value?.failed && (
        <div class="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm font-medium">
          ❌ {deleteAction.value.message}
        </div>
      )}

      <div class="flex items-center justify-between">
        <h1 class="text-3xl font-bold text-slate-800">Productos</h1>
        <Link
          href="/admin/productos/new/"
          class="bg-slate-900 text-white px-4 py-2 rounded-md font-medium hover:bg-slate-800 transition shadow-sm flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Nuevo Producto
        </Link>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table class="w-full text-left text-sm text-slate-600">
          <thead class="bg-slate-50 border-b border-slate-200 text-slate-700">
            <tr>
              <th class="px-6 py-4 font-semibold w-10 flex-shrink-0"></th>
              <th class="px-6 py-4 font-semibold">Orden</th>
              <th class="px-6 py-4 font-semibold">Nombre</th>
              <th class="px-6 py-4 font-semibold">Categoría</th>
              <th class="px-6 py-4 font-semibold">Colores</th>
              <th class="px-6 py-4 font-semibold">Estado</th>
              <th class="px-6 py-4 font-semibold text-right">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            {localProducts.value.length === 0 ? (
              <tr>
                <td colSpan={7} class="px-6 py-8 text-center text-slate-500">
                  No hay productos registrados. Crea uno nuevo.
                </td>
              </tr>
            ) : (
              localProducts.value.map((p: any, index) => (
                <tr
                  key={p.id}
                  class={`hover:bg-slate-50 transition cursor-move ${draggingId.value === p.id ? 'opacity-40 blur-[1px] bg-slate-100' : ''}`}
                  draggable
                  onDragStart$={(e) => {
                    draggingId.value = p.id;
                    if (e.dataTransfer) {
                      e.dataTransfer.effectAllowed = 'move';
                      e.dataTransfer.setData('text/plain', p.id);
                    }
                  }}
                  onDragOver$={(e) => {
                    e.preventDefault();
                    if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
                    const overId = p.id;
                    if (draggingId.value && draggingId.value !== overId) {
                      const items = [...localProducts.value];
                      const draggedIndex = items.findIndex((item: any) => item.id === draggingId.value);
                      const overIndex = index;

                      const [draggedItem] = items.splice(draggedIndex, 1);
                      items.splice(overIndex, 0, draggedItem);
                      localProducts.value = items;
                    }
                  }}
                  onDragEnd$={() => {
                    if (draggingId.value) {
                      const orderedIds = localProducts.value.map((c: any) => c.id);
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
                    <span class="inline-flex items-center justify-center w-8 h-8 bg-slate-100 text-slate-700 font-bold text-xs rounded">
                      {index + 1}
                    </span>
                  </td>
                  <td class="px-6 py-4 font-medium text-slate-900">{p.name}</td>
                  <td class="px-6 py-4">{p.categoryName || 'Sin categoría'}</td>
                  <td class="px-6 py-4 text-slate-500">
                    {p.colores && p.colores.length > 0
                      ? <span class="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs font-medium">{p.colores.length} colores</span>
                      : <span class="text-xs italic text-slate-400">Ninguno</span>
                    }
                  </td>
                  <td class="px-6 py-4">
                    <span class={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${p.isActive ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'}`}>
                      {p.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td class="px-6 py-4 flex justify-end gap-3 items-center">
                    <Link href={`/admin/productos/${p.id}/edit/`} class="text-[#6272b3] hover:text-[#1e2c53] font-medium transition">Editar</Link>
                    <Form action={deleteAction} onSubmit$={(e) => { if (!confirm('¿Estás seguro de eliminar este producto?')) e.preventDefault(); }}>
                      <input type="hidden" name="id" value={p.id} />
                      <button
                        type="submit"
                        class="text-red-500 hover:text-red-700 font-medium transition"
                        onClick$={(e) => {
                          if (!confirm(`¿Seguro que deseas eliminar el producto "${p.name}"?`)) {
                            e.preventDefault();
                          }
                        }}
                      >
                        Eliminar
                      </button>
                    </Form>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
});
