import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";

export default component$(() => {
  const categories = [
    {
      title: "Telas de Moda",
      desc: "Telas pensadas para colecciones actuales, con colores y texturas que siguen las tendencias de cada temporada.",
      img: "https://placehold.co/600x400/webp?text=Moda",
    },
    {
      title: "Telas para Confección",
      desc: "Materiales ideales para producción de prendas en talleres y fábricas.",
      img: "https://placehold.co/600x400/webp?text=Confeccion",
    },
    {
      title: "Telas para Moda Urbana",
      desc: "Opciones utilizadas para ropa casual, streetwear y prendas de uso diario.",
      img: "https://placehold.co/600x400/webp?text=Urbana",
    },
    {
      title: "Colores de Temporada",
      desc: "Variedad de colores disponibles para acompañar las tendencias de cada estación.",
      img: "https://placehold.co/600x400/webp?text=Colores",
    },
  ];

  return (
    <div class="py-12 md:py-20">
      <div class="container mx-auto px-4 md:px-8">
        <header class="mb-12 text-center">
          <h1 class="font-heading text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Catálogo de Telas
          </h1>
          <div class="mx-auto mt-6 max-w-3xl text-center text-gray-700 leading-relaxed">
            <p>En Textil CCE ofrecemos un amplio catálogo de telas para indumentaria, pensadas para cubrir las necesidades de marcas de ropa, talleres y emprendedores del rubro textil.</p>
            <p class="mt-4">Nuestro objetivo es brindar variedad, calidad y disponibilidad para que cada cliente pueda desarrollar sus colecciones con materiales confiables.</p>
          </div>
        </header>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {categories.map((cat, index) => (
            <div key={index} class="group overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-shadow hover:shadow-md">
              <div class="aspect-video w-full overflow-hidden bg-muted">
                <img
                  src={cat.img}
                  alt={cat.title}
                  width="600"
                  height="400"
                  class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
              <div class="p-6">
                <h3 class="mb-2 font-heading text-xl font-bold text-card-foreground">
                  {cat.title}
                </h3>
                <p class="text-sm text-muted-foreground">
                  {cat.desc}
                </p>
                <a
                  href="https://wa.me/5491144048614"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="mt-6 inline-flex w-full items-center justify-center rounded-sm bg-accent/10 px-4 py-2 text-sm font-medium text-accent transition-colors hover:bg-accent/20"
                >
                  Consultar Stock y Precios
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* SEO Adicional */}
        <div class="mt-16 rounded-2xl bg-slate-50 py-12 px-6 shadow-sm">
          <div class="max-w-4xl mx-auto text-center">
            <p class="text-lg text-gray-800 font-medium">
              Si buscás telas por mayor en Once, en Textil CCE vas a encontrar una gran variedad de opciones para desarrollar tu línea de indumentaria con stock permanente y precios mayoristas.
            </p>
            <a
              href="https://wa.me/5491144048614"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex mt-8 px-6 py-3 font-medium text-primary border-2 border-primary rounded-sm transition-colors hover:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              ¿Necesitás asesoramiento? Escribinos
            </a>
          </div>
        </div>
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: "Telas para Indumentaria por Mayor | Mayorista de Telas en Once | Catálogo de Telas para Indumentaria",
  meta: [
    {
      name: "description",
      content: "Descubrí el catálogo completo de Textil CCE en Once. Telas de moda, confección, urbanas y de sastrería. Venta por mayor al mejor precio.",
    },
  ],
};
