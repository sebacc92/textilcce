import { component$, Slot } from '@builder.io/qwik';
import { routeAction$, Link } from '@builder.io/qwik-city';

export const useLogoutAction = routeAction$((_, { cookie, redirect }) => {
  cookie.delete('auth_session', { path: '/' });
  throw redirect(302, '/admin/login/');
});

export default component$(() => {
  const logoutAction = useLogoutAction();

  return (
    <div class="flex h-screen bg-slate-100 font-sans text-slate-900">
      {/* Sidebar */}
      <aside class="w-64 bg-slate-900 text-white flex flex-col">
        <div class="p-6">
          <h2 class="text-xl font-bold tracking-tight">Textil CCE Admin</h2>
        </div>
        <nav class="flex-1 px-4 space-y-2">
          <Link href="/admin/" class="block px-4 py-2 rounded-md hover:bg-slate-800 transition text-lg">Dashboard</Link>
          <Link href="/admin/contenido/" class="block px-4 py-2 rounded-md bg-[#6272b3]/20 text-[#6272b3] font-semibold transition text-lg">Contenido</Link>
          <Link href="/admin/categorias/" class="block px-4 py-2 rounded-md hover:bg-slate-800 transition text-lg">Categorías</Link>
          <Link href="/admin/productos/" class="block px-4 py-2 rounded-md hover:bg-slate-800 transition text-lg">Productos</Link>
          <div class="border-t border-slate-700 my-4"></div>
          <Link href="/admin/ajustes/" class="block px-4 py-2 rounded-md hover:bg-slate-800 transition text-lg">Ajustes</Link>
          <a href="/" target="_blank" class="block px-4 py-2 rounded-md hover:bg-slate-800 transition text-slate-400 mt-4 text-base">Ver Sitio Público ↗</a>

        </nav>
      </aside>

      {/* Main Content */}
      <div class="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header class="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8">
          <div class="font-medium text-slate-600">Panel de Control</div>
          <button 
            onClick$={() => logoutAction.submit()}
            class="text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-md transition"
          >
            Cerrar Sesión
          </button>
        </header>

        {/* Dynamic Outlet */}
        <main class="flex-1 overflow-auto p-8">
          <Slot />
        </main>
      </div>
    </div>
  );
});
