import { NextResponse, after } from "next/server";
import { verifyMetaSignature } from "@/lib/whatsappSignature";
import { sendWhatsAppText, sendWhatsAppTemplate, normalizeArgentinePhone } from "@/lib/whatsapp";
import { createAdminClient } from "@/lib/supabase/admin";
import { getTenantIdAdmin } from "@/lib/tenant";
import { getRecentMessages, saveInboundMessage, saveOutboundMessage } from "@/lib/data/whatsappMessages";
import { upsertWhatsappLead } from "@/lib/data/whatsappLeads";
import { generateAgentReply } from "@/lib/agent/respond";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

/**
 * Handshake de verificación que Meta llama una vez al suscribir el webhook
 * (WhatsApp → Configuration → Webhook). Ver plan RM-02.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new NextResponse(challenge ?? "", { status: 200 });
  }

  return new NextResponse("Forbidden", { status: 403 });
}

interface WhatsAppMessage {
  from: string;
  id: string;
  type: string;
  text?: { body: string };
}

interface WhatsAppWebhookPayload {
  entry?: Array<{
    changes?: Array<{
      value?: {
        messages?: WhatsAppMessage[];
        statuses?: unknown[];
      };
    }>;
  }>;
}

/**
 * Recibe los mensajes entrantes de WhatsApp. Le responde 200 a Meta de inmediato
 * (evita que reintente el webhook) y procesa el mensaje en segundo plano con after().
 */
export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-hub-signature-256");

  if (!verifyMetaSignature(rawBody, signature)) {
    return new NextResponse("Invalid signature", { status: 401 });
  }

  let payload: WhatsAppWebhookPayload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return new NextResponse("Bad Request", { status: 400 });
  }

  const value = payload.entry?.[0]?.changes?.[0]?.value;
  const message = value?.messages?.[0];

  if (message) {
    after(async () => {
      try {
        await handleInboundMessage(message);
      } catch (err) {
        console.error("whatsapp webhook: error procesando mensaje", err);
        await sendFallbackReply(message);
      }
    });
  }

  return NextResponse.json({ ok: true });
}

async function handleInboundMessage(message: WhatsAppMessage) {
  const from = normalizeArgentinePhone(message.from);

  if (message.type !== "text" || !message.text?.body) {
    await sendWhatsAppText({
      to: from,
      body: "Por ahora solo puedo leer mensajes de texto. ¿Me lo escribís en un mensaje?",
    });
    return;
  }

  const supabase = createAdminClient();
  const tenantId = await getTenantIdAdmin(supabase);

  const { isDuplicate } = await saveInboundMessage(supabase, tenantId, from, message.id, message.text.body);
  if (isDuplicate) return; // Meta reintentó la entrega del webhook, ya lo procesamos.

  const { id: leadId } = await upsertWhatsappLead(supabase, tenantId, from);
  const history = await getRecentMessages(supabase, tenantId, from);

  const replyText = await generateAgentReply({
    supabase,
    tenantId,
    phone: from,
    leadId,
    history,
    userMessage: message.text.body,
  });

  await sendWhatsAppText({ to: from, body: replyText });
  await saveOutboundMessage(supabase, tenantId, from, replyText);
}

/** Si algo falla antes de poder responder, no dejar al cliente sin respuesta ni al agente sin aviso. */
async function sendFallbackReply(message: WhatsAppMessage) {
  const from = normalizeArgentinePhone(message.from);
  await sendWhatsAppText({
    to: from,
    body: "Perdón, tuve un problema técnico. Un asesor te va a contactar a la brevedad.",
  });

  const agentNumber = process.env.WHATSAPP_AGENT_NUMBER;
  const template = process.env.WHATSAPP_AGENT_TEMPLATE;
  if (agentNumber && template) {
    await sendWhatsAppTemplate({
      to: agentNumber,
      templateName: template,
      bodyParams: { nombre: from, tipo: "whatsapp", contacto: "error técnico del agente" },
    });
  }
}
