import { component$, Slot } from "@builder.io/qwik";
import type { RequestHandler } from "@builder.io/qwik-city";
import { Header } from "../../components/header/header";
import { Footer } from "../../components/footer/footer";
import { WhatsAppButton } from "../../components/whatsapp-button";

export const onGet: RequestHandler = async ({ cacheControl }) => {
  cacheControl({
    staleWhileRevalidate: 60 * 60 * 24 * 7,
    maxAge: 5,
  });
};

export default component$(() => {
  return (
    <div class="flex min-h-screen flex-col font-sans">
      <Header />
      <main class="flex-1">
        <Slot />
      </main>
      <Footer />
      <WhatsAppButton phone="5491144048614" message="Hola Textil CCE, me gustaría recibir más información sobre venta mayorista." />
    </div>
  );
});
