"use client";

import { useTransition } from "react";
import { updateLeadStatusAction } from "@/lib/actions/leads";

export default function LeadStatusSelect({
  locale,
  leadId,
  status,
}: {
  locale: string;
  leadId: string;
  status: string;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <select
      defaultValue={status}
      disabled={isPending}
      onChange={(e) => {
        const value = e.target.value as "nuevo" | "contactado" | "cerrado";
        startTransition(() => {
          updateLeadStatusAction(locale, leadId, value);
        });
      }}
      className="px-2.5 py-1.5 bg-ivory/5 border border-ivory/10 rounded-lg text-xs text-ivory disabled:opacity-50"
    >
      <option value="nuevo" className="bg-obsidian text-ivory">Nuevo</option>
      <option value="contactado" className="bg-obsidian text-ivory">Contactado</option>
      <option value="cerrado" className="bg-obsidian text-ivory">Cerrado</option>
    </select>
  );
}
