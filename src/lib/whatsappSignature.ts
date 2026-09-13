import "server-only";
import { createHmac, timingSafeEqual } from "crypto";

/**
 * Verifica que un webhook entrante realmente viene de Meta, comparando la firma
 * X-Hub-Signature-256 (HMAC-SHA256 del body crudo con el secreto de la app) — sin esto,
 * cualquiera que descubra la URL del webhook podría mandar mensajes falsos al agente.
 * Si WHATSAPP_APP_SECRET todavía no está configurado, deja pasar (permite probar con
 * curl en local antes de tener el secreto real de Meta) pero avisa por consola.
 */
export function verifyMetaSignature(rawBody: string, signatureHeader: string | null): boolean {
  const appSecret = process.env.WHATSAPP_APP_SECRET;

  if (!appSecret) {
    console.warn("WHATSAPP_APP_SECRET no configurado — se omite la verificación de firma.");
    return true;
  }

  if (!signatureHeader?.startsWith("sha256=")) return false;

  const expected = createHmac("sha256", appSecret).update(rawBody, "utf8").digest("hex");
  const received = signatureHeader.slice("sha256=".length);

  const expectedBuf = Buffer.from(expected, "hex");
  const receivedBuf = Buffer.from(received, "hex");
  if (expectedBuf.length !== receivedBuf.length) return false;

  return timingSafeEqual(expectedBuf, receivedBuf);
}
