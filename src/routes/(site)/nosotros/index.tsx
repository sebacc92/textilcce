import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";

export default component$(() => {
  return (
    <div class="py-12 md:py-20">
      <div class="container mx-auto px-4 md:px-8">
        <header class="mb-16 text-center">
          <h1 class="font-heading text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Sobre Nosotros
          </h1>
          <p class="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Conocé la historia detrás de Textil CCE y por qué somos líderes en el mercado mayorista de Once.
          </p>
        </header>

        <div class="grid gap-12 lg:grid-cols-2 items-center mb-20">
          <div class="space-y-6">
            <h2 class="font-heading text-3xl font-bold text-foreground">
              Más de 20 Años Vistiendo al País
            </h2>
            <p class="text-lg text-muted-foreground">
              Con más de dos décadas de trayectoria en el mercado textil, Textil CCE se consolidó como un proveedor confiable para marcas de indumentaria de todo el país.
            </p>
            <p class="text-lg text-muted-foreground mb-8">
              Estamos ubicados en Once, uno de los centros comerciales textiles más importantes de Buenos Aires, desde donde abastecemos a emprendedores, talleres y fábricas de indumentaria.
            </p>
            <div class="grid grid-cols-2 gap-6 pt-6 border-t border-border">
              <div>
                <div class="font-heading text-4xl font-black text-primary">20+</div>
                <div class="mt-2 text-sm font-medium text-muted-foreground">Años de Trayectoria</div>
              </div>
              <div>
                <div class="font-heading text-4xl font-black text-primary">TODO</div>
                <div class="mt-2 text-sm font-medium text-muted-foreground">El País Cubierto con Envíos</div>
              </div>
            </div>
          </div>
          <div class="relative overflow-hidden rounded-xl border border-border shadow-lg">
            <div class="aspect-4/3 bg-muted w-full">
               <img
                  src="https://placehold.co/800x600/webp?text=Local+Once"
                  alt="Local de Textil CCE en Once"
                  width="800"
                  height="600"
                  class="h-full w-full object-cover"
                  loading="lazy"
                />
            </div>
            <div class="absolute bottom-4 left-4 right-4 rounded bg-background/90 p-4 backdrop-blur-sm">
              <p class="font-medium">📍 Nuestro amplio local en Azcuénaga 650</p>
            </div>
          </div>
        </div>
        
        <div class="rounded-xl bg-muted p-8 text-center sm:p-12">
          <h3 class="font-heading text-2xl font-bold text-foreground">Nuestro Compromiso</h3>
          <p class="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Nuestro compromiso es ofrecer telas de calidad, variedad de colores y disponibilidad permanente para acompañar el crecimiento de nuestros clientes.
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
