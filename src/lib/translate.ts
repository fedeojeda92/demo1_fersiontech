import "server-only";

export const SUPPORTED_LOCALES = ["es", "en", "ru"] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

/**
 * Traduccion automatica gratuita (MyMemory, sin API key) para que el agente cargue
 * el contenido en un solo idioma y el resto se complete solo. Es un servicio de uso
 * libre con límite de ~500 caracteres por pedido y algo de latencia — si falla o se
 * excede el límite, se devuelve el texto original en vez de bloquear el guardado.
 */
async function translateText(text: string, source: SupportedLocale, target: SupportedLocale): Promise<string> {
  const trimmed = text.trim();
  if (!trimmed || source === target) return text;

  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(trimmed)}&langpair=${source}|${target}`;
    const res = await fetch(url);
    if (!res.ok) return text;

    const data = await res.json();
    const translated = data?.responseData?.translatedText;
    return typeof translated === "string" && translated.length > 0 ? translated : text;
  } catch (err) {
    console.error("translateText:", err);
    return text;
  }
}

export async function translateToAllLocales(
  text: string,
  sourceLocale: SupportedLocale
): Promise<Record<SupportedLocale, string>> {
  const targets = SUPPORTED_LOCALES.filter((l) => l !== sourceLocale);
  const translations = await Promise.all(targets.map((target) => translateText(text, sourceLocale, target)));

  const result = { [sourceLocale]: text } as Record<SupportedLocale, string>;
  targets.forEach((target, i) => {
    result[target] = translations[i];
  });
  return result;
}
