"use client";

import type { FormData } from "@/app/app/page";

interface Props { form: FormData; update: (d: Partial<FormData>) => void; }

const DECKS = [
  { id: "ceviz",        label: "Ceviz",        hex: "#8B6347" },
  { id: "antrasit04",   label: "Antrasit 04",  hex: "#4A4A4A" },
  { id: "koyu-kahve",   label: "Koyu Kahve",   hex: "#3D2B1F" },
  { id: "yesil",        label: "Yeşil",        hex: "#5C7A3E" },
  { id: "kirmizi",      label: "Kırmızı",      hex: "#8B3A3A" },
  { id: "gunes-sarisi", label: "Güneş Sarısı", hex: "#C8A45A" },
  { id: "bej",          label: "Bej",          hex: "#C4A882" },
];

const CERAMICS = [
  { id: "turkuaz", label: "Turkuaz", gradient: "linear-gradient(135deg, #0EA5E9, #06B6D4)" },
  { id: "mavi",    label: "Mavi",    gradient: "linear-gradient(135deg, #3B82F6, #1D4ED8)" },
  { id: "beyaz",   label: "Beyaz",   gradient: "linear-gradient(135deg, #E0F2FE, #BAE6FD)" },
  { id: "gri",     label: "Gri",     gradient: "linear-gradient(135deg, #94A3B8, #64748B)" },
  { id: "krem",    label: "Krem",    gradient: "linear-gradient(135deg, #FEF3C7, #D4A853)" },
];

const STAIR_OPTIONS = [
  {
    id: "corner" as const,
    label: "Köşe Merdiven",
    desc: "Havuzun köşesine entegre",
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8">
        <rect x="4" y="4" width="32" height="32" rx="3" stroke="currentColor" strokeWidth="2" fill="none"/>
        <path d="M4 28 L12 28 L12 20 L20 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: "wide" as const,
    label: "Geniş Merdiven",
    desc: "Kısa kenara yayılmış",
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8">
        <rect x="4" y="4" width="32" height="32" rx="3" stroke="currentColor" strokeWidth="2" fill="none"/>
        <path d="M8 36 L32 36 L32 30 L8 30" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <path d="M10 30 L30 30 L30 24 L10 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
  },
];

export default function StepEnvironment({ form, update }: Props) {
  return (
    <div className="space-y-6">

      {/* DECK */}
      <div>
        <div
          className="inline-block text-xs font-bold uppercase tracking-widest px-2 py-0.5 rounded mb-2"
          style={{ background: "#1a1a2e", color: "#ffffff" }}
        >
          DECK
        </div>
        <h3
          className="text-sm font-bold uppercase tracking-widest mb-3"
          style={{ color: "var(--navy)" }}
        >
          HAVUZ ÇEVRESİ SEÇENEKLERİ
        </h3>

        <div className="flex flex-wrap gap-4">
          {DECKS.map((d) => {
            const sel = form.deckType === d.id;
            return (
              <button
                key={d.id}
                onClick={() => update({ deckType: d.id })}
                className="flex flex-col items-center gap-1"
              >
                <div
                  className="w-10 h-10 rounded-full"
                  style={{
                    background: d.hex,
                    outline: sel ? "3px solid #1D7BBF" : "3px solid transparent",
                    outlineOffset: "2px",
                    transition: "outline 0.15s",
                  }}
                />
                <span
                  className="text-[11px] font-medium text-center leading-tight max-w-[52px]"
                  style={{ color: sel ? "#1D7BBF" : "#374151" }}
                >
                  {d.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SERAMİK */}
      <div>
        <div
          className="text-xs font-bold uppercase tracking-widest px-2 py-0.5 rounded mb-3"
          style={{ background: "#1a1a2e", color: "#ffffff", display: "inline-block" }}
        >
          SERAMİK SEÇENEKLERİ
        </div>

        <div className="flex gap-3 flex-wrap">
          {CERAMICS.map((c) => {
            const sel = form.ceramicType === c.id;
            return (
              <button
                key={c.id}
                onClick={() => update({ ceramicType: c.id })}
                className="flex flex-col items-center gap-1"
              >
                <div
                  className="w-16 h-16 rounded-xl border-4 transition-all"
                  style={{
                    background: c.gradient,
                    borderColor: sel ? "#3B82F6" : "transparent",
                    transform: sel ? "scale(1.1)" : "scale(1)",
                  }}
                />
                <p className="text-xs text-center mt-1" style={{ color: sel ? "#1D7BBF" : "#374151" }}>
                  {c.label}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* MERDİVEN TİPİ */}
      <div>
        <div
          className="text-xs font-bold uppercase tracking-widest px-2 py-0.5 rounded mb-3"
          style={{ background: "#1a1a2e", color: "#ffffff", display: "inline-block" }}
        >
          MERDİVEN TİPİ
        </div>

        <div className="flex gap-3">
          {STAIR_OPTIONS.map((s) => {
            const sel = form.stairType === s.id;
            return (
              <button
                key={s.id}
                onClick={() => update({ stairType: s.id })}
                className="flex flex-col items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all flex-1"
                style={{
                  borderColor: sel ? "#3B82F6" : "#E5E7EB",
                  background: sel ? "#EFF6FF" : "#F9FAFB",
                }}
              >
                <div style={{ color: sel ? "#1D7BBF" : "#6B7280" }}>{s.icon}</div>
                <span
                  className="text-xs font-semibold"
                  style={{ color: sel ? "#1D7BBF" : "#374151" }}
                >
                  {s.label}
                </span>
                <span className="text-[10px]" style={{ color: "#9CA3AF" }}>
                  {s.desc}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* EKSTRA ÖZELLİKLER */}
      <div>
        <div
          className="text-xs font-bold uppercase tracking-widest px-2 py-0.5 rounded mb-3"
          style={{ background: "#1a1a2e", color: "#ffffff", display: "inline-block" }}
        >
          EKSTRA ÖZELLİKLER
        </div>

        <button
          onClick={() => update({ hasWaterfall: !form.hasWaterfall })}
          className="flex items-center justify-between w-full px-4 py-3 rounded-xl border-2 transition-all"
          style={{
            borderColor: form.hasWaterfall ? "#3B82F6" : "#E5E7EB",
            background: form.hasWaterfall ? "#EFF6FF" : "#F9FAFB",
          }}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">🌊</span>
            <div className="text-left">
              <div
                className="text-sm font-semibold"
                style={{ color: form.hasWaterfall ? "#1D7BBF" : "#374151" }}
              >
                Havuz Şelalesi
              </div>
              <div className="text-[11px]" style={{ color: "#9CA3AF" }}>
                Kısa kenara su perdesi eklenir
              </div>
            </div>
          </div>
          {/* Toggle */}
          <div
            className="relative w-11 h-6 rounded-full transition-colors flex-shrink-0"
            style={{ background: form.hasWaterfall ? "#3B82F6" : "#D1D5DB" }}
          >
            <div
              className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform"
              style={{ transform: form.hasWaterfall ? "translateX(20px)" : "translateX(2px)" }}
            />
          </div>
        </button>
      </div>

    </div>
  );
}
