"use client";

import type { FormData } from "@/app/app/page";

interface Props { form: FormData; update: (d: Partial<FormData>) => void; }

const SIZES = [
  "2.25x4.45x1.5",
  "3x5x1.5",
  "3x6x1.5",
  "3x7x1.5",
  "3x8x1.5",
];

export default function StepSize({ form, update }: Props) {
  return (
    <div>
      <h2
        className="text-sm font-bold uppercase tracking-widest mb-4"
        style={{ color: "var(--navy)" }}
      >
        HAVUZ ÖLÇÜSÜ SEÇİNİZ
      </h2>

      <div className="grid grid-cols-3 gap-3">
        {SIZES.map((size) => {
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
