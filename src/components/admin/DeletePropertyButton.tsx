"use client";

import { deletePropertyAction } from "@/lib/actions/properties";
import { Trash2 } from "lucide-react";

export default function DeletePropertyButton({
  locale,
  propertyId,
}: {
  locale: string;
  propertyId: string;
}) {
  const boundDelete = deletePropertyAction.bind(null, locale, propertyId);

  return (
    <form
      action={boundDelete}
      onSubmit={(e) => {
        if (!confirm("¿Eliminar esta propiedad? Esta acción no se puede deshacer.")) {
          e.preventDefault();
        }
      }}
    >
      <button
        type="submit"
        className="p-2 rounded-lg text-ivory/50 hover:text-red-400 hover:bg-red-500/10 transition-colors"
      >
        <Trash2 size={16} />
      </button>
    </form>
  );
}
