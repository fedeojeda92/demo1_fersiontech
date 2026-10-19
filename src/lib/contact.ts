// Número al que llevan todos los botones de WhatsApp del sitio. Mientras la demo se usa para
// vender, es el de Federico: quien lo toca está pidiendo probar el agente, así que el mensaje
// va fijo. El agente por WhatsApp real se muestra aparte, con el número de prueba de Meta
// (ver el guión de pitch). Con un cliente real, acá va su número de WhatsApp Business (ver
// docs/onboarding-cliente-nuevo.md).
export const WHATSAPP_CHAT_NUMBER = "5491159568286";
export const WHATSAPP_DEMO_MESSAGE = "¡Hola! Me gustaría probar el agente de WhatsApp en mi inmobiliaria.";

export function whatsappChatUrl(): string {
  return `https://wa.me/${WHATSAPP_CHAT_NUMBER}?text=${encodeURIComponent(WHATSAPP_DEMO_MESSAGE)}`;
}
