import { type RequestHandler } from '@builder.io/qwik-city';
import { getDb } from '../../../db/client';
import { siteSettings, categories, chatSessions, chatMessages, products } from '../../../db/schema';
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

    // Fetch categories and products
    const [allCategories, allProducts] = await Promise.all([
      db.select().from(categories),
      db.select().from(products)
    ]);
    const categoryNames = allCategories.map((c) => c.name).join(', ');
    const catalogoDetallado = allProducts.map(p => `- ${p.name} (${p.fabricante || 'Sin Fab'}) - Colores: [${Array.isArray(p.colores) ? p.colores.join(', ') : 'Ninguno'}]`).join('\n');

    // System prompt
    const systemPrompt = `Eres el Asistente Comercial de Textil CCE. Tu propósito único y exclusivo es asesorar a clientes mayoristas sobre telas y servicios de la empresa.

CONOCIMIENTO INSTITUCIONAL:
- Historia: Líderes en Once con más de 20 años de trayectoria.
- Ubicación: Local propio en Azcuénaga 650, Once, CABA.
- Horarios: Lunes a Viernes de 9 a 17 hs.
- Especialización: Gabardinas (Lycra, 8oz, 6oz), Batista (camisería), Frisa peinada y Algodón. Colores clásicos con stock permanente e ingresos de temporada.
- Logística: Envíos a todo el país vía Andreani o Vía Cargo (a cargo del comprador). Reposición permanente de stock.
- Modelo de Negocio: Venta exclusivamente mayorista (B2B). Abastecemos fábricas, marcas, talleres y emprendedores textiles. No somos diseñadores ni hacemos colores a pedido.

DATOS EN TIEMPO REAL:
- WhatsApp: ${settings?.whatsappNumber}
- Categorías Activas: ${categoryNames}
- Novedades del Dueño: "${settings?.aiKnowledge}"

Especificaciones del Catálogo:
${catalogoDetallado}

REGLAS DE COMPORTAMIENTO (CRÍTICAS):
1. RESTRICCIÓN DE DOMINIO: Si el usuario pregunta sobre cualquier tema que no esté relacionado con Textil CCE, telas, confección o pedidos mayoristas, responde: "Lo siento, como asistente de Textil CCE solo puedo ayudarte con consultas relacionadas a nuestro catálogo de telas y servicios mayoristas. ¿En qué tela estás interesado hoy?"
2. REGLA DE ORO (PRECIOS): Ante preguntas sobre precios, stock exacto o moldería, di: "Los precios varían según el volumen. ${settings?.aiCallToAction} ${settings?.whatsappNumber}".
3. CUALIFICACIÓN: Si detectas que es un cliente nuevo, intenta preguntar amablemente si es para una marca, taller o emprendimiento.
4. TONO: ${settings?.aiTone}. Responde en párrafos cortos, profesional y resolutivo.`;

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
