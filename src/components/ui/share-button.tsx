import { component$, $, useSignal, useVisibleTask$ } from '@builder.io/qwik';

export const ShareButton = component$((props: { product: {id: string, name: string}, design?: 'default' | 'large' }) => {
  const showToast = useSignal(false);
  const currentUrl = useSignal('');

  // Get the URL dynamically on the client side
  useVisibleTask$(() => {
    // Generate absolute URL for the specific product
    currentUrl.value = window.location.origin + '/producto/' + props.product.id;
  });

  const handleShare = $(async () => {
    const shareData = {
      title: 'Textil CCE',
      text: `Mira esta tela en Textil CCE: ${props.product.name}`,
      url: currentUrl.value,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err) {
        // Ignorar si el usuario cancela
        console.log('Error sharing or user canceled', err);
      }
    } 
    
    // Fallback
    try {
      await navigator.clipboard.writeText(`${shareData.text} - ${shareData.url}`);
      showToast.value = true;
      setTimeout(() => {
        showToast.value = false;
      }, 3000);
    } catch (err) {
      console.error('Lamentablemente no se pudo copiar el enlace', err);
    }
  });

  const btnClasses = props.design === 'large' 
    ? "inline-flex h-full min-h-[56px] w-full items-center justify-center gap-2 rounded-xl bg-slate-100 px-6 py-4 text-base font-bold text-slate-700 transition-colors hover:bg-slate-200"
    : "mt-2 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-200 hover:text-slate-900";

  return (
    <>
      <button 
        type="button" 
        onClick$={handleShare}
        class={btnClasses}
        title="Compartir producto"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="18" cy="5" r="3"></circle>
          <circle cx="6" cy="12" r="3"></circle>
          <circle cx="18" cy="19" r="3"></circle>
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
        </svg>
        Compartir
      </button>

      {/* Toast Notification */}
      <div 
        class={`fixed bottom-4 left-1/2 z-[100] -translate-x-1/2 transform transition-all duration-300 ${
          showToast.value ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'
        }`}
      >
        <div class="flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-2 text-sm text-white shadow-xl">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-green-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
          </svg>
          Enlace copiado al portapapeles
        </div>
      </div>
    </>
  );
});
