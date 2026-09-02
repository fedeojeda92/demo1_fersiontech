import "server-only";

const GRAPH_API_VERSION = "v21.0";

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
  languageCode = "es",
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
