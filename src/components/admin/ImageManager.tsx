"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Star, X, Plus } from "lucide-react";

type Slot = { kind: "existing"; url: string } | { kind: "new"; file: File; previewUrl: string };

export default function ImageManager({ initialImages = [] }: { initialImages?: string[] }) {
  const [slots, setSlots] = useState<Slot[]>(initialImages.map((url) => ({ kind: "existing", url })));
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mantiene el <input type="file"> real sincronizado con los slots "new", para que
  // FormData.getAll("images") en el submit coincida con el orden que ve el usuario.
  useEffect(() => {
    const dt = new DataTransfer();
    slots.forEach((s) => {
      if (s.kind === "new") dt.items.add(s.file);
    });
    if (fileInputRef.current) fileInputRef.current.files = dt.files;
  }, [slots]);

  useEffect(() => {
    return () => {
      slots.forEach((s) => {
        if (s.kind === "new") URL.revokeObjectURL(s.previewUrl);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const added: Slot[] = Array.from(files).map((file) => ({
      kind: "new",
      file,
      previewUrl: URL.createObjectURL(file),
    }));
    setSlots((prev) => [...prev, ...added]);
  };

  const removeAt = (index: number) => {
    setSlots((prev) => {
      const target = prev[index];
      if (target.kind === "new") URL.revokeObjectURL(target.previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  };

  const makeCover = (index: number) => {
    setSlots((prev) => {
      const copy = [...prev];
      const [item] = copy.splice(index, 1);
      copy.unshift(item);
      return copy;
    });
  };

  const imageOrder = slots.map((s, i) => {
    if (s.kind === "existing") return `existing:${s.url}`;
    const newIndex = slots.slice(0, i + 1).filter((x) => x.kind === "new").length - 1;
    return `new:${newIndex}`;
  });

  return (
    <div>
      <input type="hidden" name="imageOrder" value={JSON.stringify(imageOrder)} />
      <input
        ref={fileInputRef}
        type="file"
        name="images"
        multiple
        accept="image/*"
        className="hidden"
        onChange={(e) => addFiles(e.target.files)}
      />

      <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
        {slots.map((slot, i) => (
          <div
            key={slot.kind === "existing" ? slot.url : slot.previewUrl}
            className="relative rounded-lg overflow-hidden border border-ivory/10 group aspect-[4/3]"
          >
            {slot.kind === "existing" ? (
              <Image src={slot.url} alt="" fill sizes="120px" className="object-cover" />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={slot.previewUrl} alt="" className="w-full h-full object-cover" />
            )}

            {i === 0 && (
              <span className="absolute top-1 left-1 bg-champagne text-obsidian text-[10px] font-semibold px-1.5 py-0.5 rounded">
                Portada
              </span>
            )}

            <div className="absolute inset-0 bg-obsidian/0 group-hover:bg-obsidian/60 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
              {i !== 0 && (
                <button
                  type="button"
                  onClick={() => makeCover(i)}
                  title="Hacer portada"
                  className="p-1.5 bg-ivory/10 rounded-full hover:bg-champagne hover:text-obsidian transition-colors"
                >
                  <Star size={14} />
                </button>
              )}
              <button
                type="button"
                onClick={() => removeAt(i)}
                title="Eliminar"
                className="p-1.5 bg-ivory/10 rounded-full hover:bg-red-500 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="aspect-[4/3] rounded-lg border border-dashed border-ivory/20 flex flex-col items-center justify-center text-ivory/40 hover:border-champagne/50 hover:text-champagne transition-colors text-xs gap-1"
        >
          <Plus size={18} />
          Agregar
        </button>
      </div>

      {slots.length === 0 && (
        <p className="text-xs text-ivory/30 mt-2">Todavía no agregaste ninguna imagen.</p>
      )}
    </div>
  );
}
