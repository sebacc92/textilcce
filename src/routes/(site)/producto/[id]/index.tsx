import { component$ } from "@builder.io/qwik";
import { routeLoader$, type DocumentHead } from "@builder.io/qwik-city";
import { getDb } from "~/db/client";
import { products, categories } from "~/db/schema";
import { eq } from "drizzle-orm";
import { ShareButton } from "~/components/ui/share-button";
import { useSiteSettingsLoader } from "../../layout";

export const useProductLoader = routeLoader$(async (requestEvent) => {
  const db = getDb(requestEvent.env);
  const productId = requestEvent.params.id;

  const result = await db
    .select({
      id: products.id,
      name: products.name,
      description: products.description,
      imageUrl: products.imageUrl,
      colores: products.colores,
      fabricante: products.fabricante,
      oz: products.oz,
      composicion: products.composicion,
      ancho: products.ancho,
      rinde: products.rinde,
      complemento: products.complemento,
      sublimar: products.sublimar,
      estampar: products.estampar,
      bordar: products.bordar,
      season: products.season,
      isOffer: products.isOffer,
      categoryName: categories.name,
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(eq(products.id, productId))
    .limit(1);

  if (!result || result.length === 0) {
    throw requestEvent.redirect(302, "/catalogo/");
  }

  return result[0];
});

export default component$(() => {
  const productLoader = useProductLoader();
  const product = productLoader.value;
  const settings = useSiteSettingsLoader();

  const phone = settings.value?.whatsapp || "5491144048614";
  const consultMessage = `Hola, me interesa obtener información sobre el producto: ${product.name} (Catalogado en ${product.categoryName || 'Telas'})`;

  return (
    <div class="min-h-screen bg-slate-50 py-12 sm:py-24">
      <div class="container mx-auto px-6 md:px-12 max-w-6xl">
        <div class="mb-6 flex items-center gap-2 text-sm text-slate-500">
          <a href="/" class="hover:text-indigo-600 transition-colors">Inicio</a>
          <span>/</span>
          <a href="/catalogo/" class="hover:text-indigo-600 transition-colors">Catálogo</a>
          <span>/</span>
          <span class="text-slate-800 font-semibold">{product.name}</span>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          {/* Imagen */}
          <div class="relative bg-slate-200 aspect-[4/3] lg:aspect-auto">
            {product.imageUrl ? (
              <img 
                src={product.imageUrl} 
                alt={`Tela ${product.name}`} 
                class="w-full h-full object-cover" 
              />
            ) : (
              <div class="flex items-center justify-center h-full text-slate-400">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-24 w-24" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
              </div>
            )}
            
            <div class="absolute top-6 left-6 flex flex-col gap-2">
              {product.isOffer && (
                <span class="bg-orange-500 text-white px-3 py-1 rounded shadow text-xs font-bold uppercase tracking-wider">
                  Oferta
                </span>
              )}
            </div>
          </div>

          {/* Info */}
          <div class="p-8 md:p-12 flex flex-col">
            <div class="mb-2">
              <span class="text-xs font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full">
                {product.categoryName || 'Categoría General'}
              </span>
            </div>
            
            <h1 class="font-heading text-3xl md:text-5xl font-bold text-slate-900 mt-4 mb-4">
              {product.name}
            </h1>
            
            {product.description && (
              <p class="text-slate-600 text-lg leading-relaxed mb-8">
                {product.description}
              </p>
            )}

            <div class="grid grid-cols-2 sm:grid-cols-3 gap-6 mb-10 py-6 border-y border-slate-100">
              {product.colores && product.colores.length > 0 && (
                <div>
                  <span class="block text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1">Variantes</span>
                  <span class="text-slate-800 font-medium">{product.colores.length} colores</span>
                </div>
              )}
              {product.ancho && (
                <div>
                  <span class="block text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1">Ancho</span>
                  <span class="text-slate-800 font-medium">{product.ancho}</span>
                </div>
              )}
              {product.rinde && (
                <div>
                  <span class="block text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1">Rinde</span>
                  <span class="text-slate-800 font-medium">{product.rinde}</span>
                </div>
              )}
              {product.composicion && (
                <div>
                  <span class="block text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1">Comp.</span>
                  <span class="text-slate-800 font-medium">{product.composicion}</span>
                </div>
              )}
            </div>

            <div class="mt-auto flex flex-col sm:flex-row gap-4">
              <a 
                href={`https://wa.me/${phone}?text=${encodeURIComponent(consultMessage)}`}
                target="_blank"
                rel="noopener noreferrer"
                class="flex-1 inline-flex items-center justify-center gap-2 bg-[#1e2c53] text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-indigo-900 transition-colors shadow-lg"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                </svg>
                Intersado en la tela
              </a>
              <div class="sm:w-1/3">
                <ShareButton product={{ id: product.id, name: product.name }} design="large" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export const head: DocumentHead = ({ resolveValue }) => {
  const product = resolveValue(useProductLoader);
  return {
    title: `${product.name} | Textil CCE`,
    meta: [
      {
        name: "description",
        content: product.description || `Comprá tela ${product.name} por mayor en Textil CCE.`,
      },
    ],
  };
};
