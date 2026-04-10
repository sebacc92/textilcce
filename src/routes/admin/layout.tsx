import { component$, Slot } from '@builder.io/qwik';
import { routeAction$, Link, routeLoader$, useLocation } from '@builder.io/qwik-city';
import { getDb } from '../../db/client';
import { users } from '../../db/schema';
import { eq } from 'drizzle-orm';

export const useLogoutAction = routeAction$((_, { cookie, redirect }) => {
  cookie.delete('auth_session', { path: '/' });
  throw redirect(302, '/admin/login/');
});

export const useAdminUserResolver = routeLoader$(async ({ env, cookie }) => {
  const userId = cookie.get('auth_session')?.value;
  if (!userId) return null;

  const db = getDb(env);
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  return user || null;
});

export default component$(() => {
  const logoutAction = useLogoutAction();
  const currentUser = useAdminUserResolver();
  const location = useLocation();

  const navItems = [
    { label: 'Dashboard', href: '/admin/' },
    { label: 'Contenido', href: '/admin/contenido/' },
    { label: 'Categorías', href: '/admin/categorias/' },
    { label: 'Productos', href: '/admin/productos/' },
    { label: 'Marcas', href: '/admin/marcas/' },
    { label: 'Ajustes', href: '/admin/ajustes/' },
    { label: 'Usuarios', href: '/admin/usuarios/' },
    { label: 'Chats de IA', href: '/admin/chats/' },
  ];

  return (
    <div class="flex h-screen bg-slate-100 font-sans text-slate-900">
      {/* Sidebar */}
      <aside class="w-64 bg-slate-900 text-white flex flex-col">
        <div class="p-6">
          <h2 class="text-xl font-bold tracking-tight">Textil CCE Admin</h2>
        </div>
        <nav class="flex-1 px-4 space-y-2">
          {navItems.map((item) => {
            const isActive = location.url.pathname === item.href || (item.href !== '/admin/' && location.url.pathname.startsWith(item.href));
            
            return (
              <Link 
                key={item.href} 
                href={item.href} 
                class={[
                  "block px-4 py-2 rounded-md transition text-lg w-full text-left",
                  isActive ? "bg-[#6272b3]/20 text-[#6272b3] font-semibold" : "hover:bg-slate-800"
                ]}
              >
                {item.label}
              </Link>
            );
          })}
          
          <div class="border-t border-slate-700 my-4"></div>
          <a href="/" target="_blank" class="block px-4 py-2 rounded-md hover:bg-slate-800 transition text-slate-400 mt-4 text-base">Ver Sitio Público ↗</a>
        </nav>
      </aside>

      {/* Main Content */}
      <div class="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header class="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8">
          <div class="font-medium text-slate-600">
            {currentUser.value ? `¡Hola, ${currentUser.value.username}!` : 'Panel de Control'}
          </div>
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
