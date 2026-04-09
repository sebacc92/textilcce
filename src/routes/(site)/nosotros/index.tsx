import { component$ } from "@builder.io/qwik";
import { routeLoader$, type DocumentHead } from "@builder.io/qwik-city";
import LocalImg from "~/media/local.webp?jsx"
import { getDb } from "../../../db/client";
import { siteSettings } from "../../../db/schema";
import { eq } from "drizzle-orm";

export const useAboutLoader = routeLoader$(async ({ env }) => {
  const db = getDb(env);
  const [settings] = await db.select().from(siteSettings).where(eq(siteSettings.id, '1')).limit(1);
  return settings || {
    aboutP1: 'Con más de dos décadas de trayectoria en el mercado textil, Textil CCE se consolidó como un proveedor confiable para marcas de indumentaria de todo el país.',
    aboutP2: 'Estamos ubicados en Once, uno de los centros comerciales textiles más importantes de Buenos Aires, desde donde abastecemos a emprendedores, talleres y fábricas de indumentaria.',
    commitmentText: 'Nuestro compromiso es ofrecer telas de calidad, variedad de colores y disponibilidad permanente para acompañar el crecimiento de nuestros clientes.',
    statsYears: '20+',
    statsCoverage: 'TODO',
  };
});

export default component$(() => {
  const settings = useAboutLoader();
  const data = settings.value;

  return (
    <div class="py-12 md:py-20">
      <div class="container mx-auto px-6 md:px-12">
        <header class="mb-16 text-center">
          <h1 class="font-heading text-4xl font-bold tracking-tight text-[#1e2c53] sm:text-5xl">
            Sobre Nosotros
          </h1>
          <p class="mx-auto mt-4 max-w-2xl text-lg text-gray-500">
            Conocé la historia detrás de Textil CCE y por qué somos líderes en el mercado mayorista de Once.
          </p>
        </header>

        <div class="grid gap-12 lg:grid-cols-2 items-center mb-20">
          <div class="space-y-6">
            <h2 class="font-heading text-3xl font-bold text-[#1e2c53]">
              Más de 20 Años Vistiendo al País
            </h2>
            <p class="text-lg text-gray-600 leading-relaxed">
              {data.aboutP1}
            </p>
            <p class="text-lg text-gray-600 leading-relaxed">
              {data.aboutP2}
            </p>
            <div class="grid grid-cols-2 gap-8 pt-8 border-t border-[#6272b3]/20">
              <div>
                <div class="font-heading text-4xl font-black text-[#1e2c53]">{data.statsYears}</div>
                <div class="mt-2 text-sm font-medium text-gray-500">Años de Trayectoria</div>
              </div>
              <div>
                <div class="font-heading text-4xl font-black text-[#1e2c53]">{data.statsCoverage}</div>
                <div class="mt-2 text-sm font-medium text-gray-500">El País Cubierto con Envíos</div>
              </div>
            </div>
          </div>
          <div class="relative overflow-hidden rounded-xl border border-gray-200 shadow-lg">
            <div class="aspect-4/3 bg-[#f3f4f6] w-full">
               <LocalImg class="h-full w-full object-cover" />
            </div>
            <div class="absolute bottom-4 left-4 right-4 rounded-lg bg-white/95 p-4 backdrop-blur-sm shadow-sm">
              <p class="font-medium text-[#1e2c53]">📍 Nuestro amplio local en Azcuénaga 650</p>
            </div>
          </div>
        </div>

        <div class="rounded-xl bg-[#1e2c53] p-8 text-center sm:p-12">
          <h3 class="font-heading text-2xl font-bold text-white">Nuestro Compromiso</h3>
          <p class="mx-auto mt-4 max-w-2xl text-white/70">
            {data.commitmentText}
          </p>
        </div>
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: "Mayorista de Telas en Once con más de 20 años | Textil CCE",
  meta: [
    {
      name: "description",
      content: "Conocé la historia de Textil CCE. Más de dos décadas abasteciendo a marcas y talleres desde nuestro local en pleno Once.",
    },
  ],
};
