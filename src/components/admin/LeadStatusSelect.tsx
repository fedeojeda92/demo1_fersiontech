"use client";

import { useTransition } from "react";
import { updateLeadStatusAction } from "@/lib/actions/leads";
import { LEAD_STATUSES, LEAD_STATUS_LABELS, type LeadStatus } from "@/lib/leads";

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
        const value = e.target.value as LeadStatus;
        startTransition(() => {
          updateLeadStatusAction(locale, leadId, value);
        });
      }}
      className="px-2.5 py-1.5 bg-ivory/5 border border-ivory/10 rounded-lg text-xs text-ivory disabled:opacity-50"
    >
      {LEAD_STATUSES.map((s) => (
        <option key={s} value={s} className="bg-obsidian text-ivory">
          {LEAD_STATUS_LABELS[s]}
        </option>
      ))}
    </select>
  );
}
