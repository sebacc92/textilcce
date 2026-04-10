import { component$, useSignal } from "@builder.io/qwik";
import { Link } from "@builder.io/qwik-city";
import { NavLink } from "../nav-link/nav-link";
import Logo from "~/media/logos/horizontal-pantoneP103-16.png?jsx&w=170&h=72"

export const Header = component$(() => {
  const isMenuOpen = useSignal(false);

  const menuItems = [
    { name: "Inicio", href: "/" },
    { name: "Catálogo", href: "/catalogo/" },
    { name: "Mayoristas", href: "/mayoristas/" },
    { name: "Nosotros", href: "/nosotros/" },
    { name: "Contacto", href: "/contacto/" },
  ];

  const socialLinks = [
    {
      name: "Instagram",
      href: "https://www.instagram.com/textil_cce/",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
        </svg>
      ),
    },
    {
      name: "Facebook",
      href: "https://www.facebook.com/TextilCCE",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
        </svg>
      ),
    },
    {
      name: "TikTok",
      href: "https://www.tiktok.com/@textil_cce",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
        </svg>
      ),
    },
  ];

  return (
    <header class="sticky top-0 z-50 w-full bg-[#1e2c53] shadow-md">
      <div class="container mx-auto flex h-24 items-center justify-between px-6 md:px-12">
        <Link href="/" class="flex items-center shrink-0">
          <Logo />
        </Link>

        <div class="hidden md:flex items-center gap-10">
          {/* Desktop Navigation */}
          <nav class="flex items-center gap-8">
            {menuItems.map((item) => (
              <NavLink
                key={item.href}
                href={item.href}
                class="text-lg font-semibold uppercase tracking-wide text-white/90 transition-colors hover:text-[#6272b3]"
                activeClass="!text-[#6272b3]"
              >
                {item.name}
              </NavLink>
            ))}
          </nav>

          {/* Desktop Social Links */}
          <div class="flex items-center gap-4">
            {socialLinks.map((social) => (
              <a
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.name}
                class="text-white/90 transition-colors hover:text-[#6272b3]"
              >
                {social.icon}
              </a>
            ))}
          </div>
        </div>

        {/* Mobile menu toggle */}
        <button
          class="md:hidden p-2 text-white focus:outline-none"
          onClick$={() => (isMenuOpen.value = !isMenuOpen.value)}
          aria-label="Toggle menu"
        >
          {isMenuOpen.value ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" x2="20" y1="12" y2="12" /><line x1="4" x2="20" y1="6" y2="6" /><line x1="4" x2="20" y1="18" y2="18" /></svg>
          )}
        </button>
      </div>

      {/* Mobile Menu Drawer */}
      {isMenuOpen.value && (
        <div class="md:hidden border-t border-white/10 bg-[#1e2c53] shadow-xl">
          <nav class="flex flex-col items-center p-6 space-y-1">
            {menuItems.map((item) => (
              <NavLink
                key={item.href}
                href={item.href}
                class="text-center text-lg font-semibold uppercase tracking-wide text-white/90 py-3 px-4 rounded-lg transition-colors hover:bg-white/10 hover:text-[#6272b3] w-full"
                activeClass="bg-white/10 !text-[#6272b3]"
                onClick$={() => (isMenuOpen.value = false)}
              >
                {item.name}
              </NavLink>
            ))}
          </nav>

          <div class="px-6 pb-6">
            <div class="border-t border-white/10 pt-5">
              <div class="flex items-center justify-center gap-6">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.name}
                    class="text-white/90 transition-colors hover:text-[#6272b3]"
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
});
