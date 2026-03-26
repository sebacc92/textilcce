import type { RequestHandler } from '@builder.io/qwik-city';

export const onRequest: RequestHandler = ({ url, cookie, redirect }) => {
  // Ignorar assets estáticos si llegaran a pasar por aquí
  if (url.pathname.match(/\.(png|jpg|jpeg|gif|css|js|ico|svg|webp)$/i)) {
    return;
  }

  // Proteger rutas que empiezan con /admin
  if (url.pathname.startsWith('/admin')) {
    const hasSession = cookie.has('auth_session');

    // Si intenta acceder a login
    if (url.pathname.startsWith('/admin/login')) {
      if (hasSession) {
        throw redirect(302, '/admin/');
      }
      return;
    }

    // Cualquier otra ruta de admin requiere sesión
    if (!hasSession) {
      throw redirect(302, '/admin/login/');
    }
  }
};
