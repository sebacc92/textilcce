import { component$ } from '@builder.io/qwik';
import { routeLoader$, routeAction$, Form, Link } from '@builder.io/qwik-city';
import { getDb } from '../../../db/client';
import { products, categories } from '../../../db/schema';
import { desc, eq } from 'drizzle-orm';

export const useProductsLoader = routeLoader$(async ({ env }) => {
  const db = getDb(env);
  const rows = await db
    .select({
      id: products.id,
      name: products.name,
      isActive: products.isActive,
      categoryName: categories.name,
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .orderBy(desc(products.createdAt));
  
  return rows;
});

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
          class="bg-slate-900 text-white px-4 py-2 rounded-md font-medium hover:bg-slate-800 transition"
        >
          + Nuevo Producto
        </Link>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table class="w-full text-left text-sm text-slate-600">
          <thead class="bg-slate-50 border-b border-slate-200 text-slate-700">
            <tr>
              <th class="px-6 py-4 font-medium">Nombre</th>
              <th class="px-6 py-4 font-medium">Categoría</th>
              <th class="px-6 py-4 font-medium">Estado</th>
              <th class="px-6 py-4 font-medium text-right">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            {productsList.value.length === 0 ? (
              <tr>
                <td colSpan={4} class="px-6 py-8 text-center text-slate-500">
                  No hay productos registrados. Crea uno nuevo.
                </td>
              </tr>
            ) : (
              productsList.value.map((p: any) => (
                <tr key={p.id} class="hover:bg-slate-50">
                  <td class="px-6 py-4 font-medium text-slate-900">{p.name}</td>
                  <td class="px-6 py-4">{p.categoryName || 'Sin categoría'}</td>
                  <td class="px-6 py-4">
                    <span class={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${p.isActive ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'}`}>
                      {p.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td class="px-6 py-4 flex justify-end gap-3 items-center">
                    <Link href={`/admin/productos/${p.id}/edit/`} class="text-[#6272b3] hover:text-[#1e2c53] font-medium text-sm transition">Editar</Link>
                    <Form action={deleteAction}>
                      <input type="hidden" name="id" value={p.id} />
                      <button
                        type="submit"
                        class="text-red-500 hover:text-red-700 font-medium text-sm transition"
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
