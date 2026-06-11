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
  { id: "seramik-1", label: "Seramik 1", src: "/ceramics/seramik-1.png", placeholder: "#7EC8E3" },
  { id: "seramik-2", label: "Seramik 2", src: "/ceramics/seramik-2.png", placeholder: "#00B4D8" },
  { id: "seramik-3", label: "Seramik 3", src: "/ceramics/seramik-3.png", placeholder: "#B0C4D8" },
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
                  className="w-16 h-16 rounded-lg overflow-hidden"
                  style={{
                    outline: sel ? "3px solid #1D7BBF" : "3px solid transparent",
                    outlineOffset: "2px",
                    transition: "outline 0.15s",
                  }}
                >
                  <img
                    src={c.src}
                    alt={c.label}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const el = e.currentTarget;
                      el.style.display = "none";
                      const parent = el.parentElement;
                      if (parent) parent.style.background = c.placeholder;
                    }}
                  />
                </div>
                <span
                  className="text-[11px] font-medium"
                  style={{ color: sel ? "#1D7BBF" : "#374151" }}
                >
                  {c.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
}
