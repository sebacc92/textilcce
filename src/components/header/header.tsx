import { component$, useSignal } from "@builder.io/qwik";
import { Link } from "@builder.io/qwik-city";
import Logo from "~/media/logos/horizontal-pantoneP103-16.png?jsx&w=130&h=56"

export const Header = component$(() => {
  const isMenuOpen = useSignal(false);

  const menuItems = [
    { name: "Inicio", href: "/" },
    { name: "Catálogo", href: "/catalogo/" },
    { name: "Mayoristas", href: "/mayoristas/" },
    { name: "Nosotros", href: "/nosotros/" },
    { name: "Contacto", href: "/contacto/" },
  ];

  return (
    <header class="sticky top-0 z-50 w-full bg-[#1e2c53] shadow-md">
      <div class="container mx-auto flex h-20 items-center justify-between px-6 md:px-12">
        <Link href="/" class="flex items-center shrink-0">
          <Logo />
        </Link>

        {/* Desktop Navigation */}
        <nav class="hidden md:flex items-center gap-8">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              class="text-lg font-medium text-white/90 transition-colors hover:text-[#6272b3]"
            >
              {item.name}
            </Link>
          ))}
        </nav>

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
          <nav class="flex flex-col p-6 space-y-1">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                class="text-lg font-medium text-white/90 py-3 px-4 rounded-lg transition-colors hover:bg-white/10 hover:text-[#6272b3]"
                onClick$={() => (isMenuOpen.value = false)}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
});
