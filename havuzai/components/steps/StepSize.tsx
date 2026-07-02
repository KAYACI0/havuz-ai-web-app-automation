"use client";

import { useEffect } from "react";
import type { FormData } from "@/app/app/page";
import type { ClientConfig } from "@/lib/config-types";

interface Props {
  form: FormData;
  update: (d: Partial<FormData>) => void;
  config: ClientConfig;
}

export default function StepSize({ form, update, config }: Props) {
  const model = config.pool_models.find((m) => m.id === form.poolModel);
  const sizes = model?.sizes ?? [];
  const single = sizes.length === 1;

  // Model değişince ölçüyü senkronize et
  useEffect(() => {
    if (single) {
      if (form.poolSize !== sizes[0]) update({ poolSize: sizes[0] });
    } else if (!sizes.includes(form.poolSize ?? "")) {
      update({ poolSize: "" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.poolModel]);

  if (sizes.length === 0) {
    return (
      <div>
        <h2 className="text-sm font-bold uppercase tracking-widest mb-4" style={{ color: "var(--navy)" }}>
          HAVUZ ÖLÇÜSÜ
        </h2>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          Bu model için tanımlı ölçü bulunamadı.
        </p>
      </div>
    );
  }

  if (single) {
    return (
      <div>
        <h2 className="text-sm font-bold uppercase tracking-widest mb-4" style={{ color: "var(--navy)" }}>
          HAVUZ ÖLÇÜSÜ
        </h2>
        <div
          className="py-3 px-4 rounded-xl font-bold text-sm text-center"
          style={{ background: "var(--pool)", color: "#ffffff", border: "1.5px solid var(--pool)" }}
        >
          {sizes[0]} (Tek Ölçü)
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-sm font-bold uppercase tracking-widest mb-4" style={{ color: "var(--navy)" }}>
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
                background: sel ? "var(--pool)" : "#ffffff",
                color: sel ? "#ffffff" : "#1a1a2e",
                border: `1.5px solid ${sel ? "var(--pool)" : "#d1d5db"}`,
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
