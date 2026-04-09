import { component$ } from '@builder.io/qwik';
import { routeLoader$, Link, type DocumentHead } from '@builder.io/qwik-city';
import { getDb } from '../../../../db/client';
import { chatMessages, chatSessions } from '../../../../db/schema';
import { eq, asc } from 'drizzle-orm';

export const useChatDetails = routeLoader$(async ({ params, env, error }) => {
  const db = getDb(env);
  
  const [session] = await db.select().from(chatSessions).where(eq(chatSessions.id, params.id)).limit(1);
  if (!session) {
    throw error(404, 'Sesión no encontrada');
  }

  const messages = await db
    .select()
    .from(chatMessages)
    .where(eq(chatMessages.sessionId, session.id))
    .orderBy(asc(chatMessages.createdAt));
    
  return { session, messages };
});

export default component$(() => {
  const chatData = useChatDetails();

  return (
    <div class="max-w-4xl mx-auto space-y-6 pb-20">
      <div class="flex items-center justify-between">
        <h1 class="text-3xl font-bold text-slate-800">Detalle de Conversación</h1>
        <Link href="/admin/chats/" class="text-slate-600 hover:text-slate-900 border border-slate-300 px-4 py-2 rounded-lg bg-white shadow-sm hover:bg-slate-50 transition">
          &larr; Volver
        </Link>
      </div>
      
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div class="bg-slate-50 p-4 border-b border-slate-200 flex justify-between items-center text-sm text-slate-500">
          <div>
            <span class="font-semibold text-slate-700">Sesión ID:</span> {chatData.value.session.id}
          </div>
          <div>
            <span class="font-semibold text-slate-700">Última Actividad:</span> {chatData.value.session.lastActive ? new Date(chatData.value.session.lastActive).toLocaleString() : 'Desconocido'}
          </div>
        </div>
        
        <div class="p-6 space-y-6 bg-slate-100 min-h-[400px]">
          {chatData.value.messages.map((msg) => (
            <div key={msg.id} class={["flex", msg.role === 'user' ? "justify-end" : "justify-start"]}>
              <div class="flex flex-col gap-1 max-w-[80%]">
                <span class={["text-xs font-semibold px-2", msg.role === 'user' ? "text-right text-indigo-600" : "text-left text-slate-600"]}>
                  {msg.role === 'user' ? 'Cliente' : 'Asistente IA'}
                </span>
                <div 
                  class={[
                    "px-4 py-3 text-sm shadow-sm",
                    msg.role === 'user' 
                      ? "bg-indigo-600 text-white rounded-2xl rounded-tr-sm" 
                      : "bg-white border border-slate-200 text-slate-800 rounded-2xl rounded-tl-sm"
                  ]}
                >
                  <p class="whitespace-pre-wrap">{msg.content}</p>
                </div>
                <span class={["text-[10px] text-slate-400 px-2", msg.role === 'user' ? "text-right" : "text-left"]}>
                    {new Date(msg.createdAt).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))}

          {chatData.value.messages.length === 0 && (
            <div class="text-center text-slate-400 py-12">
              Esta sesión no tiene mensajes registrados.
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: 'Detalles de Chat | Textil CCE',
};
