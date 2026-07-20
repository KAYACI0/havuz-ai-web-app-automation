"use client";

import { useEffect } from "react";
import type { FormData } from "@/app/app/page";
import type { ClientConfig } from "@/lib/config-types";

interface Props {
  form: FormData;
  update: (d: Partial<FormData>) => void;
  config: ClientConfig;
}

function parseSize(size: string): { length: number; width: number } | null {
  const parts = size.split("x");
  if (parts.length < 2) return null;
  const length = parseFloat(parts[0]);
  const width  = parseFloat(parts[1]);
  if (isNaN(length) || isNaN(width)) return null;
  return { length, width };
}

function sizesFitInGarden(
  size: string,
  gardenLength: string,
  gardenWidth: string,
): boolean {
  if (!gardenLength || !gardenWidth) return true;
  const gl = parseFloat(gardenLength);
  const gw = parseFloat(gardenWidth);
  if (isNaN(gl) || isNaN(gw)) return true;

  const parsed = parseSize(size);
  if (!parsed) return true;

  const extra = 1.2;
  const totalLength = parsed.length + extra;
  const totalWidth  = parsed.width  + extra;
  const fitsNormal  = totalLength <= gl && totalWidth <= gw;
  const fitsRotated = totalLength <= gw && totalWidth <= gl;
  return fitsNormal || fitsRotated;
}

export default function StepSize({ form, update, config }: Props) {
  const model  = config.pool_models.find((m) => m.id === form.poolModel);
  const sizes  = model?.sizes ?? [];
  const single = sizes.length === 1;

  useEffect(() => {
    if (single) {
      if (form.poolSize !== sizes[0]) update({ poolSize: sizes[0] });
    } else if (!sizes.includes(form.poolSize ?? "")) {
      update({ poolSize: "" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.poolModel]);

  useEffect(() => {
    if (
      form.poolSize &&
      !sizesFitInGarden(form.poolSize, form.gardenLength, form.gardenWidth)
    ) {
      update({ poolSize: "" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.gardenLength, form.gardenWidth]);

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
      <p className="text-xs font-semibold uppercase tracking-widest mb-1"
        style={{ color: "var(--gold)" }}>Adım 3</p>
      <h2 className="font-display text-2xl font-bold mb-1" style={{ color: "var(--navy)" }}>
        Havuz ölçüsü seçin
      </h2>
      <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
        Bahçenize uygun havuz boyutunu seçin.
      </p>

      <div className="grid grid-cols-3 gap-3">
        {sizes.map((size) => {
          const sel = form.poolSize === size;
          return (
            <button
              key={size}
              onClick={() => update({ poolSize: size })}
              className="py-3 px-2 rounded-xl font-bold text-sm transition-all relative"
              style={{
                background: sel ? "var(--pool)" : "#ffffff",
                color:      sel ? "#ffffff" : "#1a1a2e",
                border:     `1.5px solid ${sel ? "var(--pool)" : "#d1d5db"}`,
                cursor:     "pointer",
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