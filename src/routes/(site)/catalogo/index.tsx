import { component$, useSignal } from "@builder.io/qwik";
import { routeLoader$, Link, type DocumentHead } from "@builder.io/qwik-city";
import { getDb } from "../../../db/client";
import { categories, products } from "../../../db/schema";
import { eq } from "drizzle-orm";

export const useCatalogLoader = routeLoader$(async ({ env }) => {
  const db = getDb(env);

  const allCategories = await db
    .select()
    .from(categories)
    .orderBy(categories.display_order);

  const allProducts = await db
    .select()
    .from(products)
    .where(eq(products.isActive, true));

  return allCategories.map((cat) => ({
    ...cat,
    products: allProducts.filter((p) => p.categoryId === cat.id),
  }));
});

export const ColorsList = component$((props: { colores: string[] }) => {
  const showAll = useSignal(false);
  
  return (
    <div class="mt-3">
      <span class="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">
        {props.colores.length} Colores Disponibles:
      </span>
      <div class="flex flex-wrap gap-1.5">
        {props.colores.slice(0, showAll.value ? props.colores.length : 5).map((color: string, idx: number) => (
          <span key={idx} class="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-gray-100 text-gray-700 border border-gray-200">
            {color}
          </span>
        ))}
        {!showAll.value && props.colores.length > 5 && (
          <button 
            preventdefault:click
            onClick$={() => (showAll.value = true)}
            class="inline-flex items-center justify-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-[#1e2c53]/10 text-[#1e2c53] border border-[#1e2c53]/20 hover:bg-[#1e2c53]/20 transition-colors"
          >
            + {props.colores.length - 5} más
          </button>
        )}
        {showAll.value && props.colores.length > 5 && (
          <button 
            preventdefault:click
            onClick$={() => (showAll.value = false)}
            class="inline-flex items-center justify-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-200 transition-colors"
          >
            - Ver menos
          </button>
        )}
      </div>
    </div>
  );
});

import { useSiteSettingsLoader } from "../layout";
import { ShareButton } from "~/components/ui/share-button";

