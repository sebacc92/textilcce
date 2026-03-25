import { component$ } from "@builder.io/qwik";
import { Link } from "@builder.io/qwik-city";

export const Footer = component$(() => {
  return (
    <footer class="border-t bg-muted text-muted-foreground w-full py-12 px-4 md:px-8">
      <div class="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <div class="space-y-4">
          <h3 class="font-heading text-lg font-bold text-foreground">Textil CCE</h3>
          <p class="text-sm">Más de 20 años siendo líderes mayoristas de telas para indumentaria en Once.</p>
        </div>
        
        <div class="space-y-4">
          <h4 class="font-heading font-semibold text-foreground">Enlaces</h4>
          <ul class="space-y-2 text-sm">
            <li><Link href="/catalogo/" class="hover:text-primary">Catálogo</Link></li>
            <li><Link href="/mayoristas/" class="hover:text-primary">Venta Mayorista</Link></li>
            <li><Link href="/nosotros/" class="hover:text-primary">Nosotros</Link></li>
            <li><Link href="/contacto/" class="hover:text-primary">Contacto</Link></li>
          </ul>
        </div>

        <div class="space-y-4">
          <h4 class="font-heading font-semibold text-foreground">Contacto y Horarios</h4>
          <ul class="space-y-2 text-sm">
            <li>📍 Azcuénaga 650, Once, CABA</li>
            <li>🕒 Lunes a Viernes: 9 a 18 hs</li>
            <li>🕒 Sábados: 9 a 14 hs</li>
            <li>📱 WhatsApp: +54 9 11 4404-8614</li>
          </ul>
        </div>

        <div class="space-y-4">
          <h4 class="font-heading font-semibold text-foreground">Redes Sociales</h4>
          <div class="flex gap-4">
            <a href="https://www.instagram.com/textil_cce/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" class="hover:text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-6 w-6"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
            </a>
            <a href="https://www.facebook.com/TextilCCE" target="_blank" rel="noopener noreferrer" aria-label="Facebook" class="hover:text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-6 w-6"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
            </a>
            <a href="https://www.tiktok.com/@textil_cce" target="_blank" rel="noopener noreferrer" aria-label="TikTok" class="hover:text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-6 w-6"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/></svg>
            </a>
          </div>
        </div>
      </div>
      <div class="container mx-auto mt-12 border-t border-border pt-6 text-center text-xs">
        &copy; {new Date().getFullYear()} Textil CCE. Todos los derechos reservados.
      </div>
    </footer>
  );
});
