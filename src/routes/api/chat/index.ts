import { type RequestHandler } from '@builder.io/qwik-city';
import { getDb } from '../../../db/client';
import { siteSettings, categories, chatSessions, chatMessages } from '../../../db/schema';
import { eq } from 'drizzle-orm';

export const onPost: RequestHandler = async (requestEvent) => {
  try {
    const { request, env, json } = requestEvent;

    // Check if chatbot is enabled before processing
    const db = getDb(env);
    const [settings] = await db.select().from(siteSettings).where(eq(siteSettings.id, '1')).limit(1);

    if (settings && !settings.chatbotEnabled) {
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
"${settings?.chatbotKnowledge || ''}"

Regla de Oro:
Si preguntan por precios por rollo, di: "Los precios varían según el volumen. Para pasarte la lista actualizada y el stock real de hoy, por favor escribinos a nuestro WhatsApp oficial: ${settings?.whatsappNumber || 'A consultar'}".`;

    console.log('systemPrompt', systemPrompt)
    const geminiApiKey = env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      console.error('GEMINI_API_KEY no está configurada.');
      json(500, { error: 'API Key de Gemini no configurada.' });
      return;
    }

    const geminiMessages = messages.map((msg: any) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));

    let replyText = '';
    const fallbackMessage = `Ups, en este momento tengo muchas consultas simultáneas. 😅 Por favor, para darte una atención rápida, escribinos directamente a nuestro WhatsApp oficial: ${settings?.whatsappNumber || ''}`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${geminiApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: systemPrompt }],
          },
          contents: geminiMessages,
          generationConfig: {
            maxOutputTokens: 400,
            temperature: 0.3,
          },
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.error('Gemini error de API, status:', response.status);
        replyText = fallbackMessage;
      } else {
        const data = await response.json();
        replyText = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!replyText) {
          console.error('Gemini validación fallida:', data);
          replyText = fallbackMessage;
        }
      }
    } catch (geminiErr: any) {
      console.error('Error procesando respuesta o timeout de Gemini:', geminiErr);
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
