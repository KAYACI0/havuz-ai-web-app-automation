"use client";

import { useState } from "react";
import type { FormData } from "@/app/app/page";

interface Props {
  form: FormData;
  update: (d: Partial<FormData>) => void;
}

// Makul sınırlar (metre). Bunun dışındaki değerler kabul edilmez.
const MIN_SIDE = 2;
const MAX_SHORT = 12;
const MAX_LONG = 30;

function parseNum(v: string): number | null {
  const n = parseFloat(v.replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

const fmt = (n: number) => String(Number(n.toFixed(2)));

/** Girilen iki değerden geçerli bir "enxboy" metni üretir; geçersizse boş döner. */
function buildSize(w: string, l: string): { size: string; error: string } {
  const a = parseNum(w);
  const b = parseNum(l);
  if (a === null || b === null) return { size: "", error: "" };

  const short = Math.min(a, b);
  const long = Math.max(a, b);

  if (short < MIN_SIDE || long < MIN_SIDE) {
    return { size: "", error: `Her kenar en az ${MIN_SIDE} metre olmalı.` };
  }
  if (short > MAX_SHORT || long > MAX_LONG) {
    return {
      size: "",
      error: `Kısa kenar en fazla ${MAX_SHORT} m, uzun kenar en fazla ${MAX_LONG} m olabilir.`,
    };
  }
  return { size: `${fmt(short)}x${fmt(long)}`, error: "" };
}

export default function StepCustomSize({ form, update }: Props) {
  const initial = form.poolSize.match(/\d+(?:\.\d+)?/g) ?? [];
  const [width, setWidth] = useState(initial[0] ?? "");
  const [length, setLength] = useState(initial[1] ?? "");

  const { size, error } = buildSize(width, length);

  const onChange = (w: string, l: string) => {
    setWidth(w);
    setLength(l);
    update({ poolSize: buildSize(w, l).size });
  };

  const clean = (v: string) => v.replace(/[^\d.,]/g, "").slice(0, 5);

  // Canlı önizleme: girilen orana göre dikdörtgen çizilir.
  const a = parseNum(width);
  const b = parseNum(length);
  const showPreview = !!size && a !== null && b !== null;
  let previewW = 0;
  let previewH = 0;
  if (showPreview) {
    const short = Math.min(a!, b!);
    const long = Math.max(a!, b!);
    const maxPx = 220;
    previewW = maxPx;
    previewH = Math.max(28, Math.round((short / long) * maxPx));
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    border: "2px solid var(--border)",
    borderRadius: "14px",
    padding: "14px 44px 14px 16px",
    fontSize: "18px",
    fontWeight: 700,
    color: "var(--navy)",
    background: "var(--white)",
    outline: "none",
  };

  const unitStyle: React.CSSProperties = {
    position: "absolute",
    right: "16px",
    top: "50%",
    transform: "translateY(-50%)",
    fontSize: "14px",
    fontWeight: 600,
    color: "var(--text-muted)",
    pointerEvents: "none",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "12px",
    fontWeight: 600,
    color: "var(--text-muted)",
    marginBottom: "6px",
  };

  return (
    <div>
      <p
        className="text-xs font-semibold uppercase tracking-widest mb-1"
        style={{ color: "var(--gold)" }}
      >
        Adım 3
      </p>
      <h2 className="font-display text-2xl font-bold mb-1" style={{ color: "var(--navy)" }}>
        Havuz ölçüsünü girin
      </h2>
      <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
        İstediğiniz havuzun en ve boy ölçüsünü metre olarak yazın.
      </p>

      <div className="grid grid-cols-2 gap-4 mb-5">
        <div>
          <label style={labelStyle}>En (kısa kenar)</label>
          <div style={{ position: "relative" }}>
            <input
              type="text"
              inputMode="decimal"
              placeholder="örn. 3"
              value={width}
              onChange={(e) => onChange(clean(e.target.value), length)}
              style={inputStyle}
            />
            <span style={unitStyle}>m</span>
          </div>
        </div>

        <div>
          <label style={labelStyle}>Boy (uzun kenar)</label>
          <div style={{ position: "relative" }}>
            <input
              type="text"
              inputMode="decimal"
              placeholder="örn. 6"
              value={length}
              onChange={(e) => onChange(width, clean(e.target.value))}
              style={inputStyle}
            />
            <span style={unitStyle}>m</span>
          </div>
        </div>
      </div>

      {error && (
        <p className="text-sm mb-4" style={{ color: "#cc0000" }}>
          {error}
        </p>
      )}

      {showPreview && (
        <div
          style={{
            border: "1.5px dashed var(--border)",
            borderRadius: "16px",
            padding: "20px 16px",
            textAlign: "center",
            background: "var(--sand)",
          }}
        >
          <div
            style={{
              width: `${previewW}px`,
              height: `${previewH}px`,
              maxWidth: "100%",
              margin: "0 auto 10px",
              borderRadius: "6px",
              background: "linear-gradient(135deg, #2E9BD4 0%, #1D7BBF 100%)",
              border: "3px solid #E5E7EB",
            }}
          />
          <p className="text-sm font-semibold" style={{ color: "var(--navy)" }}>
            {size.replace("x", " x ")} metre
          </p>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Havuzunuz bu orana göre çizilecek.
          </p>
        </div>
      )}
    </div>
  );
}
