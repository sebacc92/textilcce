import { component$, useSignal } from '@builder.io/qwik';
import { routeLoader$, routeAction$, Form, z, zod$, type DocumentHead } from '@builder.io/qwik-city';
import { getDb } from '../../../db/client';
import { siteSettings } from '../../../db/schema';
import { eq } from 'drizzle-orm';

const DEFAULT_SETTINGS = {
  id: '1',
  aiEnabled: true,
  aiTone: 'Profesional y directo',
  aiKnowledge: '',
  aiCallToAction: 'Para pasarte la lista actualizada y el stock real de hoy, por favor escribinos a nuestro WhatsApp oficial:',
  updatedAt: null,
};

export const useSettingsLoader = routeLoader$(async ({ env }) => {
  const db = getDb(env);
  const [settings] = await db.select().from(siteSettings).where(eq(siteSettings.id, '1')).limit(1);
  return settings ?? DEFAULT_SETTINGS;
});

export const useUpdateAiSettingsAction = routeAction$(
  async (data, requestEvent) => {
    try {
      const db = getDb(requestEvent.env);

      await db.update(siteSettings).set({
        aiEnabled: data.aiEnabled === 'on',
        aiTone: data.aiTone || null,
        aiKnowledge: data.aiKnowledge || null,
        aiCallToAction: data.aiCallToAction || null,
        updatedAt: new Date(),
      }).where(eq(siteSettings.id, '1'));

      return { success: true };
    } catch (e: any) {
      console.error('Error updating AI settings:', e);
      return requestEvent.fail(500, { message: e.message || 'Error al guardar los ajustes de IA.' });
    }
  },
  zod$({
    aiEnabled: z.string().optional(),
    aiTone: z.string().optional(),
    aiKnowledge: z.string().optional(),
    aiCallToAction: z.string().optional(),
  }),
);

export default component$(() => {
  const settings = useSettingsLoader();
  const action = useUpdateAiSettingsAction();
  const isProcessing = useSignal(false);

  const s = settings.value;

  return (
    <div class="max-w-4xl mx-auto space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-3xl font-bold text-slate-800">Escritorio de IA</h1>
      </div>

      {/* Success / Error Messages */}
      {action.value?.success && (
        <div class="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg text-sm font-medium">
          ✅ Ajustes de IA guardados correctamente.
        </div>
      )}
      {action.value?.failed && (
        <div class="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm font-medium">
          ❌ {action.value.message}
        </div>
      )}

      <Form
        action={action}
        class="space-y-8"
        preventdefault:submit
        onSubmit$={() => {
          isProcessing.value = true;
        }}
      >
        {/* Chatbot Section */}
        <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-8 space-y-6">
          <div class="border-b border-slate-100 pb-4">
            <h2 class="text-xl font-semibold text-slate-800 flex items-center gap-2">
              <span>🤖</span> AI Chatbot
            </h2>
            <p class="text-sm text-slate-500 mt-1">Configuración y personalidad del asistente virtual impulsado por IA que atiende a tus clientes.</p>
          </div>

          <div class="flex items-center gap-3 bg-slate-50 p-4 rounded-lg border border-slate-200">
            <input
              type="checkbox"
              id="aiEnabled"
              name="aiEnabled"
              checked={s.aiEnabled ?? true}
              class="w-5 h-5 rounded text-[#6272b3] border-slate-300 focus:ring-[#6272b3] transition cursor-pointer"
            />
            <label for="aiEnabled" class="text-sm font-semibold text-slate-700 cursor-pointer select-none">Activar Chatbot en la página pública</label>
          </div>

          <div class="grid grid-cols-1 gap-6 pt-2">
            <div>
              <label for="aiTone" class="block text-sm font-medium text-slate-700 mb-1.5">Tono y Personalidad de la IA</label>
              <input
                type="text"
                id="aiTone"
                name="aiTone"
                value={s.aiTone || ''}
                placeholder="Ej: Profesional, directo y amable..."
                class="block w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm shadow-sm focus:border-[#6272b3] focus:ring-1 focus:ring-[#6272b3] transition outline-none"
              />
              <p class="text-xs text-slate-400 mt-1.5">Define cómo se expresa el chatbot (ej. serio, juvenil, experto en telas).</p>
            </div>

            <div>
              <label for="aiKnowledge" class="block text-sm font-medium text-slate-700 mb-1.5">Instrucciones del Negocio (Base de Conocimiento)</label>
              <textarea
                id="aiKnowledge"
                name="aiKnowledge"
                rows={6}
                placeholder="Ingresa reglas extra para la IA. Ej: Promociones actuales 20% off abonando en efectivo en el local."
                class="block w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm shadow-sm focus:border-[#6272b3] focus:ring-1 focus:ring-[#6272b3] transition outline-none resize-none"
              >{s.aiKnowledge || ''}</textarea>
              <p class="text-xs text-slate-400 mt-1.5">Reglas personalizadas que la IA adoptará como memoria obligatoria. Incluye aquí políticas de envío, stock o promociones.</p>
            </div>

            <div>
              <label for="aiCallToAction" class="block text-sm font-medium text-slate-700 mb-1.5">Llamado a la Acción (Cierre de Venta)</label>
              <textarea
                id="aiCallToAction"
                name="aiCallToAction"
                rows={3}
                placeholder="Para pasarte la lista actualizada y el stock real de hoy, por favor escribinos a nuestro WhatsApp oficial:"
                class="block w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm shadow-sm focus:border-[#6272b3] focus:ring-1 focus:ring-[#6272b3] transition outline-none resize-none"
              >{s.aiCallToAction || ''}</textarea>
              <p class="text-xs text-slate-400 mt-1.5">Texto final que la IA agregará al recomendar productos. Generalmente dirige al cliente hacia WhatsApp.</p>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div class="flex justify-end pt-4">
          <button
            type="submit"
            disabled={action.isRunning}
            class="bg-slate-900 text-white px-10 py-3.5 rounded-xl font-semibold hover:bg-slate-800 transition shadow-md inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg active:scale-[0.98]"
          >
            {action.isRunning ? (
              <>
                <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Guardando...
              </>
            ) : (
              'Guardar Configuración IA'
            )}
          </button>
        </div>
      </Form>
    </div>
  );
});

export const head: DocumentHead = {
  title: 'Configuración IA | Textil CCE Admin',
};
