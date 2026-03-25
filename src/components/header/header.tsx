import { component$ } from "@builder.io/qwik";
import { Link } from "@builder.io/qwik-city";

export const Header = component$(() => {
  return (
    <header class="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div class="container mx-auto flex h-16 items-center justify-between px-4 md:px-8">
        <Link href="/" class="flex items-center space-x-2">
          {/* Logo placeholder */}
          <div class="h-8 w-8 rounded-sm bg-primary" />
          <span class="font-heading text-xl font-bold tracking-tight text-primary">Textil CCE</span>
        </Link>
        <nav class="hidden md:flex gap-6">
          <Link href="/" class="text-sm font-medium transition-colors hover:text-primary">
            Inicio
          </Link>
          <Link href="/catalogo/" class="text-sm font-medium transition-colors hover:text-primary">
            Catálogo
          </Link>
          <Link href="/mayoristas/" class="text-sm font-medium transition-colors hover:text-primary">
            Mayoristas
          </Link>
          <Link href="/nosotros/" class="text-sm font-medium transition-colors hover:text-primary">
            Nosotros
          </Link>
          <Link href="/contacto/" class="text-sm font-medium transition-colors hover:text-primary">
            Contacto
          </Link>
        </nav>
        {/* Mobile menu toggle placeholder */}
        <button class="md:hidden p-2 text-foreground">
          <svg xmlns="http://www.0.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-6 w-6"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
        </button>
      </div>
    </header>
  );
});
