import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { useSiteSettingsLoader } from "../layout";

export default component$(() => {
  const settings = useSiteSettingsLoader();
  const data = settings.value;
  const whatsapp = data.whatsappNumber?.replace(/[^0-9]/g, '') || '5491144048614';
  
  // Create an array of business hours strings by splitting the stored string
  const businessHoursLines = data.businessHours ? data.businessHours.split('\n') : ['Lunes a Viernes:', '9:00 a 18:00 hs', '', 'Sábados:', '9:00 a 14:00 hs'];

  return (
    <div class="py-12 md:py-20 relative bg-gray-50">
      <div class="container mx-auto px-6 md:px-12 relative z-10">
        <header class="mb-12 text-center">
          <h1 class="font-heading text-4xl font-bold tracking-tight text-[#1e2c53] sm:text-5xl">
            Contacto
          </h1>
          <p class="mx-auto mt-4 max-w-2xl text-lg text-gray-500">
            Si estás buscando un mayorista de telas en Once, podés visitarnos en nuestro local o contactarnos para recibir información sobre telas disponibles, colores y stock.
          </p>
        </header>

        <div class="mb-12 grid gap-8 lg:grid-cols-2 xl:gap-12 items-stretch">
          {/* Info Cards Column */}
          <div class="grid gap-6 sm:grid-cols-2 content-start">
              <div class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
                <div class="mb-4 inline-flex rounded-xl bg-[#1e2c53]/5 p-3 text-[#1e2c53]">
                  <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                </div>
                <h3 class="font-heading font-bold text-[#1e2c53]">Dirección</h3>
                <p class="mt-2 text-sm text-gray-500 whitespace-pre-line">
                  {data.address || 'Azcuénaga 650\nOnce, Buenos Aires\nArgentina'}
                </p>
              </div>

              <div class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
                <div class="mb-4 inline-flex rounded-xl bg-[#1e2c53]/5 p-3 text-[#1e2c53]">
                  <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <h3 class="font-heading font-bold text-[#1e2c53]">Horarios</h3>
                <p class="mt-2 text-sm text-gray-500">
                  {businessHoursLines.map((line, idx) => (
                    <span key={idx}>
                      {line}
                      {idx !== businessHoursLines.length - 1 && <br />}
                    </span>
                  ))}
                </p>
              </div>

              <div class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
                <div class="mb-4 inline-flex rounded-xl bg-[#1e2c53]/5 p-3 text-[#1e2c53]">
                  <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                </div>
                <h3 class="font-heading font-bold text-[#1e2c53]">Modalidad de venta</h3>
                <p class="mt-2 text-sm text-gray-500">Ventas por mayor</p>
              </div>

              <div class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
                <div class="mb-4 inline-flex rounded-xl bg-[#1e2c53]/5 p-3 text-[#1e2c53]">
                  <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                </div>
                <h3 class="font-heading font-bold text-[#1e2c53]">Envíos</h3>
                <p class="mt-2 text-sm text-gray-500">Realizamos envíos a todo el país.</p>
              </div>
          </div>

          {/* Form Column */}
          <div class="rounded-xl border border-gray-200 bg-white shadow-lg h-full">
            <div class="p-6 md:p-8">
              <h2 class="mb-2 font-heading text-2xl font-bold text-[#1e2c53]">Envianos tu mensaje</h2>
              <p class="mb-6 text-sm text-gray-500">Completá el formulario y te responderemos a la brevedad.</p>
              <form class="space-y-5" preventdefault:submit>
                <div class="grid gap-5 sm:grid-cols-2">
                  <div class="space-y-2">
                    <label for="name" class="text-sm font-medium text-[#1e2c53]">Nombre / Empresa</label>
                    <input
                      type="text"
                      id="name"
                      class="flex h-11 w-full rounded-lg border border-gray-200 bg-[#f9fafb] px-4 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6272b3] focus:border-transparent transition"
                      placeholder="Ej. Textil Ana"
                      required
                    />
                  </div>
                  <div class="space-y-2">
                    <label for="phone" class="text-sm font-medium text-[#1e2c53]">Teléfono</label>
                    <input
                      type="tel"
                      id="phone"
                      class="flex h-11 w-full rounded-lg border border-gray-200 bg-[#f9fafb] px-4 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6272b3] focus:border-transparent transition"
                      placeholder="Cod. Área + Número"
                      required
                    />
                  </div>
                </div>

                <div class="space-y-2">
                  <label for="email" class="text-sm font-medium text-[#1e2c53]">Email</label>
                  <input
                    type="email"
                    id="email"
                    class="flex h-11 w-full rounded-lg border border-gray-200 bg-[#f9fafb] px-4 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6272b3] focus:border-transparent transition"
                    placeholder="correo@ejemplo.com"
                    required
                  />
                </div>

                <div class="space-y-2">
                  <label for="message" class="text-sm font-medium text-[#1e2c53]">Mensaje o Pedido</label>
                  <textarea
                    id="message"
                    rows={4}
                    class="flex w-full rounded-lg border border-gray-200 bg-[#f9fafb] px-4 py-3 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6272b3] focus:border-transparent transition"
                    placeholder="Contanos qué estás buscando..."
                    required
                  ></textarea>
                </div>

                <button
                  type="submit"
                  class="mt-2 inline-flex w-full items-center justify-center rounded-lg bg-[#1e2c53] px-8 py-3.5 font-semibold text-white transition-all hover:bg-[#6272b3] focus:outline-none focus:ring-2 focus:ring-[#6272b3] focus:ring-offset-2"
                >
                  Enviar Mensaje
                </button>

                <p class="mt-4 text-center text-xs text-gray-400">
                  Al enviar aceptás que nos contactemos con vos. También podés comunicarte directo al <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer" class="text-[#6272b3] hover:underline font-medium">WhatsApp</a>.
                </p>
              </form>
            </div>
          </div>
        </div>

        {/* Google Maps Full Width */}
        <div class="overflow-hidden rounded-xl border border-gray-200 shadow-sm w-full">
          {data.mapEmbedUrl ? (
            <iframe
              src={data.mapEmbedUrl}
              width="100%"
              class="min-h-[500px] md:min-h-[600px] w-full border-0"
              allowFullscreen={false}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Mapa de ubicación"
            ></iframe>
          ) : (
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3283.820625997235!2d-58.4012195!3d-34.6016925!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95bcca9342c3959d%3A0x384115e5d229ecc7!2sTEXTIL%20CCE!5e0!3m2!1ses-419!2sar!4v1700000000000!5m2!1ses-419!2sar"
              width="100%"
              class="min-h-[500px] md:min-h-[600px] w-full border-0"
              allowFullscreen={false}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Mapa de ubicación Textil CCE"
            ></iframe>
          )}
        </div>
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: "Contacto | Mayorista de Telas en Once – Textil CCE",
  meta: [
    {
      name: "description",
      content: "Contactate con Textil CCE en Once (Azcuénaga 650) para compras mayoristas de telas. Abierto L a V 9-18hs, Sáb 9-14hs.",
    },
  ],
};
