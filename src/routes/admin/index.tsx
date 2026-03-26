import { component$ } from '@builder.io/qwik';
import { routeLoader$, type DocumentHead } from '@builder.io/qwik-city';
import { getDb } from '../../db/client';
import { products, categories } from '../../db/schema';
import { count } from 'drizzle-orm';

export const useAdminStats = routeLoader$(async ({ env }) => {
  const db = getDb(env);
  const [totalProducts] = await db.select({ value: count() }).from(products);
  const [totalCategories] = await db.select({ value: count() }).from(categories);
  
  return {
    products: totalProducts.value,
    categories: totalCategories.value,
  };
});

export default component$(() => {
  const stats = useAdminStats();

  return (
    <div class="space-y-6">
      <h1 class="text-3xl font-bold text-slate-800">Dashboard</h1>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 class="text-sm font-medium text-slate-500 mb-1">Total Productos</h3>
          <p class="text-3xl font-bold text-slate-900">{stats.value.products}</p>
        </div>
        
        <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 class="text-sm font-medium text-slate-500 mb-1">Categorías Activas</h3>
          <p class="text-3xl font-bold text-slate-900">{stats.value.categories}</p>
        </div>
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: 'Panel de Control | Textil CCE',
};
