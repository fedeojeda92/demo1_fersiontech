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
