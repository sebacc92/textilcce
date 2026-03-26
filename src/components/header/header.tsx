import { component$, useSignal } from "@builder.io/qwik";
import { Link } from "@builder.io/qwik-city";

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
    <header class="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 text-slate-900">
      <div class="container mx-auto flex h-16 items-center justify-between px-4 md:px-8">
        <Link href="/" class="flex items-center space-x-2">
          {/* Logo placeholder */}
          <div class="h-8 w-8 rounded-sm bg-primary" />
          <span class="font-heading text-xl font-bold tracking-tight text-primary">Textil CCE</span>
        </Link>

        {/* Desktop Navigation */}
        <nav class="hidden md:flex gap-8">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              class="text-xl font-medium transition-colors hover:text-primary"
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Mobile menu toggle */}
        <button
          class="md:hidden p-2 text-foreground focus:outline-none"
          onClick$={() => (isMenuOpen.value = !isMenuOpen.value)}
          aria-label="Toggle menu"
        >
          {isMenuOpen.value ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-7 w-7"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-7 w-7"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
          )}
        </button>
      </div>

      {/* Mobile Menu Drawer */}
      {isMenuOpen.value && (
        <div class="md:hidden border-t bg-background animate-in slide-in-from-top duration-300 shadow-xl relative z-50">
          <nav class="flex flex-col p-6 space-y-4">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                class="text-xl font-medium py-3 transition-colors hover:text-primary border-b border-slate-100 last:border-0"
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
