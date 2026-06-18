"use client";

import { useEffect } from "react";
import type { FormData } from "@/app/app/page";

interface Props { form: FormData; update: (d: Partial<FormData>) => void; }

const SIZES_BY_MODEL: Record<string, string[]> = {
  RELAX: [
    "2.25x4.45x1.5",
    "3x5x1.5",
    "3x6x1.5",
    "3x7x1.5",
    "3x8x1.5",
  ],
  ROMA: [
    "3x6x1.5",
  ],
};

const DEFAULT_SIZES = SIZES_BY_MODEL.RELAX;

export default function StepSize({ form, update }: Props) {
  const isRoma = form.poolModel === "ROMA";
  const sizes = SIZES_BY_MODEL[form.poolModel ?? ""] ?? DEFAULT_SIZES;

  useEffect(() => {
    if (isRoma) {
      update({ poolSize: "3x6x1.5" });
    } else if (!sizes.includes(form.poolSize ?? "")) {
      update({ poolSize: undefined });
    }
  }, [form.poolModel]);

  if (isRoma) {
    return (
      <div>
        <h2
          className="text-sm font-bold uppercase tracking-widest mb-4"
          style={{ color: "var(--navy)" }}
        >
          HAVUZ ÖLÇÜSÜ
        </h2>
        <div
          className="py-3 px-4 rounded-xl font-bold text-sm text-center"
          style={{
            background: "#1D7BBF",
            color: "#ffffff",
            border: "1.5px solid #1D7BBF",
          }}
        >
          3x6x1.5 (Tek Ölçü)
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2
        className="text-sm font-bold uppercase tracking-widest mb-4"
        style={{ color: "var(--navy)" }}
      >
        HAVUZ ÖLÇÜSÜ SEÇİNİZ
      </h2>

      <div className="grid grid-cols-3 gap-3">
        {sizes.map((size) => {
          const sel = form.poolSize === size;
          return (
            <button
              key={size}
              onClick={() => update({ poolSize: size })}
              className="py-3 px-2 rounded-xl font-bold text-sm transition-all"
              style={{
                background: sel ? "#1D7BBF" : "#ffffff",
                color: sel ? "#ffffff" : "#1a1a2e",
                border: `1.5px solid ${sel ? "#1D7BBF" : "#d1d5db"}`,
              }}
            >
              {size}
            </button>
          );
        })}
      </div>
    </div>
  );
}