export default component$(() => {
  const catalog = useCatalogLoader();
  const settings = useSiteSettingsLoader();

  return (
    <div class="py-12 md:py-20">
      <div class="container mx-auto px-6 md:px-12">
        <header class="mb-12 text-center">
          <h1 class="font-heading text-4xl font-bold tracking-tight text-[#1e2c53] sm:text-5xl">
            {settings.value.catalogTitle}
          </h1>
          <div class="mx-auto mt-6 max-w-3xl text-center text-gray-600 leading-relaxed">
            {settings.value.catalogDescription?.split('\n').map((paragraph, index) => (
              paragraph.trim() ? <p key={index} class={index > 0 ? "mt-4" : ""}>{paragraph}</p> : null
            ))}
          </div>
        </header>

        {/* Quick Nav (anchor links to categories) */}
        {catalog.value.length > 1 && (
          <nav class="mt-16 rounded-2xl bg-gray-50 border border-gray-200 p-6">
            <h3 class="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-4">Navegación rápida</h3>
            <div class="flex flex-wrap gap-2.5">
              {catalog.value.map((cat) => (
                <Link
                  key={cat.id}
                  href={`#${cat.slug}`}
                  class="rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-[#1e2c53] transition-all hover:bg-[#1e2c53] hover:text-white hover:border-[#1e2c53]"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </nav>
        )}

        {/* Categorías con productos */}
        <div class="space-y-16 mt-16">
          {catalog.value.map((cat) => (
            <section key={cat.id} id={cat.slug}>
              {/* Category Header */}
              <div class="mb-8 border-b border-gray-200 pb-4">
                <h2 class="font-heading text-2xl font-bold text-[#1e2c53] sm:text-3xl">
                  {cat.name}
                </h2>
                {cat.description && (
                  <p class="mt-2 text-gray-500">{cat.description}</p>
                )}
              </div>

              {/* Products Grid */}
              {cat.products.length === 0 ? (
                <div class="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50/50 py-16 px-6 text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  <p class="text-gray-500 font-medium">Próximamente — nuevos productos en esta categoría.</p>
                </div>
              ) : (
                <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {cat.products.map((product) => (
                    <div
                      key={product.id}
                      class="group overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
                    >
                      {/* Product Image */}
                      <div class="relative aspect-square w-full overflow-hidden bg-gray-100">
                        {/* Badges */}
                        <div class="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
                          {product.isOffer && (
                            <span class="bg-orange-500 text-white px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider shadow-sm w-fit">
                              Oferta
                            </span>
                          )}
                        </div>
                        {product.imageUrl ? (
                          <a href={`/producto/${product.id}/`} class="block w-full h-full">
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              width={400}
                              height={400}
                              class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                              loading="lazy"
                            />
                          </a>
                        ) : (
                          <a href={`/producto/${product.id}/`} class="flex h-full w-full items-center justify-center text-gray-300">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </a>
                        )}
                      </div>

                      {/* Product Info */}
                      <div class="p-5">
                        <a href={`/producto/${product.id}/`} class="block">
                          <h3 class="font-heading text-lg font-bold text-gray-900 line-clamp-1 hover:text-indigo-600 transition-colors">
                            {product.name}
                          </h3>
                        </a>
                        {product.description && (
                          <p class="mt-1.5 text-sm text-gray-500 line-clamp-2">
                            {product.description}
                          </p>
                        )}
                        
                        {/* Detalles Técnicos */}
                        <div class="mt-4 pt-4 border-t border-gray-100 flex flex-col gap-1.5 text-xs text-gray-600">
                          {product.fabricante && <div><span class="font-semibold text-gray-400">Fabricante:</span> {product.fabricante}</div>}
                          {product.composicion && <div><span class="font-semibold text-gray-400">Comp.:</span> {product.composicion}</div>}
                          <div class="grid grid-cols-2 gap-2">
                            {product.ancho && <div><span class="font-semibold text-gray-400">Ancho:</span> {product.ancho}</div>}
                            {product.oz && <div><span class="font-semibold text-gray-400">OZ:</span> {product.oz}</div>}
                            {product.rinde && <div><span class="font-semibold text-gray-400">Rinde:</span> {product.rinde}</div>}
                            {product.complemento && <div><span class="font-semibold text-gray-400">Compl.:</span> {product.complemento}</div>}
                          </div>
                          
                          {(product.sublimar || product.estampar || product.bordar) && (
                            <div class="mt-1.5 flex flex-wrap gap-1.5">
                              {product.sublimar && <span class="px-2 py-0.5 bg-[#6272b3]/10 text-[#6272b3] rounded text-[10px] uppercase font-bold tracking-wider">Sublimar</span>}
                              {product.estampar && <span class="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[10px] uppercase font-bold tracking-wider">Estampar</span>}
                              {product.bordar && <span class="px-2 py-0.5 bg-amber-50 text-amber-700 rounded text-[10px] uppercase font-bold tracking-wider">Bordar</span>}
                            </div>
                          )}
                        </div>

                        {product.colores && product.colores.length > 0 && (
                          <div class="mt-4 pt-4 border-t border-gray-100">
                            <ColorsList colores={product.colores} />
                          </div>
                        )}
                        <a
                          href={`https://wa.me/5491144048614?text=${encodeURIComponent(`Hola, me interesa el producto: ${product.name}`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          class="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#6272b3]/10 px-4 py-2.5 text-sm font-semibold text-[#6272b3] transition-colors hover:bg-[#6272b3] hover:text-white"
                        >
                          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12.031 0C5.388 0 0 5.385 0 12.029c0 2.122.553 4.192 1.603 6.014L.162 23.3l5.405-1.418C7.329 22.84 9.351 23.362 11.512 23.362c6.641 0 12.03-5.388 12.03-12.031S18.151 0 11.512 0H12.03zm-4.144 6.784c.34-.006.702.012 1.053.05.321.035.753.125 1.018.736.335.77.942 2.302 1.025 2.474.083.172.138.373.027.59-.11.218-.166.353-.332.548-.166.195-.353.414-.509.57a.9.9 0 0 0-.25.641c.01.218.423.89 1.033 1.432.783.696 1.442.912 1.666 1.01.222.098.353.084.484-.064.133-.148.567-.66.719-.886.152-.226.305-.188.509-.111.205.077 1.294.613 1.516.724.221.111.369.166.424.258.055.092.055.535-.138 1.052-.194.516-1.135.992-1.578 1.026-.443.033-.941.055-3.21-.84-2.73-1.077-4.482-3.86-4.618-4.043-.138-.184-1.107-1.474-1.107-2.812s.692-1.996.941-2.254c.25-.258.553-.324.747-.324z" />
                          </svg>
                          Consultar
                        </a>
                        <ShareButton product={{ id: product.id, name: product.name }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>



        {/* CTA */}
        <div class="mt-16 rounded-3xl bg-[#f9fafb] py-16 px-6 shadow-sm border border-gray-100">
          <div class="max-w-4xl mx-auto text-center">
            <h3 class="font-heading text-2xl font-bold text-[#1e2c53] mb-4">¿No encontrás lo que buscás?</h3>
            <p class="text-lg text-gray-600">
              Si buscás telas por mayor en Once, en Textil CCE vas a encontrar una gran variedad de opciones para desarrollar tu línea de indumentaria con stock permanente y precios mayoristas.
            </p>
            <a
              href="https://wa.me/5491144048614"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex mt-8 items-center justify-center rounded-lg bg-transparent border-2 border-[#1e2c53] px-8 py-3.5 font-semibold text-[#1e2c53] transition-all hover:bg-[#1e2c53] hover:text-white focus:outline-none focus:ring-2 focus:ring-[#1e2c53] focus:ring-offset-2"
            >
              Contactanos por WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: "Catálogo de Telas para Indumentaria | Mayorista de Telas en Once | Textil CCE",
  meta: [
    {
      name: "description",
      content: "Descubrí el catálogo completo de Textil CCE en Once. Telas por rollo en colores clásicos para producción continua. Venta por mayor al mejor precio.",
    },
  ],
};
