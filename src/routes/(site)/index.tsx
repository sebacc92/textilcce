import { component$ } from "@builder.io/qwik";
import { routeLoader$, type DocumentHead, Link } from "@builder.io/qwik-city";
import { useSiteSettingsLoader } from "./layout";
import { getDb } from "../../db/client";
import { siteContentLists, categories, brands, instagramPosts } from "../../db/schema";
import { desc, eq } from "drizzle-orm";
import { SocialFeed, MOCK_INSTAGRAM_POSTS } from "~/components/home/social-feed/social-feed";

export const useHomeFeaturesLoader = routeLoader$(async ({ env }) => {
  const db = getDb(env);
  const items = await db.select().from(siteContentLists).orderBy(siteContentLists.displayOrder);
  return items.filter(l => l.type === 'home_feature');
});

export const useCategoriesLoader = routeLoader$(async ({ env }) => {
  const db = getDb(env);
  return await db.select()
    .from(categories)
    .where(eq(categories.isFeatured, true))
    .orderBy(categories.display_order);
});

export const useBrandsLoader = routeLoader$(async ({ env }) => {
  const db = getDb(env);
  return await db.select().from(brands).where(eq(brands.isActive, true)).orderBy(brands.display_order);
});

export const useShowcaseProductsLoader = routeLoader$(async ({ env }) => {
  const db = getDb(env);
  
  // Buscar categorías especiales por slug
  const specialCats = await db.query.categories.findMany({
    where: (cats, { or, eq, like }) => or(
      eq(cats.slug, 'destacados'),
      like(cats.slug, '%destacado%'),
      eq(cats.slug, 'mundial'),
      like(cats.slug, '%mundial%')
    )
  });

  const featuredCatIds = specialCats.filter(c => c.slug.includes('destacado')).map(c => c.id);
  const mundialCatIds = specialCats.filter(c => c.slug.includes('mundial')).map(c => c.id);

  // Obtener productos de estas categorías con sus datos de categoría
  const rows = await db.query.products.findMany({
    where: (products, { eq }) => eq(products.isActive, true),
    with: {
      category: true
    }
  });

  return {
    offers: rows.filter((p) => p.isOffer).map(p => ({
      id: p.id, name: p.name, description: p.description, 
      imageUrl: p.imageUrl, colores: p.colores || [], fabricante: p.fabricante,
      categoryName: p.category.name
    })),
    featured: rows.filter((p) => featuredCatIds.includes(p.categoryId)).map(p => ({
      id: p.id, name: p.name, description: p.description, 
      imageUrl: p.imageUrl, colores: p.colores || [], fabricante: p.fabricante,
      categoryName: p.category.name
    })),
    mundial: rows.filter((p) => mundialCatIds.includes(p.categoryId)).map(p => ({
      id: p.id, name: p.name, description: p.description, 
      imageUrl: p.imageUrl, colores: p.colores || [], fabricante: p.fabricante,
      categoryName: p.category.name
    })),
  };
});

export const useInstagramFeed = routeLoader$(async (requestEvent) => {
  const db = getDb(requestEvent.env);
  try {
    const posts = await db.query.instagramPosts.findMany({
      orderBy: [desc(instagramPosts.timestamp)],
      limit: 6, // Traemos solo los 6 últimos
    });

    if (posts.length > 0) {
      return posts.map((p) => ({
        id: p.id,
        imageUrl: p.mediaUrl || '',
        link: p.permalink || '',
        caption: p.caption || undefined,
      }));
    }

    return MOCK_INSTAGRAM_POSTS;
  } catch (error) {
    console.error('Error cargando feed de instagram desde DB', error);
    return MOCK_INSTAGRAM_POSTS;
  }
});
import Horiz1 from "~/media/horizontales/1.jpeg?jsx"
import Horiz2 from "~/media/horizontales/2.jpeg?jsx"
import Horiz3 from "~/media/horizontales/3.jpeg?jsx"
import SquareImg from "~/media/square/1.jpeg?jsx"
import { OffersSection, FeaturedSection, MundialBanner } from "~/components/home/product-showcase";

