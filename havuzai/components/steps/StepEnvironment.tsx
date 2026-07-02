"use client";

import type { FormData } from "@/app/app/page";
import type { ClientConfig } from "@/lib/config-types";

interface Props {
  form: FormData;
  update: (d: Partial<FormData>) => void;
  config: ClientConfig;
}

export default function StepEnvironment({ form, update, config }: Props) {
  const decks = config.deck_colors;
  const ceramics = config.ceramic_colors;
  const showWaterfall = config.features?.waterfall;
  const showStairs = config.features?.stairs;
  const showExtras = showWaterfall || showStairs;

  return (
    <div className="space-y-6">

      {/* DECK */}
      {decks.length > 0 && (
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
          {decks.map((d) => {
            const sel = form.deckType === d.id;
            return (
              <button
                key={d.id}
                /* Deck ↔ seramik karşılıklı dışlaması kasıtlı: biri seçilince diğeri sıfırlanır. */
                onClick={() => update({ deckType: d.id, ceramicType: "" })}
                className="flex flex-col items-center gap-1"
              >
                <div
                  className="w-10 h-10 rounded-full"
                  style={{
                    background: d.hex,
                    outline: sel ? "3px solid var(--pool)" : "3px solid transparent",
                    outlineOffset: "2px",
                    transition: "outline 0.15s",
                  }}
                />
                <span
                  className="text-[11px] font-medium text-center leading-tight max-w-[52px]"
                  style={{ color: sel ? "var(--pool)" : "#374151" }}
                >
                  {d.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>
      )}

      {/* SERAMİK */}
      {ceramics.length > 0 && (
      <div>
        <div
          className="text-xs font-bold uppercase tracking-widest px-2 py-0.5 rounded mb-3"
          style={{ background: "#1a1a2e", color: "#ffffff", display: "inline-block" }}
        >
          SERAMİK SEÇENEKLERİ
        </div>

        <div className="flex gap-3 flex-wrap">
          {ceramics.map((c) => {
            const sel = form.ceramicType === c.id;
            return (
              <button
                key={c.id}
                /* Deck ↔ seramik karşılıklı dışlaması kasıtlı: biri seçilince diğeri sıfırlanır. */
                onClick={() => update({ ceramicType: c.id, deckType: "" })}
                className="flex flex-col items-center gap-1"
              >
                <div
                  className="w-16 h-16 rounded-xl border-4 transition-all"
                  style={{
                    background: c.hex,
                    borderColor: sel ? "var(--pool)" : "transparent",
                    transform: sel ? "scale(1.1)" : "scale(1)",
                  }}
                />
                <p className="text-xs text-center mt-1" style={{ color: sel ? "var(--pool)" : "#374151" }}>
                  {c.name}
                </p>
              </button>
            );
          })}
        </div>
      </div>
      )}

      {/* EKSTRA ÖZELLİKLER */}
      {showExtras && (
      <div>
        <div
          className="text-xs font-bold uppercase tracking-widest px-2 py-0.5 rounded mb-3"
          style={{ background: "#1a1a2e", color: "#ffffff", display: "inline-block" }}
        >
          EKSTRA ÖZELLİKLER
        </div>

        {/* Şelale toggle */}
        {showWaterfall && (
        <button
          onClick={() => update({ hasWaterfall: !form.hasWaterfall })}
          className="flex items-center justify-between w-full px-4 py-3 rounded-xl border-2 transition-all"
          style={{
            borderColor: form.hasWaterfall ? "var(--pool)" : "#E5E7EB",
            background: form.hasWaterfall ? "#EFF6FF" : "#F9FAFB",
          }}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">🌊</span>
            <div className="text-left">
              <div
                className="text-sm font-semibold"
                style={{ color: form.hasWaterfall ? "var(--pool)" : "#374151" }}
              >
                Havuz Şelalesi
              </div>
              <div className="text-[11px]" style={{ color: "#9CA3AF" }}>
                Kısa kenara su perdesi eklenir
              </div>
            </div>
          </div>
          <div
            className="relative w-11 h-6 rounded-full transition-colors flex-shrink-0"
            style={{ background: form.hasWaterfall ? "var(--pool)" : "#D1D5DB" }}
          >
            <div
              className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform"
              style={{ transform: form.hasWaterfall ? "translateX(20px)" : "translateX(2px)" }}
            />
          </div>
        </button>
        )}

        {/* Merdiven toggle */}
        {showStairs && (
        <button
          onClick={() => update({ hasStairs: !form.hasStairs })}
          className="flex items-center justify-between w-full px-4 py-3 rounded-xl border-2 transition-all mt-3"
          style={{
            borderColor: form.hasStairs ? "var(--pool)" : "#E5E7EB",
            background: form.hasStairs ? "#EFF6FF" : "#F9FAFB",
          }}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">🪜</span>
            <div className="text-left">
              <div
                className="text-sm font-semibold"
                style={{ color: form.hasStairs ? "var(--pool)" : "#374151" }}
              >
                Havuz Merdiveni
              </div>
              <div className="text-[11px]" style={{ color: "#9CA3AF" }}>
                Paslanmaz çelik giriş merdiveni eklenir
              </div>
            </div>
          </div>
          <div
            className="relative w-11 h-6 rounded-full transition-colors flex-shrink-0"
            style={{ background: form.hasStairs ? "var(--pool)" : "#D1D5DB" }}
          >
            <div
              className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform"
              style={{ transform: form.hasStairs ? "translateX(20px)" : "translateX(2px)" }}
            />
          </div>
        </button>
        )}
      </div>
      )}

    </div>
  );
}
