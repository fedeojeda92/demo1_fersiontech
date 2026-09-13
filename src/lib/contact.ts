// Número al que escriben los visitantes para hablar con el agente conversacional de WhatsApp.
// Hoy es el número de prueba de Meta; con un cliente real se reemplaza por su número de
// WhatsApp Business (ver docs/onboarding-cliente-nuevo.md).
export const WHATSAPP_CHAT_NUMBER = "15551985202";

export function whatsappChatUrl(text?: string): string {
  const base = `https://wa.me/${WHATSAPP_CHAT_NUMBER}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}
