"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

export default function CopyIcsLink({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <div className="flex items-center gap-2">
      <input
        readOnly
        value={url}
        onFocus={(e) => e.target.select()}
        className="flex-1 px-3 py-2 bg-ivory/5 border border-ivory/10 rounded-lg text-xs text-ivory/70"
      />
      <button
        type="button"
        onClick={async () => {
          await navigator.clipboard.writeText(url);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }}
        className="flex items-center gap-2 px-3 py-2 bg-champagne/10 text-champagne rounded-lg text-xs hover:bg-champagne/20 transition-colors shrink-0"
      >
        {copied ? <Check size={14} /> : <Copy size={14} />}
        {copied ? "Copiado" : "Copiar"}
      </button>
    </div>
  );
}
