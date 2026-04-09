import { type RequestHandler } from '@builder.io/qwik-city';
import { getDb } from '../../../db/client';
import { siteSettings, categories } from '../../../db/schema';
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

    const { messages } = body;

    // Fetch categories
    const allCategories = await db.select().from(categories);
    const categoryNames = allCategories.map((c) => c.name).join(', ');

    // System prompt
    const systemPrompt = `Eres el asistente virtual corporativo de Textil CCE. Vendes telas por mayor B2B. 
Las categorías principales que trabajamos son: ${categoryNames || 'variedad de telas'}.
Nuestro número de WhatsApp para ventas es: ${settings?.whatsappNumber || 'A consultar'}.
Puntualmente atendemos en el horario: ${settings?.businessHours || 'A consultar'}.
Nos encontramos físicamente en: ${settings?.address || 'A consultar'}.

Reglas obligatorias:
1. Responde de forma muy concisa, profesional y enfocada siempre en concretar ventas al por mayor (B2B).
2. Si un usuario te pide precios precisos de la tela, métricas o stock detallado, indícale amablemente que deben comunicarse por WhatsApp para obtener la lista de precios oficial y el stock al momento.
3. El tono debe ser formal pero amistoso, resolutivo.`;

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
          maxOutputTokens: 300,
          temperature: 0.7,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Gemini error:', errorData);
      json(500, { error: 'Hubo un problema al procesar la respuesta con la IA (Gemini).' });
      return;
    }

    const data = await response.json();
    const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!replyText) {
      console.error('Gemini validación fallida:', data);
      json(500, { error: 'Formato de respuesta inválido de Gemini.' });
      return;
    }

    json(200, { reply: { role: 'assistant', content: replyText } });
  } catch (err: any) {
    console.error('Chatbot error:', err);
    requestEvent.json(500, { error: err.message || 'Error inesperado del servidor.' });
  }
};
