"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
import { useTranslations } from "next-intl";

// El modo claro es el principal; el oscuro se guarda en localStorage y lo aplica el script del layout antes de pintar.
export const THEME_KEY = "fs-theme";

const subscribe = (onChange: () => void) => {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => observer.disconnect();
};
const isDark = () => document.documentElement.dataset.theme === "dark";

export default function ThemeToggle() {
  const t = useTranslations("nav");
  const dark = useSyncExternalStore(subscribe, isDark, () => false);

  const toggle = () => {
    const next = !dark;
    if (next) document.documentElement.dataset.theme = "dark";
    else delete document.documentElement.dataset.theme;
    try {
      localStorage.setItem(THEME_KEY, next ? "dark" : "light");
    } catch {}
  };

  return (
    <button
      onClick={toggle}
      aria-label={dark ? t("theme_light") : t("theme_dark")}
      title={dark ? t("theme_light") : t("theme_dark")}
      className="flex items-center justify-center w-9 h-9 text-ivory/60 hover:text-champagne transition-colors border border-ivory/10 rounded-lg hover:border-champagne/30"
    >
      {dark ? <Sun size={15} /> : <Moon size={15} />}
    </button>
  );
}
