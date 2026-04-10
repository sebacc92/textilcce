import { component$ } from '@builder.io/qwik';
import { routeLoader$, routeAction$, Form, Link, type DocumentHead } from '@builder.io/qwik-city';
import { getDb } from '../../../db/client';
import { chatSessions, chatMessages } from '../../../db/schema';
import { desc, count, eq } from 'drizzle-orm';

export const useChatSessions = routeLoader$(async ({ env }) => {
  const db = getDb(env);
  
  const sessions = await db
    .select({
      id: chatSessions.id,
      createdAt: chatSessions.createdAt,
      lastActive: chatSessions.lastActive,
      messageCount: count(chatMessages.id),
    })
    .from(chatSessions)
    .leftJoin(chatMessages, eq(chatSessions.id, chatMessages.sessionId))
    .groupBy(chatSessions.id)
    .orderBy(desc(chatSessions.lastActive));
    
  return sessions;
});

export const useDeleteChatAction = routeAction$(async (data, { env, fail }) => {
  const id = data.id as string;
  if (!id) return fail(400, { message: 'ID no proporcionado.' });

  try {
    const db = getDb(env);
    await db.delete(chatMessages).where(eq(chatMessages.sessionId, id));
    await db.delete(chatSessions).where(eq(chatSessions.id, id));
    return { success: true };
  } catch (err) {
    console.error('Error deleting chat session:', err);
    return fail(500, { message: 'Error interno al eliminar el chat.' });
  }
});

export default component$(() => {
  const sessionsLoader = useChatSessions();
  const deleteAction = useDeleteChatAction();

  return (
    <div class="max-w-5xl mx-auto space-y-6 pb-20">
      {deleteAction.value?.success && (
        <div class="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg text-sm font-medium">
          ✅ Chat eliminado exitosamente.
        </div>
      )}
      {deleteAction.value?.failed && (
        <div class="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm font-medium">
          ❌ {deleteAction.value.message}
        </div>
      )}

      <h1 class="text-3xl font-bold text-slate-800">Auditoría de IA</h1>
      <p class="text-slate-600">Revisa las conversaciones recientes que los clientes tuvieron con el Chatbot comercial.</p>

      <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table class="min-w-full divide-y divide-slate-200">
          <thead class="bg-slate-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Fecha / Hora</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Última Actividad</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Mensajes</th>
              <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Acción</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 bg-white">
            {sessionsLoader.value.map((session) => (
              <tr key={session.id} class="hover:bg-slate-50 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                  {session.createdAt ? new Date(session.createdAt).toLocaleString() : 'Desconocido'}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                  {session.lastActive ? new Date(session.lastActive).toLocaleString() : 'Desconocido'}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {session.messageCount} mensajes
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex justify-end gap-3 items-center">
                  <Link href={`/admin/chats/${session.id}/`} class="text-blue-600 hover:text-blue-900 font-semibold transition">
                    Ver Chat &rarr;
                  </Link>
                  <Form action={deleteAction} onSubmit$={(e) => { if(!confirm('¿Estás seguro de eliminar este chat permanentemente?')) e.preventDefault(); }}>
                    <input type="hidden" name="id" value={session.id} />
                    <button
                      type="submit"
                      class="text-red-500 hover:text-red-700 font-medium text-sm transition"
                      onClick$={(e) => {
                        if (!confirm(`¿Seguro que deseas eliminar este chat? Se borrarán ${session.messageCount} mensajes.`)) {
                          e.preventDefault();
                        }
                      }}
                    >
                      Eliminar
                    </button>
                  </Form>
                </td>
              </tr>
            ))}
            {sessionsLoader.value.length === 0 && (
              <tr>
                <td colSpan={4} class="px-6 py-12 text-center text-slate-500">
                  No hay chats registrados a&uacute;n.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: 'Auditoría de IA | Textil CCE',
};
