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
  // Format: "3x5x1.5" veya "3x5"
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
  gardenWidth: string
): boolean {
  if (!gardenLength || !gardenWidth) return true; // Alan girilmemişse hepsini göster
  const gl = parseFloat(gardenLength);
  const gw = parseFloat(gardenWidth);
  if (isNaN(gl) || isNaN(gw)) return true;

  const parsed = parseSize(size);
  if (!parsed) return true;

  // Havuz her iki yönde de sığabilir (döndürülebilir)
  const fitsNormal  = parsed.length <= gl && parsed.width <= gw;
  const fitsRotated = parsed.length <= gw && parsed.width <= gl;
  return fitsNormal || fitsRotated;
}

export default function StepSize({ form, update, config }: Props) {
  const model  = config.pool_models.find((m) => m.id === form.poolModel);
  const sizes  = model?.sizes ?? [];
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

  // Seçili ölçü artık sığmıyorsa sıfırla
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
        Havuzu kuracağınız alanın ölçüsünü girin, size uygun boyutlar otomatik filtrelensin.
      </p>

      {/* Bahçe alanı girişi */}
      <div className="mb-6 p-4 rounded-xl" style={{ background: "var(--sand)", border: "1px solid var(--border)" }}>
        <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--navy)" }}>
          Havuz kurulacak alan (metre)
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs mb-1 block" style={{ color: "var(--text-muted)" }}>Uzunluk</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max="50"
                step="0.5"
                placeholder="örn: 10"
                value={form.gardenLength}
                onChange={(e) => update({ gardenLength: e.target.value })}
                className="w-full px-3 py-2 rounded-lg text-sm font-medium"
                style={{
                  border: "1.5px solid var(--border)",
                  background: "var(--white)",
                  color: "var(--navy)",
                  outline: "none",
                }}
              />
              <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>m</span>
            </div>
          </div>
          <div>
            <label className="text-xs mb-1 block" style={{ color: "var(--text-muted)" }}>Genişlik</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max="50"
                step="0.5"
                placeholder="örn: 6"
                value={form.gardenWidth}
                onChange={(e) => update({ gardenWidth: e.target.value })}
                className="w-full px-3 py-2 rounded-lg text-sm font-medium"
                style={{
                  border: "1.5px solid var(--border)",
                  background: "var(--white)",
                  color: "var(--navy)",
                  outline: "none",
                }}
              />
              <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>m</span>
            </div>
          </div>
        </div>
        {form.gardenLength && form.gardenWidth && (
          <p className="text-xs mt-2" style={{ color: "var(--gold)" }}>
            Alan: {form.gardenLength}m × {form.gardenWidth}m — Uygun ölçüler aşağıda gösterilmektedir.
          </p>
        )}
      </div>

      {/* Havuz ölçüleri */}
      <div className="grid grid-cols-3 gap-3">
        {sizes.map((size) => {
          const sel  = form.poolSize === size;
          const fits = sizesFitInGarden(size, form.gardenLength, form.gardenWidth);
          return (
            <button
              key={size}
              onClick={() => fits && update({ poolSize: size })}
              disabled={!fits}
              title={!fits ? "Bu ölçü belirttiğiniz alana sığmıyor" : ""}
              className="py-3 px-2 rounded-xl font-bold text-sm transition-all relative"
              style={{
                background: !fits ? "#f3f4f6" : sel ? "var(--pool)" : "#ffffff",
                color:      !fits ? "#9ca3af" : sel ? "#ffffff" : "#1a1a2e",
                border:     `1.5px solid ${!fits ? "#e5e7eb" : sel ? "var(--pool)" : "#d1d5db"}`,
                cursor:     fits ? "pointer" : "not-allowed",
                opacity:    fits ? 1 : 0.5,
              }}
            >
              {size}
              {!fits && (
                <span
                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-xs"
                  style={{ background: "#ef4444", color: "white", fontSize: "9px" }}
                >
                  ✕
                </span>
              )}
            </button>
          );
        })}
      </div>

      {form.gardenLength && form.gardenWidth && sizes.every(
        (s) => !sizesFitInGarden(s, form.gardenLength, form.gardenWidth)
      ) && (
        <p className="text-sm mt-4 text-center" style={{ color: "#ef4444" }}>
          Belirttiğiniz alana uygun havuz ölçüsü bulunamadı. Lütfen alanı kontrol edin.
        </p>
      )}
    </div>
  );
}
