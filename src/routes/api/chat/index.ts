import { type RequestHandler } from '@builder.io/qwik-city';
import { getDb } from '../../../db/client';
import { siteSettings, categories, chatSessions, chatMessages } from '../../../db/schema';
import { eq } from 'drizzle-orm';
import OpenAI from 'openai';

export const onPost: RequestHandler = async (requestEvent) => {
  try {
    const { request, env, json } = requestEvent;

    // Check if chatbot is enabled before processing
    const db = getDb(env);
    const [settings] = await db.select().from(siteSettings).where(eq(siteSettings.id, '1')).limit(1);

    if (settings && !settings.aiEnabled) {
      json(403, { error: 'El Chatbot se encuentra deshabilitado actualmente.' });
      return;
    }

    const body = await request.json();
    if (!body || !body.messages) {
      json(400, { error: 'Faltan mensajes en la petición.' });
      return;
    }

    const { messages, sessionId } = body;

    if (sessionId) {
      await db.insert(chatSessions).values({
        id: sessionId,
        createdAt: new Date(),
        lastActive: new Date()
      }).onConflictDoUpdate({
        target: chatSessions.id,
        set: { lastActive: new Date() }
      });

      const lastUserMessage = messages[messages.length - 1];
      if (lastUserMessage && lastUserMessage.role === 'user') {
        const idStr = 'msg-' + Date.now().toString() + Math.floor(Math.random() * 1000);
        await db.insert(chatMessages).values({
          id: idStr,
          sessionId: sessionId,
          role: 'user',
          content: lastUserMessage.content,
          createdAt: new Date()
        });
      }
    }

    // Fetch categories
    const allCategories = await db.select().from(categories);
    const categoryNames = allCategories.map((c) => c.name).join(', ');

    // System prompt
    const systemPrompt = `Eres el Asistente Comercial de Textil CCE. Tu objetivo es asesorar a clientes mayoristas.
Datos de la empresa:
- WhatsApp: ${settings?.whatsappNumber || 'A consultar'}
- Ubicación: ${settings?.address || 'A consultar'} en Once, CABA.
- Categorías: ${categoryNames || 'variedad de telas'}.

Tu personalidad:
- Tono: ${settings?.aiTone || 'Profesional y directo'}.
- Estilo: Responde en párrafos cortos. Usa emojis textiles (🧵, 👗) con moderación.

Instrucciones del Negocio (Cargadas por el cliente):
"${settings?.aiKnowledge || ''}"

Regla de Oro:
Si preguntan por precios por rollo, di: "Los precios varían según el volumen. ${settings?.aiCallToAction || 'Para pasarte la lista actualizada y el stock real de hoy, por favor escribinos a nuestro WhatsApp oficial:'} ${settings?.whatsappNumber || 'A consultar'}".`;

    const openaiApiKey = env.get('OPENAI_API_KEY') || (typeof process !== 'undefined' ? process.env.OPENAI_API_KEY : '');
    if (!openaiApiKey) {
      console.error('OPENAI_API_KEY no está configurada.');
      json(500, { error: 'API Key de OpenAI no configurada.' });
      return;
    }

    const openai = new OpenAI({ apiKey: openaiApiKey });

    const openAiMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.map((msg: any) => ({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content,
      }))
    ];

    let replyText = '';
    const fallbackMessage = `Ups, en este momento tengo muchas consultas simultáneas. 😅 Por favor, para darte una atención rápida, escribinos directamente a nuestro WhatsApp oficial: ${settings?.whatsappNumber || ''}`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const response = await openai.chat.completions.create(
        {
          model: 'gpt-4o-mini',
          messages: openAiMessages as any,
          max_tokens: 500,
          temperature: 0.3,
        },
        { signal: controller.signal }
      );

      clearTimeout(timeoutId);

      replyText = response.choices[0]?.message?.content || '';

      if (!replyText) {
        console.error('OpenAI validación fallida: respuesta vacía');
        replyText = fallbackMessage;
      }
    } catch (openaiErr: any) {
      console.error('Error procesando respuesta o timeout de OpenAI:', openaiErr);
      replyText = fallbackMessage;
    }

    if (sessionId) {
      const idStr = 'msg-' + Date.now().toString() + Math.floor(Math.random() * 1000);
      await db.insert(chatMessages).values({
        id: idStr,
        sessionId: sessionId,
        role: 'assistant',
        content: replyText,
        createdAt: new Date()
      });
    }

    json(200, { reply: { role: 'assistant', content: replyText } });
  } catch (err: any) {
    console.error('Chatbot error:', err);
    requestEvent.json(500, { error: err.message || 'Error inesperado del servidor.' });
  }
};
