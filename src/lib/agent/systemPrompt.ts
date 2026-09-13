import "server-only";
import { readFileSync } from "fs";
import { join } from "path";

let cached: string | null = null;

/**
 * Carga el prompt base del agente desde docs/agente-whatsapp-prompt.md (RM-01), en vez de
 * duplicarlo como constante en TypeScript, para que ese documento siga siendo la única
 * fuente de verdad editable sin tocar código.
 */
export function getSystemPrompt(): string {
  if (cached) return cached;
  cached = readFileSync(join(process.cwd(), "docs", "agente-whatsapp-prompt.md"), "utf-8");
  return cached;
}
