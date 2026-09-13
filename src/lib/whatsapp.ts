import "server-only";

const GRAPH_API_VERSION = "v21.0";

/**
 * Normaliza un teléfono argentino a formato E.164 para la API de WhatsApp — los leads lo
 * escriben en el formulario como quieren (con/sin 0 inicial, con/sin 9, espacios, guiones),
 * pero WhatsApp exige el número completo con código de país (549...).
 * No cubre todos los casos (ej. alguien que ya puso 54 pero se olvidó el 9), pero resuelve
 * el caso típico de un número local argentino tipeado tal cual.
 */
export function normalizeArgentinePhone(raw: string): string {
  let digits = raw.replace(/\D/g, "");
  if (digits.startsWith("54")) return digits;
  if (digits.startsWith("0")) digits = digits.slice(1);
  if (!digits.startsWith("9")) digits = `9${digits}`;
  return `54${digits}`;
}

interface SendTemplateArgs {
  to: string;
  templateName: string;
  languageCode?: string;
  /** Variables con nombre de la plantilla, ej. { nombre: "Juan", tipo: "turno" } — deben coincidir con los {{nombre}} definidos en Meta. */
  bodyParams?: Record<string, string>;
}

/**
 * Manda un mensaje de plantilla (Meta Cloud API directa) — requiere que la plantilla
 * ya esté aprobada por Meta. Es el único tipo de mensaje que se puede mandar de forma
 * confiable fuera de una sesión de 24hs iniciada por el usuario (alertas al agente,
 * primer contacto con el interesado).
 */
export async function sendWhatsAppTemplate({
  to,
  templateName,
  languageCode = "es_AR",
  bodyParams = {},
}: SendTemplateArgs): Promise<void> {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

  if (!phoneNumberId || !accessToken) {
    console.warn(
      "WhatsApp no configurado (faltan WHATSAPP_PHONE_NUMBER_ID/WHATSAPP_ACCESS_TOKEN) — se omite el envío."
    );
    return;
  }

  const res = await fetch(
    `https://graph.facebook.com/${GRAPH_API_VERSION}/${phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "template",
        template: {
          name: templateName,
          language: { code: languageCode },
          ...(Object.keys(bodyParams).length
            ? {
                components: [
                  {
                    type: "body",
                    parameters: Object.entries(bodyParams).map(([parameter_name, text]) => ({
                      type: "text",
                      parameter_name,
                      text,
                    })),
                  },
                ],
              }
            : {}),
        },
      }),
    }
  );

  if (!res.ok) {
    console.error("WhatsApp sendTemplate error:", res.status, await res.text());
  }
}

interface SendTextArgs {
  to: string;
  body: string;
}

/**
 * Manda un mensaje de texto libre. Solo es válido dentro de la ventana de 24hs que abre
 * un mensaje entrante del usuario — por eso se usa para responder al agente conversacional,
 * nunca para el primer contacto (para eso está sendWhatsAppTemplate).
 */
export async function sendWhatsAppText({ to, body }: SendTextArgs): Promise<void> {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

  if (!phoneNumberId || !accessToken) {
    console.warn(
      "WhatsApp no configurado (faltan WHATSAPP_PHONE_NUMBER_ID/WHATSAPP_ACCESS_TOKEN) — se omite el envío."
    );
    return;
  }

  const send = (recipient: string) =>
    fetch(`https://graph.facebook.com/${GRAPH_API_VERSION}/${phoneNumberId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: recipient,
        type: "text",
        text: { body },
      }),
    });

  let res = await send(to);
  let errorText = res.ok ? "" : await res.text();

  // Con el número de prueba de Meta, un celular de CABA llega como 54 9 11 XXXXXXXX pero la
  // lista de destinatarios permitidos solo acepta el formato viejo 54 11 15 XXXXXXXX (error 131030).
  const legacy = to.match(/^54911(\d{8})$/);
  if (!res.ok && legacy && errorText.includes("131030")) {
    res = await send(`541115${legacy[1]}`);
    errorText = res.ok ? "" : await res.text();
  }

  if (!res.ok) {
    console.error("WhatsApp sendText error:", res.status, errorText);
  }
}
