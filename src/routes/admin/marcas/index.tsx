import { component$ } from '@builder.io/qwik';
import { routeLoader$, routeAction$, Form, Link } from '@builder.io/qwik-city';
import { getDb } from '../../../db/client';
import { brands } from '../../../db/schema';
import { desc, eq } from 'drizzle-orm';

export const useBrandsLoader = routeLoader$(async ({ env }) => {
  const db = getDb(env);
  return await db.select().from(brands).orderBy(desc(brands.createdAt));
});

export const useDeleteBrandAction = routeAction$(async (data, { env, fail }) => {
  const id = data.id as string;
  if (!id) return fail(400, { message: 'ID no proporcionado.' });

  try {
    const db = getDb(env);
    await db.delete(brands).where(eq(brands.id, id));
    return { success: true };
  } catch (err) {
    console.error('Error deleting brand', err);
    return fail(500, { message: 'Error interno al eliminar la marca.' });
  }
});

export default component$(() => {
  const brandsList = useBrandsLoader();
  const deleteAction = useDeleteBrandAction();

  return (
    <div class="space-y-6">
      {deleteAction.value?.success && (
        <div class="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg text-sm font-medium">
          ✅ Marca eliminada exitosamente.
        </div>
      )}
      {deleteAction.value?.failed && (
        <div class="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm font-medium">
          ❌ {deleteAction.value.message}
        </div>
      )}

      <div class="flex items-center justify-between">
        <h1 class="text-3xl font-bold text-slate-800">Marcas</h1>
        <Link 
          href="/admin/marcas/new/" 
          class="bg-slate-900 text-white px-4 py-2 rounded-md font-medium hover:bg-slate-800 transition"
        >
          + Nueva Marca
        </Link>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table class="w-full text-left text-sm text-slate-600">
          <thead class="bg-slate-50 border-b border-slate-200 text-slate-700">
            <tr>
              <th class="px-6 py-4 font-medium w-24">Logo</th>
              <th class="px-6 py-4 font-medium">Nombre</th>
              <th class="px-6 py-4 font-medium">Orden</th>
              <th class="px-6 py-4 font-medium">Estado</th>
              <th class="px-6 py-4 font-medium text-right">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            {brandsList.value.length === 0 ? (
              <tr>
                <td colSpan={5} class="px-6 py-8 text-center text-slate-500">
                  No hay marcas registradas. Añade los logos de tus clientes o fabricantes.
                </td>
              </tr>
            ) : (
              brandsList.value.map((b: any) => (
                <tr key={b.id} class="hover:bg-slate-50">
                  <td class="px-6 py-4">
                    <div class="h-10 w-20 rounded border border-slate-200 bg-white p-1 flex items-center justify-center overflow-hidden">
                      <img src={b.imageUrl} alt={b.name} class="max-h-full max-w-full object-contain" />
                    </div>
                  </td>
                  <td class="px-6 py-4 font-medium text-slate-900">{b.name}</td>
                  <td class="px-6 py-4 text-slate-500">{b.display_order}</td>
                  <td class="px-6 py-4">
                    <span class={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${b.isActive ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'}`}>
                      {b.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td class="px-6 py-4 flex justify-end gap-3 items-center">
                    <Link href={`/admin/marcas/${b.id}/edit/`} class="text-[#6272b3] hover:text-[#1e2c53] font-medium text-sm transition">Editar</Link>
                    <Form action={deleteAction} onSubmit$={(e) => { if(!confirm('¿Estás seguro de eliminar esta marca?')) e.preventDefault(); }}>
                      <input type="hidden" name="id" value={b.id} />
                      <button
                        type="submit"
                        class="text-red-500 hover:text-red-700 font-medium text-sm transition"
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
