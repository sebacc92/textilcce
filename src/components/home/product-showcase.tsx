import { component$ } from "@builder.io/qwik";
import { Link } from "@builder.io/qwik-city";
import { ShareButton } from "~/components/ui/share-button";
// Si refactorizamos ColorsList globalmente podríamos importarlo acá
// Importaremos un svg temporal si no hay imagen

interface ProductOverview {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  colores: string[];
  fabricante: string | null;
  categoryName: string;
}

export const OffersSection = component$((props: { products: ProductOverview[] }) => {
  if (!props.products || props.products.length === 0) return null;

  return (
    <section class="py-20 bg-[#f8f9fa]">
      <div class="container mx-auto px-6 md:px-12">
        <div class="mb-12 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div>
            <h2 class="font-heading text-3xl font-bold tracking-tight text-[#1e2c53] sm:text-4xl flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-[#6272b3]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                <line x1="7" y1="7" x2="7.01" y2="7"></line>
              </svg>
              Ofertas Especiales
            </h2>
            <p class="mt-2 text-[#6272b3]">Oportunidades únicas de stock limitado al mejor precio.</p>
          </div>
          <Link href="/catalogo/" class="inline-flex items-center text-sm font-semibold text-[#6272b3] hover:text-[#1e2c53] transition-colors bg-white px-5 py-2.5 rounded-full shadow-sm hover:shadow-md">
            Ver catálogo completo
            <svg class="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
          </Link>
        </div>

        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {props.products.map(product => (
            <div key={product.id} class="group overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
              <div class="relative aspect-square w-full overflow-hidden bg-gray-100">
                <div class="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
                  <span class="bg-orange-500 text-white px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider shadow-sm w-fit border border-white/20">
                    {product.categoryName}
                  </span>
                </div>
                {product.imageUrl ? (
                  <a href={`/producto/${product.id}/`} class="block w-full h-full">
                    <img src={product.imageUrl} alt={product.name} width={400} height={400} class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                  </a>
                ) : (
                  <a href={`/producto/${product.id}/`} class="flex h-full w-full items-center justify-center text-gray-300">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  </a>
                )}
              </div>
              <div class="p-5">
                <a href={`/producto/${product.id}/`} class="block">
                  <h3 class="font-heading text-lg font-bold text-gray-900 line-clamp-1 hover:text-indigo-600 transition-colors">{product.name}</h3>
                </a>
                {product.description && <p class="mt-1.5 text-sm text-gray-500 line-clamp-2">{product.description}</p>}

                <div class="mt-4 grid grid-cols-2 gap-2 border-t border-gray-100 pt-4">
                  {product.colores && product.colores.length > 0 && (
                    <div class="col-span-2 flex items-center gap-1.5">
                      <span class="flex h-4 w-4 items-center justify-center rounded-full bg-gray-100">
                        <span class="h-2.5 w-2.5 rounded-full bg-gradient-to-tr from-pink-400 via-purple-400 to-indigo-400"></span>
                      </span>
                      <span class="text-xs font-semibold text-gray-500">{product.colores.length} COLORES</span>
                    </div>
                  )}
                  {product.fabricante && (
                    <div class="col-span-2">
                      <span class="text-xs font-semibold text-gray-500">{product.fabricante}</span>
                    </div>
                  )}
                </div>

                <div class="mt-5">
                  <a href={`https://wa.me/5491144048614?text=${encodeURIComponent(`Hola, me interesa obtener información sobre el producto en Oferta: ${product.name}`)}`} target="_blank" rel="noopener noreferrer" class="flex w-full items-center justify-center gap-2 rounded-lg bg-[#31ce5c] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-green-600">
                    <svg class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12.031 0C5.388 0 0 5.385 0 12.029c0 2.122.553 4.192 1.603 6.014L.162 23.3l5.405-1.418C7.329 22.84 9.351 23.362 11.512 23.362c6.641 0 12.03-5.388 12.03-12.031S18.151 0 11.512 0H12.03zm-4.144 6.784c.34-.006.702.012 1.053.05.321.035.753.125 1.018.736.335.77.942 2.302 1.025 2.474.083.172.138.373.027.59-.11.218-.166.353-.332.548-.166.195-.353.414-.509.57a.9.9 0 0 0-.25.641c.01.218.423.89 1.033 1.432.783.696 1.442.912 1.666 1.01.222.098.353.084.484-.064.133-.148.567-.66.719-.886.152-.226.305-.188.509-.111.205.077 1.294.613 1.516.724.221.111.369.166.424.258.055.092.055.535-.138 1.052-.194.516-1.135.992-1.578 1.026-.443.033-.941.055-3.21-.84-2.73-1.077-4.482-3.86-4.618-4.043-.138-.184-1.107-1.474-1.107-2.812s.692-1.996.941-2.254c.25-.258.553-.324.747-.324z" />
                    </svg>
                    Consultar
                  </a>
                  <ShareButton product={{ id: product.id, name: product.name }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
});

export const FeaturedSection = component$((props: { products: ProductOverview[] }) => {
  if (!props.products || props.products.length === 0) return null;

  return (
    <section class="py-24 bg-white">
      <div class="container mx-auto px-6 md:px-12">
        <div class="mb-16 text-center max-w-2xl mx-auto">
          <span class="text-[#6272b3] font-bold tracking-widest uppercase text-xs sm:text-sm">Selección Premium</span>
          <h2 class="font-heading text-3xl font-bold tracking-tight text-[#1e2c53] sm:text-5xl mt-3">Productos Destacados</h2>
          <div class="mt-4 h-1 w-20 bg-[#6272b3] mx-auto rounded-full"></div>
        </div>

        <div class="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {props.products.map(product => (
            <div key={product.id} class="group flex flex-col overflow-hidden rounded-2xl bg-[#f9fafb] border border-slate-100 shadow-sm transition-all hover:shadow-xl">
              <div class="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
                <div class="absolute inset-0 bg-gradient-to-t from-[#1e2c53]/80 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 z-10 flex items-end p-6">
                  <a href={`https://wa.me/5491144048614?text=${encodeURIComponent(`Hola, me interesa el producto destacado: ${product.name}`)}`} target="_blank" rel="noopener noreferrer" class="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-white px-4 py-3 text-sm font-semibold text-[#1e2c53] transition-transform duration-300 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100">
                    Consultar disponibilidad
                  </a>
                </div>
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt={product.name} width={600} height={450} class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
                ) : (
                  <div class="flex h-full w-full items-center justify-center text-slate-300">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-20 w-20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  </div>
                )}
                <div class="absolute top-4 right-4 z-10">
                  <span class="flex items-center justify-center h-10 w-10 rounded-full bg-white text-[#1e2c53] shadow-md">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                  </span>
                </div>
              </div>
              <div class="p-6 flex flex-col flex-grow">
                <h3 class="font-heading text-xl font-bold text-[#1e2c53]">{product.name}</h3>
                {product.description && <p class="mt-2 text-sm text-slate-500 line-clamp-2">{product.description}</p>}

                <div class="mt-auto pt-6 flex gap-2 flex-wrap">
                  {product.colores && product.colores.length > 0 && (
                    <span class="text-xs bg-slate-200 text-slate-700 px-2.5 py-1 rounded-md font-medium">{product.colores.length} Colores</span>
                  )}
                  {product.fabricante && (
                    <span class="text-xs border border-slate-200 text-slate-600 px-2.5 py-1 rounded-md font-medium">{product.fabricante}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
});

export const MundialBanner = component$((props: { products: ProductOverview[] }) => {
  if (!props.products || props.products.length === 0) return null;

  return (
    <section class="relative bg-[#0a1128] overflow-hidden py-16 lg:py-28">
      {/* Background patterns: Editable from CMS later, hardcoded for now with blend overlay */}
      <img src="/mundial-bg.webp" alt="Fondo Mundial" class="absolute inset-0 w-full h-full object-cover z-0 opacity-50 mix-blend-overlay" />
      <div class="absolute inset-x-0 bottom-0 top-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-[#0a1128]/80 to-[#0a1128] z-0"></div>

      <div class="container relative z-10 mx-auto px-6 md:px-12 flex flex-col lg:flex-row items-center gap-16">
        <div class="lg:w-1/3 text-center lg:text-left flex flex-col items-center lg:items-start z-10">

          <div class="flex gap-2 text-[#D4AF37] mb-4">
            <svg class="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 7.4h7.6l-6.2 4.4 2.4 7.4-6.2-4.4-6.2 4.4 2.4-7.4-6.2-4.4h7.6z" /></svg>
            <svg class="w-7 h-7 transform -translate-y-2" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 7.4h7.6l-6.2 4.4 2.4 7.4-6.2-4.4-6.2 4.4 2.4-7.4-6.2-4.4h7.6z" /></svg>
            <svg class="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 7.4h7.6l-6.2 4.4 2.4 7.4-6.2-4.4-6.2 4.4 2.4-7.4-6.2-4.4h7.6z" /></svg>
          </div>

          <h2 class="font-heading text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-6 uppercase leading-tight">
            Colección <br /> <span class="bg-gradient-to-r from-[#D4AF37] to-[#F3C641] bg-clip-text text-transparent">Mundial</span>
          </h2>
          <p class="text-slate-300 text-base md:text-lg mb-10 leading-relaxed max-w-md mx-auto lg:mx-0">
            Vestí la mística de las tres estrellas. Tejidos seleccionados con los colores de nuestra pasión, creados para marcar la diferencia.
          </p>
          <Link href="/catalogo/" class="inline-flex h-12 md:h-14 items-center justify-center rounded-xl shadow-[0_0_20px_rgba(116,172,223,0.4)] bg-gradient-to-r from-[#74ACDF] to-[#4370b4] px-10 font-bold text-white transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(116,172,223,0.6)] uppercase tracking-wider text-sm">
            Ver línea completa
          </Link>
        </div>

        <div class="lg:w-2/3 w-full">
          <div class="flex overflow-x-auto pb-8 -mx-6 px-6 lg:mx-0 lg:px-0 gap-6 snap-x hide-scrollbar" style={{ scrollbarWidth: 'none' }}>
            {props.products.map(product => (
              <div key={product.id} class="flex-shrink-0 w-[280px] sm:w-[320px] snap-center overflow-hidden rounded-xl border border-[#2a3f7a]/50 bg-white shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 relative group">
                <div class="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
                  <span class="bg-[#D4AF37] text-white px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider shadow-sm w-fit flex items-center gap-1">
                    Colección
                  </span>
                </div>
                <div class="relative aspect-square w-full overflow-hidden bg-gray-100">
                  {product.imageUrl ? (
                    <a href={`/producto/${product.id}/`} class="block w-full h-full">
                      <img src={product.imageUrl} alt={product.name} width={400} height={400} class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                    </a>
                  ) : (
                    <a href={`/producto/${product.id}/`} class="flex h-full w-full items-center justify-center text-gray-300">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    </a>
                  )}
                </div>
                <div class="p-5">
                  <a href={`/producto/${product.id}/`} class="block">
                    <h3 class="font-heading text-lg font-bold text-gray-900 line-clamp-1 hover:text-indigo-600 transition-colors">{product.name}</h3>
                  </a>
                  {product.description && <p class="mt-1.5 text-sm text-gray-500 line-clamp-2">{product.description}</p>}

                  <div class="mt-4 grid grid-cols-2 gap-2 border-t border-gray-100 pt-4">
                    {product.colores && product.colores.length > 0 && (
                      <div class="col-span-2 flex items-center gap-1.5">
                        <span class="flex h-4 w-4 items-center justify-center rounded-full bg-gray-100">
                          <span class="h-2.5 w-2.5 rounded-full bg-gradient-to-tr from-pink-400 via-purple-400 to-indigo-400"></span>
                        </span>
                        <span class="text-xs font-semibold text-gray-500">{product.colores.length} COLORES</span>
                      </div>
                    )}
                    {product.fabricante && (
                      <div class="col-span-2">
                        <span class="text-xs font-semibold text-gray-500">{product.fabricante}</span>
                      </div>
                    )}
                  </div>

                  <div class="mt-5">
                    <a href={`https://wa.me/5491144048614?text=${encodeURIComponent(`Hola, me interesa obtener información sobre el producto de la Línea Mundial: ${product.name}`)}`} target="_blank" rel="noopener noreferrer" class="flex w-full items-center justify-center gap-2 rounded-lg bg-[#31ce5c] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-green-600">
                      <svg class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12.031 0C5.388 0 0 5.385 0 12.029c0 2.122.553 4.192 1.603 6.014L.162 23.3l5.405-1.418C7.329 22.84 9.351 23.362 11.512 23.362c6.641 0 12.03-5.388 12.03-12.031S18.151 0 11.512 0H12.03zm-4.144 6.784c.34-.006.702.012 1.053.05.321.035.753.125 1.018.736.335.77.942 2.302 1.025 2.474.083.172.138.373.027.59-.11.218-.166.353-.332.548-.166.195-.353.414-.509.57a.9.9 0 0 0-.25.641c.01.218.423.89 1.033 1.432.783.696 1.442.912 1.666 1.01.222.098.353.084.484-.064.133-.148.567-.66.719-.886.152-.226.305-.188.509-.111.205.077 1.294.613 1.516.724.221.111.369.166.424.258.055.092.055.535-.138 1.052-.194.516-1.135.992-1.578 1.026-.443.033-.941.055-3.21-.84-2.73-1.077-4.482-3.86-4.618-4.043-.138-.184-1.107-1.474-1.107-2.812s.692-1.996.941-2.254c.25-.258.553-.324.747-.324z" />
                      </svg>
                      Consultar
                    </a>
                    <ShareButton product={{ id: product.id, name: product.name }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
});
