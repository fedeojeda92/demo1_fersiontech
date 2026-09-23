"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle, Send, X } from "lucide-react";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

/**
 * Chat de la web contra el mismo agente de IA que atiende WhatsApp (`/api/chat`).
 * Existe para que cualquier visitante pueda probar el agente sin que su número tenga que
 * estar cargado a mano en Meta, que es el límite del número de prueba de WhatsApp.
 *
 * La conversación no se persiste en el cliente a propósito: el hilo vive en el servidor,
 * atado a una cookie httpOnly (ver src/app/api/chat/route.ts), así que recargar la página
 * reanuda la misma conversación sin que el navegador guarde nada.
 */
export default function ChatWidget() {
  const t = useTranslations("chat");
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  async function send() {
    const text = input.trim();
    if (!text || sending) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setSending(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply ?? t("error") },
      ]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: t("error") }]);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  }

  return (
    <>
      {/* Botón flotante. Va a la izquierda del de WhatsApp (bottom-6 right-6) para no taparlo. */}
      <motion.button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={t("aria_label")}
        aria-expanded={open}
        className="fixed bottom-6 right-24 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-champagne-dark via-champagne to-champagne-dark text-obsidian shadow-lg shadow-black/40"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 18, delay: 1.2 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
      >
        <AnimatePresence mode="wait" initial={false}>
          {open ? (
            <motion.span
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
            >
              <X size={24} />
            </motion.span>
          ) : (
            <motion.span
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
            >
              <MessageCircle size={24} />
            </motion.span>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {hovered && !open && (
            <motion.span
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              className="pointer-events-none absolute right-full mr-3 whitespace-nowrap rounded-lg border border-ivory/10 bg-obsidian/90 px-3 py-2 text-sm text-ivory shadow-xl"
            >
              {t("tooltip")}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-label={t("title")}
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="fixed bottom-24 right-4 z-50 flex h-[min(34rem,calc(100vh-8rem))] w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-2xl border border-ivory/10 bg-obsidian/95 shadow-2xl shadow-black/60 backdrop-blur-xl sm:right-6"
          >
            <header className="flex items-center gap-3 border-b border-ivory/10 px-5 py-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-champagne/15 text-champagne">
                <MessageCircle size={18} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ivory">{t("title")}</p>
                <p className="flex items-center gap-1.5 text-xs text-ivory/40">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  {t("subtitle")}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={t("close")}
                className="rounded-lg p-1.5 text-ivory/40 transition-colors hover:bg-ivory/5 hover:text-ivory"
              >
                <X size={18} />
              </button>
            </header>

            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
              <Bubble role="assistant">{t("greeting")}</Bubble>
              {messages.map((m, i) => (
                <Bubble key={i} role={m.role}>
                  {m.content}
                </Bubble>
              ))}
              {sending && (
                <Bubble role="assistant">
                  <span className="flex items-center gap-1.5 text-ivory/40">
                    {t("thinking")}
                    <motion.span
                      aria-hidden
                      animate={{ opacity: [0.2, 1, 0.2] }}
                      transition={{ duration: 1.2, repeat: Infinity }}
                    >
                      ···
                    </motion.span>
                  </span>
                </Bubble>
              )}
            </div>

            <div className="border-t border-ivory/10 px-4 py-3">
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") send();
                  }}
                  placeholder={t("placeholder")}
                  maxLength={1000}
                  className="min-w-0 flex-1 rounded-xl border border-ivory/10 bg-ivory/5 px-4 py-3 text-sm text-ivory placeholder:text-ivory/30 focus:border-champagne/40 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={send}
                  disabled={!input.trim() || sending}
                  aria-label={t("send")}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-champagne-dark via-champagne to-champagne-dark text-obsidian transition-opacity disabled:opacity-30"
                >
                  <Send size={18} />
                </button>
              </div>
              <p className="mt-2 text-center text-[11px] text-ivory/25">{t("disclaimer")}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function Bubble({ role, children }: { role: "user" | "assistant"; children: React.ReactNode }) {
  const isUser = role === "user";
  return (
    <div className={isUser ? "flex justify-end" : "flex justify-start"}>
      <div
        className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
          isUser
            ? "rounded-br-sm bg-champagne text-obsidian"
            : "rounded-bl-sm border border-ivory/10 bg-ivory/5 text-ivory/90"
        }`}
      >
        {children}
      </div>
    </div>
  );
}
