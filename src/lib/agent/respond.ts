import "server-only";
import { GoogleGenAI, type Content, type Part } from "@google/genai";
import { getSystemPrompt } from "./systemPrompt";
import { AGENT_TOOLS, executeTool, type ToolContext } from "./tools";

// "gemini-3.6-flash" (el modelo "grande" recomendado) tiene una cuota gratis de
// solo 20 pedidos/día — se agota enseguida probando el agente. La variante "lite"
// tiene mucho más margen gratis y hace function-calling igual de bien para este caso de uso.
const AGENT_MODEL = "gemini-3.1-flash-lite";
const MAX_TOOL_ITERATIONS = 6;

const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

function formatNowBuenosAires(): string {
  return new Date().toLocaleString("es-AR", {
    timeZone: "America/Argentina/Buenos_Aires",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface LeadPropertyRow {
  property_id: string | null;
  properties: { title: { es?: string } | null; zone: string | null } | { title: { es?: string } | null; zone: string | null }[] | null;
}

/**
 * El historial que se manda a Gemini es solo texto (ver getRecentMessages): no incluye las
 * llamadas a herramientas de turnos anteriores, así que el ID real de una propiedad mencionada
 * antes se pierde apenas termina ese turno. Esto recupera el último ID que `search_properties`
 * (o `schedule_visit`) le asoció al lead — ver rememberLeadProperty — para que el agente pueda
 * seguir hablando de "esa propiedad" sin tener que adivinar el ID ni volver a preguntarle al
 * interesado cuál es.
 */
async function getLeadPropertyContext(params: GenerateAgentReplyParams): Promise<string> {
  const { data } = await params.supabase
    .from("leads")
    .select("property_id, properties(title, zone)")
    .eq("id", params.leadId)
    .maybeSingle<LeadPropertyRow>();

  if (!data?.property_id) return "";

  const property = Array.isArray(data.properties) ? data.properties[0] : data.properties;
  const title = property?.title?.es;
  const detalle = [title, property?.zone].filter(Boolean).join(", ");

  return `\n\nPropiedad puntual de la que ya viene hablando este interesado en la conversación${detalle ? ` (${detalle})` : ""}: ID ${data.property_id}. Si sigue refiriéndose a "esta propiedad"/"la propiedad 5"/etc. sin dar otro dato, usá directamente este ID como propertyId de schedule_visit en vez de volver a preguntarle cuál es o de inventar un ID.`;
}

export interface GenerateAgentReplyParams extends ToolContext {
  history: Content[];
  userMessage: string;
}

/**
 * Llama a Gemini con el prompt de docs/agente-whatsapp-prompt.md, el historial reciente
 * y las herramientas del agente (tools.ts). Ejecuta las herramientas que pida el modelo
 * y devuelve la respuesta final de texto, con un tope de iteraciones para no loopear
 * indefinidamente si el modelo sigue pidiendo tools.
 */
export async function generateAgentReply(params: GenerateAgentReplyParams): Promise<string> {
  const contents: Content[] = [
    ...params.history,
    { role: "user", parts: [{ text: params.userMessage }] },
  ];

  const toolContext: ToolContext = {
    supabase: params.supabase,
    tenantId: params.tenantId,
    phone: params.phone,
    leadId: params.leadId,
  };

  const leadPropertyContext = await getLeadPropertyContext(params);
  const systemInstruction = `${getSystemPrompt()}\n\nFecha y hora actual (Buenos Aires): ${formatNowBuenosAires()}.${leadPropertyContext}`;

  for (let iteration = 0; iteration < MAX_TOOL_ITERATIONS; iteration++) {
    const response = await client.models.generateContent({
      model: AGENT_MODEL,
      contents,
      config: {
        systemInstruction,
        tools: [{ functionDeclarations: AGENT_TOOLS }],
      },
    });

    const functionCalls = response.functionCalls;
    if (!functionCalls || functionCalls.length === 0) {
      return response.text ?? "Perdón, no pude generar una respuesta. Un asesor te va a contactar a la brevedad.";
    }

    const modelContent = response.candidates?.[0]?.content;
    if (modelContent) contents.push(modelContent);

    const responseParts: Part[] = await Promise.all(
      functionCalls.map(async (call): Promise<Part> => {
        try {
          const result = await executeTool(call.name ?? "", call.args ?? {}, toolContext);
          return { functionResponse: { id: call.id, name: call.name, response: { output: result } } };
        } catch (err) {
          const message = err instanceof Error ? err.message : "Error ejecutando la herramienta.";
          return { functionResponse: { id: call.id, name: call.name, response: { error: message } } };
        }
      })
    );

    contents.push({ role: "user", parts: responseParts });
  }

  return "Perdón, tuve un problema técnico. Un asesor te va a contactar a la brevedad.";
}
