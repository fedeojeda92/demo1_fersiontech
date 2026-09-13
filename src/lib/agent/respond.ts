import "server-only";
import { GoogleGenAI, type Content, type Part } from "@google/genai";
import { getSystemPrompt } from "./systemPrompt";
import { AGENT_TOOLS, executeTool, type ToolContext } from "./tools";

// "gemini-3.6-flash" (el modelo "grande" recomendado) tiene una cuota gratis de
// solo 20 pedidos/día — se agota enseguida probando el agente. La variante "lite"
// tiene mucho más margen gratis y hace function-calling igual de bien para este caso de uso.
const AGENT_MODEL = "gemini-3.1-flash-lite";
const MAX_TOOL_ITERATIONS = 4;

const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

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

  for (let iteration = 0; iteration < MAX_TOOL_ITERATIONS; iteration++) {
    const response = await client.models.generateContent({
      model: AGENT_MODEL,
      contents,
      config: {
        systemInstruction: getSystemPrompt(),
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
