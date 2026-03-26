import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { Link } from "@builder.io/qwik-city";
import { useSiteSettingsLoader } from "./layout";

export default component$(() => {
  const settings = useSiteSettingsLoader();

  return (
    <>
      {/* Hero Section */}
      <section class="relative flex h-[85vh] w-full flex-col items-center justify-center overflow-hidden bg-[#1e2c53]">
        <div 
          class="absolute inset-0 z-0 opacity-30 bg-cover bg-center"
          style={{ backgroundImage: `url('${settings.value.heroImageUrl || 'https://placehold.co/1920x1080/webp'}')` }}
        ></div>
        <div class="absolute inset-0 z-0 bg-linear-to-b from-[#1e2c53]/80 via-[#1e2c53]/60 to-[#1e2c53]/90"></div>

        <div class="container relative z-10 mx-auto px-6 text-center md:px-12">
          <h1 class="mb-6 font-heading text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
            {settings.value.heroTitle ? settings.value.heroTitle.split('\\n').map((line: string, i: number) => (
              <span key={i}>
                {line}
                {i === 0 && <br class="hidden sm:inline" />}
              </span>
            )) : (
              <>Telas por Mayor en Once <br class="hidden sm:inline" /></>
            )}
            <span class="text-[#6272b3] block mt-2">{settings.value.heroSubtitle || 'Calidad para tu Confección'}</span>
          </h1>
          <p class="mx-auto mb-10 max-w-2xl text-lg text-white/80 sm:text-xl">
            Líderes mayoristas de telas para indumentaria con más de 20 años de trayectoria. Stock permanente y envíos a todo el país.
          </p>
          <div class="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/catalogo/"
              class="inline-flex h-14 items-center justify-center rounded-lg bg-white px-8 font-semibold text-[#1e2c53] transition-all hover:bg-[#6272b3] hover:text-white hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#6272b3] focus:ring-offset-2 focus:ring-offset-[#1e2c53]"
            >
              Ver Catálogo de Telas
            </Link>
            <Link
              href="/mayoristas/"
              class="inline-flex h-14 items-center justify-center rounded-lg border-2 border-white/40 bg-transparent px-8 font-semibold text-white transition-all hover:border-[#6272b3] hover:bg-[#6272b3]/20 focus:outline-none focus:ring-2 focus:ring-[#6272b3] focus:ring-offset-2 focus:ring-offset-[#1e2c53]"
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
              Textil CCE es un mayorista de telas para indumentaria ubicado en Once, Buenos Aires. Desde hace más de 20 años abastecemos a marcas de ropa, talleres de confección, diseñadores y emprendedores de todo el país con telas de calidad, colores de moda y precios competitivos.
            </p>
            <p class="text-gray-700 leading-relaxed text-lg">
              Nuestro local, ubicado en Azcuénaga 650, se encuentra en uno de los centros textiles más importantes de Argentina, donde ofrecemos una amplia variedad de telas ideales para desarrollar colecciones de moda. Trabajamos con reposición permanente de stock para que nuestros clientes puedan producir sin interrupciones.
            </p>
          </div>
          <div>
             <img
                src="https://placehold.co/800x450/webp?text=Local+o+Stock"
                alt="Stock de telas Textil CCE"
                width="800"
                height="450"
                class="aspect-video w-full object-cover rounded-xl shadow-lg"
                loading="lazy"
             />
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section class="bg-[#f9fafb] py-20">
        <div class="container mx-auto px-6 md:px-12">
          <div class="mb-12 text-center">
            <h2 class="font-heading text-3xl font-bold tracking-tight text-[#1e2c53] sm:text-4xl">¿Por qué elegir Textil CCE?</h2>
            <p class="mt-4 text-gray-500">Somos tu proveedor de telas para ropa confiable en Buenos Aires.</p>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "Más de 20 años en el mercado",
                desc: "Trayectoria comprobada y experiencia abasteciendo al rubro textil en Once.",
                icon: <svg class="h-10 w-10 text-[#1e2c53]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
              },
              {
                title: "Ventas Mayoristas",
                desc: "Condiciones ideales y precios competitivos para marcas, talleres y emprendedores.",
                icon: <svg class="h-10 w-10 text-[#1e2c53]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
              },
              {
                title: "Amplio Surtido",
                desc: "Gran variedad de telas para indumentaria con reposición constante.",
                icon: <svg class="h-10 w-10 text-[#1e2c53]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>,
              },
              {
                title: "Colores de Temporada",
                desc: "Paletas actualizadas y texturas que marcan tendencia en cada colección.",
                icon: <svg class="h-10 w-10 text-[#1e2c53]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>,
              },
              {
                title: "Excelente Relación Precio-Calidad",
                desc: "Materiales confiables que optimizan la rentabilidad de tu producción.",
                icon: <svg class="h-10 w-10 text-[#1e2c53]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>,
              },
              {
                title: "Envíos a todo el país",
                desc: "Despachamos mercadería a toda Argentina de forma rápida y segura.",
                icon: <svg class="h-10 w-10 text-[#1e2c53]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>,
              },
            ].map((item, index) => (
              <div key={index} class="flex flex-col items-center rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
                <div class="mb-5 rounded-xl bg-[#1e2c53]/5 p-4">
                  {item.icon}
                </div>
                <h3 class="mb-2 font-heading text-xl font-semibold text-[#1e2c53]">{item.title}</h3>
                <p class="text-sm text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

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

          <div class="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {[
              { title: "Telas de Moda", img: "https://placehold.co/600x400/webp", href: "/catalogo/" },
              { title: "Confección y Sastrería", img: "https://placehold.co/600x400/webp", href: "/catalogo/" },
              { title: "Moda Urbana", img: "https://placehold.co/600x400/webp", href: "/catalogo/" },
            ].map((cat, index) => (
              <Link key={index} href={cat.href} class="group relative block h-80 overflow-hidden rounded-xl bg-[#1e2c53]">
                <img
                  src={cat.img}
                  alt={cat.title}
                  width="600"
                  height="400"
                  class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div class="absolute inset-0 bg-linear-to-t from-[#1e2c53]/90 via-[#1e2c53]/30 to-transparent"></div>
                <div class="absolute bottom-6 left-6 right-6">
                  <h3 class="font-heading text-2xl font-bold text-white">{cat.title}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section class="py-20 px-6 md:px-12">
        <div class="container mx-auto">
          <div class="relative overflow-hidden rounded-2xl bg-[#1e2c53] px-6 py-16 text-center text-white shadow-2xl sm:px-16 sm:py-20">
            <div class="absolute inset-0 opacity-10 bg-[url('https://placehold.co/1920x1080/webp')] bg-cover bg-center"></div>
            <div class="relative z-10 mx-auto max-w-2xl">
              <h2 class="font-heading text-3xl font-bold tracking-tight sm:text-4xl">¿Buscás telas por mayor para tu próxima colección?</h2>
              <p class="mx-auto mt-4 max-w-xl text-lg text-white/70">
                Nuestro equipo está listo para asesorarte. Escribinos por WhatsApp y recibí atención personalizada al instante.
              </p>
              <div class="mt-10 flex justify-center">
                <a
                  href="https://wa.me/5491144048614"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-flex h-14 items-center justify-center rounded-lg bg-[#6272b3] px-8 font-semibold text-white transition-all hover:bg-white hover:text-[#1e2c53] hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#6272b3] focus:ring-offset-2 focus:ring-offset-[#1e2c53]"
                >
                  Escribinos por WhatsApp
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
