import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Content } from "@google/genai";

/** Últimos mensajes de la conversación, en el formato que espera la API de Gemini. */
export async function getRecentMessages(
  supabase: SupabaseClient,
  tenantId: string,
  phone: string,
  limit = 20
): Promise<Content[]> {
  const { data, error } = await supabase
    .from("whatsapp_messages")
    .select("role, content, created_at")
    .eq("tenant_id", tenantId)
    .eq("phone", phone)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("getRecentMessages:", error.message);
    return [];
  }

  return data.reverse().map((row) => ({
    role: row.role === "assistant" ? "model" : "user",
    parts: [{ text: row.content as string }],
  }));
}

/**
 * Guarda el mensaje entrante. Devuelve isDuplicate=true si wa_message_id ya existía
 * (Meta reintenta la entrega del webhook) — en ese caso no hay que reprocesar el mensaje.
 */
export async function saveInboundMessage(
  supabase: SupabaseClient,
  tenantId: string,
  phone: string,
  waMessageId: string,
  content: string
): Promise<{ isDuplicate: boolean }> {
  const { error } = await supabase.from("whatsapp_messages").insert({
    tenant_id: tenantId,
    phone,
    wa_message_id: waMessageId,
    role: "user",
    content,
  });

  if (error) {
    if (error.code === "23505") return { isDuplicate: true };
    console.error("saveInboundMessage:", error.message);
  }

  return { isDuplicate: false };
}

/**
 * Cuántos mensajes mandó esta sesión en la última hora. Lo usa el chat web para cortar
 * loops y abuso casual: es un endpoint público que consume la cuota de Gemini, y sin
 * límite alguien puede dejarnos sin agente justo cuando un prospecto lo está probando.
 *
 * Se cuenta contra la base en vez de en memoria a propósito: en Vercel cada request puede
 * caer en una instancia distinta, así que un contador en RAM no vería la mayoría de los
 * mensajes. Esto no frena a alguien que borre la cookie para arrancar sesión nueva — para
 * eso haría falta limitar por IP con un store compartido (Upstash/Redis).
 */
export async function countRecentUserMessages(
  supabase: SupabaseClient,
  tenantId: string,
  phone: string,
  windowMinutes = 60
): Promise<number> {
  const since = new Date(Date.now() - windowMinutes * 60_000).toISOString();

  const { count, error } = await supabase
    .from("whatsapp_messages")
    .select("id", { count: "exact", head: true })
    .eq("tenant_id", tenantId)
    .eq("phone", phone)
    .eq("role", "user")
    .gte("created_at", since);

  if (error) {
    console.error("countRecentUserMessages:", error.message);
    return 0; // Ante un fallo de la consulta, no dejar al visitante sin chat.
  }
  return count ?? 0;
}

/**
 * Guarda un mensaje del chat web. A diferencia de `saveInboundMessage` no deduplica: la
 * deduplicación de WhatsApp existe porque Meta reintenta la entrega del webhook, cosa que
 * acá no pasa. `wa_message_id` queda en null (la columna es unique pero admite varios null).
 */
export async function saveWebMessage(
  supabase: SupabaseClient,
  tenantId: string,
  sessionId: string,
  role: "user" | "assistant",
  content: string
): Promise<void> {
  const { error } = await supabase.from("whatsapp_messages").insert({
    tenant_id: tenantId,
    phone: sessionId,
    role,
    content,
  });

  if (error) {
    console.error("saveWebMessage:", error.message);
  }
}

export async function saveOutboundMessage(
  supabase: SupabaseClient,
  tenantId: string,
  phone: string,
  content: string
): Promise<void> {
  const { error } = await supabase.from("whatsapp_messages").insert({
    tenant_id: tenantId,
    phone,
    role: "assistant",
    content,
  });

  if (error) {
    console.error("saveOutboundMessage:", error.message);
  }
}