export default component$(() => {
  const settings = useSiteSettingsLoader();
  const features = useHomeFeaturesLoader();
  const cats = useCategoriesLoader();
  const brandsList = useBrandsLoader();
  const instagramFeed = useInstagramFeed();
  const showcaseProducts = useShowcaseProductsLoader();

  return (
    <>
      {/* Hero Section */}
      <section class="relative flex min-h-[85vh] w-full flex-col items-start justify-center overflow-hidden bg-[#1e2c53]">
        <div
          class="absolute inset-0 z-0 bg-cover bg-center"
          style={{ backgroundImage: settings.value?.heroImageUrl ? `url('${settings.value.heroImageUrl}')` : 'none' }}
        ></div>
        <div class="absolute inset-0 z-0 bg-gradient-to-r from-[#1e2c53]/95 via-[#1e2c53]/70 to-[#1e2c53]/30"></div>

        <div class="container relative z-10 mx-auto px-6 text-left md:px-12 md:max-w-3xl md:mr-auto md:ml-12 lg:ml-24">
          <h1 class="mb-6 font-heading text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
            {settings.value?.heroTitle}
          </h1>
          <p class="mb-10 ml-1 max-w-2xl text-lg text-white/80 sm:text-xl">
            {settings.value?.heroSubtitle}
          </p>
          <div class="flex flex-col items-start justify-start gap-4 sm:flex-row">
            <Link
              href="/catalogo/"
              class="inline-flex h-14 items-center justify-center rounded-lg bg-white px-8 font-semibold text-[#1e2c53] transition-all hover:bg-[#6272b3] hover:text-white hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#6272b3] focus:ring-offset-2 focus:ring-offset-[#1e2c53]"
            >
              Ver Catálogo de Telas
            </Link>
            <Link
              href="/mayoristas/"
              class="inline-flex h-14 items-center justify-center rounded-lg bg-white/10 backdrop-blur-md border border-white/20 px-8 font-semibold text-white transition-all hover:bg-white/25 hover:border-white/40 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-[#1e2c53]"
            >
              Comprar por Mayor
            </Link>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section class="container mx-auto py-20 px-6 md:px-12">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div class="space-y-6">
            <h2 class="font-heading text-3xl font-bold tracking-tight text-[#1e2c53] sm:text-4xl">
              Más de 20 años abasteciendo a la industria textil
            </h2>
            <p class="text-gray-700 leading-relaxed text-lg">
              Textil CCE es un mayorista de telas para indumentaria ubicado en Once, Buenos Aires. Desde hace más de 20 años abastecemos a marcas de ropa, talleres de confección, confeccionistas y emprendedores de todo el país con telas de calidad a precios competitivos. Nos especializamos en abastecer a la industria con materiales de alto rendimiento: Gabardinas con Lycra, Batistas para camisería, Frisa peinada y Algodón. Trabajamos un stock permanente de colores clásicos, incorporando opciones de moda para cada temporada.
            </p>
            <p class="text-gray-700 leading-relaxed text-lg">
              Nuestro local, ubicado en Azcuénaga 650, se encuentra en uno de los centros textiles más importantes de Argentina, donde ofrecemos una amplia variedad de telas mayoristas. Trabajamos con reposición permanente de stock para que nuestros clientes puedan producir sin interrupciones.
            </p>
          </div>
          <div class="relative flex justify-center lg:justify-end w-full">
            <div class="relative w-full max-w-[280px] sm:max-w-[320px] lg:max-w-[360px] xl:max-w-[420px] aspect-[9/16] overflow-hidden rounded-2xl md:rounded-[2rem] shadow-xl md:shadow-2xl bg-slate-900 border-4 md:border-[6px] border-white ring-1 ring-slate-100">
              <video
                controls
                playsInline
                poster={settings.value?.heroVideoPosterUrl || undefined}
                class="absolute inset-0 w-full h-full object-cover"
              >
                <source src={settings.value?.heroVideoUrl || "https://sap3cnfy0vc6nzdk.public.blob.vercel-storage.com/output.mp4"} type="video/mp4" />
              </video>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section class="bg-[#eef0f4] py-20">
        <div class="container mx-auto px-6 md:px-12">
          <div class="mb-12 text-center">
            <h2 class="font-heading text-3xl font-bold tracking-tight text-[#1e2c53] sm:text-4xl">¿Por qué elegir Textil CCE?</h2>
            <p class="mt-4 text-gray-500">Somos tu proveedor de telas para ropa confiable en Buenos Aires.</p>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.value.length > 0 ? features.value.map((item) => (
              <div key={item.id} class="flex flex-col items-center rounded-xl border-2 border-gray-200 bg-white p-8 text-center shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-[#1e2c53]">
                <div class="mb-5 rounded-xl bg-[#1e2c53]/5 p-4 text-[#1e2c53]">
                  {/* Default Lucide Icons fallback */}
                  {item.icon === 'package-check' ? (
                    <svg class="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                  ) : item.icon === 'layers' ? (
                    <svg class="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>
                  ) : item.icon === 'archive' ? (
                    <svg class="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>
                  ) : item.icon === 'piggy-bank' ? (
                    <svg class="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
                  ) : item.icon === 'truck' ? (
                    <svg class="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                  ) : (
                    <svg class="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  )}
                </div>
                <h3 class="mb-2 font-heading text-xl font-semibold text-[#1e2c53]">{item.title}</h3>
                <p class="text-sm text-gray-500">{item.description}</p>
              </div>
            )) : (
              <div class="col-span-full text-center text-gray-500 py-6">Agrega características desde el administrador.</div>
            )}
          </div>
        </div>
      </section>

      {/* Shows Offers, Featured and Mundial Banner */}
      <OffersSection products={showcaseProducts.value.offers} />
      <FeaturedSection products={showcaseProducts.value.featured} />
      <MundialBanner products={showcaseProducts.value.mundial} />

      {/* Featured Categories */}
      <section class="py-20">
        <div class="container mx-auto px-6 md:px-12">
          <div class="mb-12 flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div>
              <h2 class="font-heading text-3xl font-bold tracking-tight text-[#1e2c53] sm:text-4xl">Categorías Destacadas</h2>
              <p class="mt-2 text-gray-500">Descubrí las telas más buscadas por nuestros clientes.</p>
            </div>
            <Link href="/catalogo/" class="inline-flex items-center text-sm font-semibold text-[#6272b3] hover:text-[#1e2c53] transition-colors">
              Ver todo el catálogo
              <svg class="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
            </Link>
          </div>

          <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {cats.value.map((cat, index) => {
              const Images = [Horiz1, Horiz2, Horiz3, SquareImg];
              const ImgComp = Images[index % Images.length];
              return (
                <Link key={cat.id} href={`/catalogo/#${cat.slug}`} class="group relative block h-80 overflow-hidden rounded-xl bg-[#1e2c53]">
                  {cat.imageUrl ? (
                    <img src={cat.imageUrl} alt={cat.name} class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  ) : (
                    <ImgComp class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  )}
                  <div class="absolute inset-0 bg-[#1e2c53]/50 transition-colors group-hover:bg-[#1e2c53]/40"></div>
                  <div class="absolute bottom-6 left-6 right-6">
                    <h3 class="font-heading text-2xl font-bold text-white">{cat.name}</h3>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Brands carousel/grid */}
      {brandsList.value.length > 0 && (
        <section class="py-12 border-t border-slate-200">
          <div class="container mx-auto px-6 md:px-12 text-center">
            <h3 class="text-xl font-semibold uppercase tracking-wider text-slate-400 mb-8">Trabajamos con las mejores marcas</h3>
            <div class="flex flex-wrap justify-center items-center gap-10 sm:gap-16">
              {brandsList.value.map((b) => (
                <div
                  key={b.id}
                  class={`flex h-32 sm:h-40 lg:h-48 flex-shrink-0 items-center justify-center rounded-xl p-3 sm:p-4 transition-all duration-300 opacity-70 grayscale hover:grayscale-0 hover:opacity-100`}
                >
                  <img
                    src={b.imageUrl}
                    alt={b.name}
                    class="max-h-full max-w-[350px] object-contain"
                    title={b.name}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Instagram Feed */}
      <SocialFeed posts={instagramFeed.value} />

      {/* Final CTA */}
      <section class="py-20 px-6 md:px-12">
        <div class="container mx-auto">
          <div class="relative overflow-hidden rounded-2xl bg-[#1e2c53] px-6 py-16 text-center text-white shadow-2xl sm:px-16 sm:py-20">
            <div class="absolute inset-0 opacity-10">
              {settings.value?.ctaImageUrl ? (
                <img src={settings.value.ctaImageUrl} alt="Background" class="h-full w-full object-cover" />
              ) : (
                <Horiz1 class="h-full w-full object-cover" />
              )}
            </div>
            <div class="relative z-10 mx-auto max-w-2xl">
              <h2 class="font-heading text-3xl font-bold tracking-tight sm:text-4xl">{settings.value?.ctaTitle || '¿Buscás telas por mayor para tu próxima colección?'}</h2>
              <p class="mx-auto mt-4 max-w-xl text-lg text-white/70">
                {settings.value?.ctaSubtitle || 'Nuestro equipo está listo para asesorarte. Escribinos por WhatsApp y recibí atención personalizada al instante.'}
              </p>
              <div class="mt-10 flex justify-center">
                <a
                  href="https://wa.me/5491144048614"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-flex h-14 items-center justify-center rounded-lg bg-[#6272b3] px-8 font-semibold text-white transition-all hover:bg-white hover:text-[#1e2c53] hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#6272b3] focus:ring-offset-2 focus:ring-offset-[#1e2c53]"
                >
                  {settings.value?.ctaButtonText || 'Escribinos por WhatsApp'}
                  <svg class="ml-2 h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12.031 0C5.388 0 0 5.385 0 12.029c0 2.122.553 4.192 1.603 6.014L.162 23.3l5.405-1.418C7.329 22.84 9.351 23.362 11.512 23.362c6.641 0 12.03-5.388 12.03-12.031S18.151 0 11.512 0H12.03zm-4.144 6.784c.34-.006.702.012 1.053.05.321.035.753.125 1.018.736.335.77.942 2.302 1.025 2.474.083.172.138.373.027.59-.11.218-.166.353-.332.548-.166.195-.353.414-.509.57a.9.9 0 0 0-.25.641c.01.218.423.89 1.033 1.432.783.696 1.442.912 1.666 1.01.222.098.353.084.484-.064.133-.148.567-.66.719-.886.152-.226.305-.188.509-.111.205.077 1.294.613 1.516.724.221.111.369.166.424.258.055.092.055.535-.138 1.052-.194.516-1.135.992-1.578 1.026-.443.033-.941.055-3.21-.84-2.73-1.077-4.482-3.86-4.618-4.043-.138-.184-1.107-1.474-1.107-2.812s.692-1.996.941-2.254c.25-.258.553-.324.747-.324z" /></svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
});

export const head: DocumentHead = {
  title: "Telas por Mayor en Once | Textil CCE – Telas para Indumentaria",
  meta: [
    {
      name: "description",
      content: "Mayorista de telas para indumentaria en Once, Buenos Aires. Más de 20 años ofreciendo telas de moda, amplio stock y ventas por mayor. Envíos a todo el país.",
    },
    {
      name: "keywords",
      content: "telas por mayor en Once, mayorista de telas Buenos Aires, telas para indumentaria por mayor, telas para confección mayorista, proveedor de telas para ropa, telas de moda mayorista, telas Once Buenos Aires",
    }
  ],
};
