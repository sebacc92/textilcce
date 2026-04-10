import type { RequestHandler } from '@builder.io/qwik-city';
import cityPlan from '@qwik-city-plan';
import { createSitemap, type SitemapEntry } from './create-sitemap';

export const onGet: RequestHandler = async ({ send, url }) => {
  const origin = 'https://www.textilcce.com.ar';

  // Extraemos las rutas estáticas desde @qwik-city-plan
  // structure of a route in Qwik City Plan is typically [RegExp, loaders, routeName?, originalPathname]
  const availableRoutes = cityPlan.routes
    .map((route: any) => {
      // Find the string that represents the route path (starts with /)
      return route.find((r: any) => typeof r === 'string' && r.startsWith('/'));
    })
    .filter((path: string | undefined): path is string => !!path);

  // Filtramos las rutas innecesarias (ej. layouts ocultos, api, admin, rutas dinámicas genéricas con brackets)
  const renderableRoutes = availableRoutes.filter(
    (route) =>
      !route.includes('/admin') &&
      !route.includes('/api') &&
      !route.includes('/_') &&
      !route.includes('[')
  );

  // Nos aseguramos de agregar rutas importantes si no aparecieron y asignamos prioridades
  const sitemapEntries: SitemapEntry[] = renderableRoutes.map((route) => {
    let priority = 0.5;
    let changefreq: SitemapEntry['changefreq'] = 'weekly';

    if (route === '/') {
      priority = 1.0;
      changefreq = 'daily';
    } else if (route === '/catalogo/') {
      priority = 0.9;
      changefreq = 'daily';
    } else if (route === '/mayoristas/') {
      priority = 0.8;
      changefreq = 'monthly';
    } else if (route === '/nosotros/') {
      priority = 0.7;
      changefreq = 'monthly';
    } else if (route === '/contacto/') {
      priority = 0.8;
      changefreq = 'yearly';
    }

    return {
      loc: `${origin}${route}`,
      lastmod: new Date().toISOString().split('T')[0],
      changefreq,
      priority,
    };
  });

  const xml = createSitemap(sitemapEntries);

  // Enviamos la respuesta con el Header adecuado para XML
  send(200, xml, {
    'Content-Type': 'text/xml',
    'Cache-Control': 'public, max-age=86400, s-maxage=86400',
  });
};
