import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { getTenantIdAdmin } from "@/lib/tenant";
import {
  countRecentUserMessages,
  getRecentMessages,
  saveOutboundMessage,
  saveWebMessage,
} from "@/lib/data/whatsappMessages";
import { findLeadIdByPhone, upsertWhatsappLead } from "@/lib/data/whatsappLeads";
import { generateAgentReply } from "@/lib/agent/respond";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const SESSION_COOKIE = "demo_chat_session";
const MAX_MESSAGE_LENGTH = 1000;
// Tope por sesión. 30 mensajes/hora es holgado para alguien probando la demo en serio y
// corta un loop automatizado antes de que queme la cuota gratis de Gemini.
const RATE_LIMIT_MAX_MESSAGES = 30;
const RATE_LIMIT_WINDOW_MINUTES = 60;

/**
 * Identifica la conversación del visitante. Se genera **en el servidor** y viaja en una
 * cookie httpOnly: nunca lo manda el cliente.
 *
 * Esto no es decorativo. El id se usa como `phone` en `whatsapp_messages` y en `leads`, que
 * es la misma columna donde viven las conversaciones reales de WhatsApp. Si el cliente
 * pudiera elegirlo, mandando un teléfono real leería el historial de esa persona. Con la
 * cookie httpOnly el valor es inelegible para el cliente, y el prefijo `web-` mantiene el
 * espacio de nombres separado del de los teléfonos.
 */
async function getOrCreateSessionId(): Promise<{ sessionId: string; isNew: boolean }> {
  const store = await cookies();
  const existing = store.get(SESSION_COOKIE)?.value;
  if (existing?.startsWith("web-")) {
    return { sessionId: existing, isNew: false };
  }
  return { sessionId: `web-${randomUUID()}`, isNew: true };
}

export async function POST(request: Request) {
  let body: { message?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Bad Request" }, { status: 400 });
  }

  const message = typeof body.message === "string" ? body.message.trim() : "";
  if (!message) {
    return NextResponse.json({ error: "Mensaje vacío" }, { status: 400 });
  }
  if (message.length > MAX_MESSAGE_LENGTH) {
    return NextResponse.json({ error: "Mensaje demasiado largo" }, { status: 413 });
  }

  const { sessionId, isNew } = await getOrCreateSessionId();

  try {
    const supabase = createAdminClient();
    const tenantId = await getTenantIdAdmin(supabase);

    const recentCount = await countRecentUserMessages(supabase, tenantId, sessionId, RATE_LIMIT_WINDOW_MINUTES);
    if (recentCount >= RATE_LIMIT_MAX_MESSAGES) {
      return NextResponse.json(
        {
          reply:
            "Llegaste al límite de mensajes por hora de la demo. Si querés seguir la consulta, escribinos por WhatsApp y te atiende un asesor.",
        },
        { status: 200 }
      );
    }

    // El lead NO se crea acá. El chat es público: si cada visitante que escribe "hola" y se
    // va dejara una ficha, `leads` se llenaría de filas vacías. Se crea perezosamente, recién
    // cuando alguna herramienta necesita escribir algo (ver ToolContext.ensureLeadId).
    // Cuando nace, lo hace con source 'web_demo' para poder filtrarlo y borrarlo aparte de
    // los leads reales de WhatsApp (ver supabase/schema.sql), y su `phone` arranca siendo el
    // id de sesión hasta que el visitante dé uno real (tool save_contact).
    let leadId = await findLeadIdByPhone(supabase, tenantId, sessionId, "web_demo");
    const ensureLeadId = async () => {
      leadId ??= (await upsertWhatsappLead(supabase, tenantId, sessionId, undefined, "web_demo")).id;
      return leadId;
    };

    const history = await getRecentMessages(supabase, tenantId, sessionId);

    await saveWebMessage(supabase, tenantId, sessionId, "user", message);

    const reply = await generateAgentReply({
      supabase,
      tenantId,
      phone: sessionId,
      ensureLeadId,
      existingLeadId: leadId,
      channel: "web",
      history,
      userMessage: message,
    });

    await saveOutboundMessage(supabase, tenantId, sessionId, reply);

    const response = NextResponse.json({ reply });
    if (isNew) {
      response.cookies.set(SESSION_COOKIE, sessionId, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24, // 24hs: la demo es una sesión, no una relación a largo plazo.
      });
    }
    return response;
  } catch (err) {
    console.error("chat web: error generando respuesta", err);
    return NextResponse.json(
      { reply: "Perdón, tuve un problema técnico. Probá de nuevo en un momento." },
      { status: 200 }
    );
  }
}
