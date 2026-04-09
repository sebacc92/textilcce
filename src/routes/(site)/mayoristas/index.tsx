import { component$ } from "@builder.io/qwik";
import { routeLoader$, type DocumentHead } from "@builder.io/qwik-city";
import { getDb } from "../../../db/client";
import { siteContentLists } from "../../../db/schema";

export const useMayoristasLoader = routeLoader$(async ({ env }) => {
  const db = getDb(env);
  return await db.select().from(siteContentLists).orderBy(siteContentLists.displayOrder);
});

export default component$(() => {
  const listsData = useMayoristasLoader();
  const benefits = listsData.value.filter(l => l.type === 'b2b_benefit');
  const clients = listsData.value.filter(l => l.type === 'b2b_client');

  return (
    <div class="py-12 md:py-20">
      <div class="container mx-auto px-6 md:px-12">
        <header class="mb-16 text-center">
          <h1 class="font-heading text-4xl font-bold tracking-tight text-[#1e2c53] sm:text-5xl">
            Venta Mayorista (B2B)
          </h1>
          <div class="mx-auto mt-4 mb-12 max-w-3xl text-center leading-relaxed text-gray-600">
            <p>En Textil CCE trabajamos exclusivamente con ventas por mayor, ofreciendo condiciones comerciales pensadas para profesionales del rubro textil.</p>
            <p class="mt-4">Gracias a nuestra experiencia en el mercado, entendemos las necesidades de producción y ofrecemos asesoramiento para elegir las telas más adecuadas según cada proyecto.</p>
          </div>
        </header>

        <div class="grid gap-12 lg:grid-cols-2 items-center">
          <div>
            <h2 class="mb-8 font-heading text-3xl font-bold text-[#1e2c53]">
              Beneficios Exclusivos
            </h2>
            <ul class="space-y-6">
              {benefits.length > 0 ? benefits.map((item) => (
                <li key={item.id} class="flex gap-4">
                  <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1e2c53]/5 text-[#1e2c53]">
                    <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <div>
                    <h3 class="font-bold text-[#1e2c53]">{item.title}</h3>
                    <p class="text-sm text-gray-500 mt-1">{item.description}</p>
                  </div>
                </li>
              )) : (
                <li class="text-sm text-gray-500">Agrega beneficios desde el panel de control.</li>
              )}
            </ul>
          </div>

          {/* Dark panel */}
          <div class="rounded-xl bg-[#1e2c53] p-8 text-white shadow-xl">
            <h3 class="mb-6 font-heading text-2xl font-bold text-white">¿A quiénes abastecemos?</h3>
            <div class="grid gap-3 sm:grid-cols-2">
              {clients.length > 0 ? clients.map((item) => (
                <div key={item.id} class="flex items-center gap-3 rounded-lg bg-white/10 p-3.5 transition-colors hover:bg-white/15">
                  <svg class="h-5 w-5 text-[#6272b3] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <span class="text-sm font-medium">{item.title}</span>
                </div>
              )) : (
                <div class="text-sm text-white/50">Agrega clientes desde el panel de control.</div>
              )}
            </div>
            <div class="mt-8 text-center border-t border-white/15 pt-6">
              <p class="mb-5 text-base text-white/70">
                Si tenés una marca de ropa o estás empezando tu emprendimiento, podemos ayudarte a encontrar las telas adecuadas para tu colección.
              </p>
              <a
                href="https://wa.me/5491144048614"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex w-full items-center justify-center rounded-lg bg-[#6272b3] px-6 py-3.5 font-semibold text-white transition-all hover:bg-white hover:text-[#1e2c53] focus:outline-none focus:ring-2 focus:ring-[#6272b3] focus:ring-offset-2 focus:ring-offset-[#1e2c53]"
              >
                Solicitar Lista de Precios
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: "Venta Mayorista de Telas para Indumentaria | Once Buenos Aires",
  meta: [
    {
      name: "description",
      content: "Proveedor mayorista de telas en Once. Precios especiales, envíos a todo el país y stock permanente para marcas, talleres y revendedores.",
    },
  ],
};
