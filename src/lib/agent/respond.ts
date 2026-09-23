import "server-only";
import { GoogleGenAI, type Content, type Part } from "@google/genai";
import { getSystemPrompt } from "./systemPrompt";
import { AGENT_TOOLS, executeTool, type AgentChannel, type ToolContext } from "./tools";

// "gemini-3.6-flash" (el modelo "grande" recomendado) tiene una cuota gratis de
// solo 20 pedidos/día — se agota enseguida probando el agente. La variante "lite"
// tiene mucho más margen gratis y hace function-calling igual de bien para este caso de uso.
//
// Se prueban en orden: si el primero está caído o dado de baja, se pasa al siguiente. Los
// modelos de Gemini se saturan (503) y se deprecan (404) seguido — el 2026-09-23,
// `gemini-3.1-flash-lite` devolvía 503 sostenido y `gemini-2.5-flash-lite` ya daba 404.
// El último de la lista es el alias "latest", que Google mantiene apuntando a un modelo
// vigente: es el que evita que el agente muera por una baja silenciosa.
// Para ver qué hay disponible: GET https://generativelanguage.googleapis.com/v1beta/models?key=...
const AGENT_MODELS = ["gemini-3.5-flash-lite", "gemini-flash-lite-latest"];
const MAX_TOOL_ITERATIONS = 6;
// Backoff para los 503/429 transitorios de Gemini. Dos reintentos por modelo: si con eso no
// sale, el problema no es un pico pasajero y conviene pasar al modelo siguiente.
const RETRY_DELAYS_MS = [1000, 2500];

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
  // Solo lectura: si el lead todavía no existe (chat web recién empezado) no hay contexto
  // que recuperar, y crearlo acá anularía lo perezoso de ensureLeadId.
  if (!params.existingLeadId) return "";

  const { data } = await params.supabase
    .from("leads")
    .select("property_id, properties(title, zone)")
    .eq("id", params.existingLeadId)
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
  /**
   * Id del lead si ya existía al arrancar el turno. Solo se usa para recuperar contexto de
   * lectura (ver getLeadPropertyContext) — para escribir se usa `ensureLeadId`, que lo crea
   * si hace falta. En WhatsApp siempre viene; en el chat web recién aparece cuando el
   * visitante hizo algo que justificó crear la ficha.
   */
  existingLeadId?: string | null;
}

/**
 * Lo único que le cambia al agente según el canal. El prompt de
 * `docs/agente-whatsapp-prompt.md` es el mismo en los dos: acá solo se corrige lo que
 * sería falso en cada contexto (en la web no llegó ningún WhatsApp, y no se conoce el
 * teléfono del visitante hasta que lo diga).
 */
const CHANNEL_INSTRUCTIONS: Record<AgentChannel, string> = {
  whatsapp: "",
  web: `

Canal: estás respondiendo en el chat de la página web, no por WhatsApp. Por lo tanto:
- No digas "te escribo por WhatsApp" ni des por hecho que conocés el teléfono del interesado: acá no lo tenés hasta que él te lo diga.
- Antes de agendar una visita, pedile nombre y un contacto (teléfono o email) y guardalos con save_contact. Sin un contacto no hay forma de confirmarle el turno.
- El resto (buscar en el catálogo, chequear disponibilidad, agendar, derivar a un humano) funciona igual que siempre.`,
};

/**
 * Llama a Gemini con el prompt de docs/agente-whatsapp-prompt.md, el historial reciente
 * y las herramientas del agente (tools.ts). Ejecuta las herramientas que pida el modelo
 * y devuelve la respuesta final de texto, con un tope de iteraciones para no loopear
 * indefinidamente si el modelo sigue pidiendo tools.
 */
/**
 * Llama al modelo aguantando las dos formas en que Gemini falla sin que sea culpa nuestra:
 * 503 ("This model is currently experiencing high demand") y 429 (cuota por minuto), que se
 * resuelven esperando; y 404 (modelo dado de baja), que no. Para los primeros reintenta con
 * backoff; si el modelo sigue sin responder, pasa al siguiente de AGENT_MODELS.
 *
 * Sin esto, un pico del lado de Google le corta la conversación al interesado — que en la
 * demo es un prospecto probando el producto.
 */
async function generateWithRetry(contents: Content[], systemInstruction: string) {
  let lastError: unknown;

  for (const model of AGENT_MODELS) {
    for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt++) {
      try {
        return await client.models.generateContent({
          model,
          contents,
          config: {
            systemInstruction,
            tools: [{ functionDeclarations: AGENT_TOOLS }],
          },
        });
      } catch (err) {
        lastError = err;
        const status = (err as { status?: number })?.status;

        // 404 = modelo dado de baja: esperar no lo revive, probar el siguiente ya.
        if (status === 404) {
          console.warn(`agente: ${model} ya no existe (404), pruebo el siguiente`);
          break;
        }
        if (status !== 503 && status !== 429) throw err;
        if (attempt === RETRY_DELAYS_MS.length) {
          console.warn(`agente: ${model} sigue en ${status} tras los reintentos, pruebo el siguiente`);
          break;
        }

        const delay = RETRY_DELAYS_MS[attempt];
        console.warn(`agente: ${status} en ${model}, reintento en ${delay}ms`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}

export async function generateAgentReply(params: GenerateAgentReplyParams): Promise<string> {
  const contents: Content[] = [
    ...params.history,
    { role: "user", parts: [{ text: params.userMessage }] },
  ];

  const toolContext: ToolContext = {
    supabase: params.supabase,
    tenantId: params.tenantId,
    phone: params.phone,
    ensureLeadId: params.ensureLeadId,
    channel: params.channel,
  };

  const leadPropertyContext = await getLeadPropertyContext(params);
  const systemInstruction = `${getSystemPrompt()}\n\nFecha y hora actual (Buenos Aires): ${formatNowBuenosAires()}.${leadPropertyContext}${CHANNEL_INSTRUCTIONS[params.channel]}`;

  for (let iteration = 0; iteration < MAX_TOOL_ITERATIONS; iteration++) {
    const response = await generateWithRetry(contents, systemInstruction);

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
