import { component$ } from "@builder.io/qwik";

export const WhatsAppButton = component$(() => {
  return (
    <a
      href="https://wa.me/5491144048614"
      target="_blank"
      rel="noopener noreferrer"
      class="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-lg transition-transform hover:scale-110 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-accent/50"
      aria-label="Contactar por WhatsApp"
    >
      <svg
        xmlns="http://www.0.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        class="h-8 w-8"
      >
        <path d="M12.031 0C5.388 0 0 5.385 0 12.029c0 2.122.553 4.192 1.603 6.014L.162 23.3l5.405-1.418C7.329 22.84 9.351 23.362 11.512 23.362c6.641 0 12.03-5.388 12.03-12.031S18.151 0 11.512 0H12.03zm-4.144 6.784c.34-.006.702.012 1.053.05.321.035.753.125 1.018.736.335.77.942 2.302 1.025 2.474.083.172.138.373.027.59-.11.218-.166.353-.332.548-.166.195-.353.414-.509.57a.9.9 0 0 0-.25.641c.01.218.423.89 1.033 1.432.783.696 1.442.912 1.666 1.01.222.098.353.084.484-.064.133-.148.567-.66.719-.886.152-.226.305-.188.509-.111.205.077 1.294.613 1.516.724.221.111.369.166.424.258.055.092.055.535-.138 1.052-.194.516-1.135.992-1.578 1.026-.443.033-.941.055-3.21-.84-2.73-1.077-4.482-3.86-4.618-4.043-.138-.184-1.107-1.474-1.107-2.812s.692-1.996.941-2.254c.25-.258.553-.324.747-.324z" />
      </svg>
    </a>
  );
});
