import { component$ } from "@builder.io/qwik";
import { Link } from "@builder.io/qwik-city";
import Logo from "~/media/logos/vertical-pantoneP103-16.png?jsx"

export interface FooterProps {
  settings?: Record<string, any>;
}

export const Footer = component$<FooterProps>(({ settings }) => {
  const whatsappNumber = settings?.whatsappNumber || '+54 9 11 4404-8614';
  const whatsappLink = `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}`;
  const addressLines = settings?.address ? settings.address.split('\n') : ['Azcuénaga 650, Once, CABA'];
  const hoursLines = settings?.businessHours ? settings.businessHours.split('\n') : ['Lunes a Viernes: 9 a 17 hs'];

  return (
    <footer class="bg-[#1e2c53] text-white w-full pt-16 pb-8 px-6 md:px-12">
      <div class="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        {/* Logo & Tagline */}
        <div class="space-y-6">
          <Logo />
          <p class="text-base text-white/70 leading-relaxed">
            Más de 20 años siendo líderes mayoristas de telas para indumentaria en Once, Buenos Aires.
          </p>
        </div>

        {/* Links */}
        <div class="space-y-4">
          <h4 class="font-heading font-semibold text-[#6272b3] uppercase text-base tracking-wider">Enlaces</h4>
          <ul class="space-y-3 text-base">
            <li><Link href="/catalogo/" class="text-white/80 hover:text-white transition-colors">Catálogo</Link></li>
            <li><Link href="/mayoristas/" class="text-white/80 hover:text-white transition-colors">Venta Mayorista</Link></li>
            <li><Link href="/nosotros/" class="text-white/80 hover:text-white transition-colors">Nosotros</Link></li>
            <li><Link href="/contacto/" class="text-white/80 hover:text-white transition-colors">Contacto</Link></li>
          </ul>
        </div>

        {/* Contact & Hours */}
        <div class="space-y-4">
          <h4 class="font-heading font-semibold text-[#6272b3] uppercase text-base tracking-wider">Contacto y Horarios</h4>
          <ul class="space-y-3 text-base text-white/80">
            <li class="flex items-start gap-2">
              <span class="text-[#6272b3] mt-0.5">📍</span>
              <div class="flex flex-col">
                {addressLines.map((line: string, i: number) => (
                  <span key={`addr-${i}`}>{line}</span>
                ))}
              </div>
            </li>
            <li class="flex items-start gap-2">
              <span class="text-[#6272b3] mt-0.5">🕒</span>
              <div class="flex flex-col">
                {hoursLines.map((line: string, i: number) => (
                  <span key={`hour-${i}`}>{line}</span>
                ))}
              </div>
            </li>
            <li class="flex items-start gap-2">
              <span class="text-[#6272b3] mt-0.5">📱</span>
              <span>WhatsApp: {whatsappNumber}</span>
            </li>
          </ul>
        </div>

        {/* Social */}
        <div class="space-y-4">
          <h4 class="font-heading font-semibold text-[#6272b3] uppercase text-base tracking-wider">Redes Sociales</h4>
          <div class="flex gap-4">
            {settings?.instagramUrl && (
              <a href={settings.instagramUrl} target="_blank" rel="noopener noreferrer" aria-label="Instagram" class="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-white/80 hover:bg-[#6272b3] hover:text-white transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg>
              </a>
            )}
            {settings?.facebookUrl && (
              <a href={settings.facebookUrl} target="_blank" rel="noopener noreferrer" aria-label="Facebook" class="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-white/80 hover:bg-[#6272b3] hover:text-white transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
              </a>
            )}
            {settings?.tiktokUrl && (
              <a href={settings.tiktokUrl} target="_blank" rel="noopener noreferrer" aria-label="TikTok" class="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-white/80 hover:bg-[#6272b3] hover:text-white transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" /></svg>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div class="container mx-auto mt-12 border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-white/50">
        <span>&copy; {new Date().getFullYear()} Textil CCE. Todos los derechos reservados.</span>
        <span>Mayorista de telas en Once, Buenos Aires</span>
      </div>
    </footer>
  );
});
