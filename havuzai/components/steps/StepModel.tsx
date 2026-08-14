"use client";

import { useState } from "react";
import type { FormData } from "@/app/app/page";
import type { ClientConfig } from "@/lib/config-types";

interface Props {
  form: FormData;
  update: (d: Partial<FormData>) => void;
  config: ClientConfig;
}

const CATEGORIES = [
  { id: "fiber", label: "Fiber Havuz",        icon: "🏊" },
  { id: "beton", label: "Beton Serpme Havuz", icon: "🧱" },
  { id: "sus",   label: "Süs Havuzu",         icon: "🪷" },
] as const;

export default function StepModel({ form, update, config }: Props) {
  const allModels = config.pool_models;

  // Kategori alanı olmayan eski kayıtlar "fiber" sayılır (geriye dönük uyumluluk).
  const modelsByCategory = (cat: string) =>
    allModels.filter((m) => (m.category ?? "fiber") === cat);

  // Seçili modelin kategorisiyle başla; hiçbir model seçili değilse "fiber"tan başla.
  const initialCategory =
  allModels.find((m) => m.id === form.poolModel)?.category ?? "";
const [category, setCategory] = useState<string>(initialCategory);

const models = category ? modelsByCategory(category) : [];

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-widest mb-1"
        style={{ color: "var(--gold)" }}>Adım 2</p>
      <h2 className="font-display text-2xl font-bold mb-1" style={{ color: "var(--navy)" }}>
        Havuz modelini seçin
      </h2>
      <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
        Bahçenize en uygun modeli belirleyin.
      </p>

      {/* Kategori seçimi */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {CATEGORIES.map((c) => {
          const activeCat = category === c.id;
          return (
            <button
              key={c.id}
              onClick={() => setCategory(c.id)}
              style={{
                border:       `2px solid ${activeCat ? "var(--pool)" : "var(--border)"}`,
                borderRadius: "14px",
                background:   activeCat ? "var(--pool-light)" : "var(--white)",
                cursor:       "pointer",
                padding:      "14px 12px",
                textAlign:    "center",
                fontWeight:   700,
                fontSize:     "14px",
                color:        activeCat ? "var(--pool)" : "var(--navy)",
                transition:   "all 0.2s ease",
              }}
            >
              <span style={{ marginRight: "6px" }}>{c.icon}</span>
              {c.label}
            </button>
          );
        })}
      </div>

      {category === "" ? null : models.length === 0 ? (
        <div style={{
          padding: "32px 16px",
          textAlign: "center",
          borderRadius: "16px",
          border: "1.5px dashed var(--border)",
          color: "var(--text-muted)",
          fontSize: "14px",
        }}>
          Bu kategoride henüz model bulunmuyor.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {models.map((m) => {
            const sel = form.poolModel === m.id;
            return (
              <button
                key={m.id}
                onClick={() => update({ poolModel: m.id })}
                style={{
                  border:       `2px solid ${sel ? "var(--pool)" : "var(--border)"}`,
                  borderRadius: "16px",
                  background:   sel ? "var(--pool-light)" : "var(--white)",
                  cursor:       "pointer",
                  textAlign:    "left",
                  padding:      0,
                  overflow:     "hidden",
                  position:     "relative",
                  transition:   "all 0.22s cubic-bezier(0.16,1,0.3,1)",
                  boxShadow:    sel
                    ? "0 0 0 3px rgba(29,123,191,0.15), 0 8px 28px rgba(12,31,63,0.12)"
                    : "0 1px 4px rgba(12,31,63,0.04)",
                }}
                onMouseEnter={e => {
                  if (!sel) {
                    const el = e.currentTarget;
                    el.style.transform  = "translateY(-3px)";
                    el.style.boxShadow  = "0 8px 28px rgba(12,31,63,0.14)";
                    el.style.borderColor = "var(--navy-light)";
                  }
                }}
                onMouseLeave={e => {
                  if (!sel) {
                    const el = e.currentTarget;
                    el.style.transform  = "translateY(0)";
                    el.style.boxShadow  = "0 1px 4px rgba(12,31,63,0.04)";
                    el.style.borderColor = "var(--border)";
                  }
                }}
              >
                {/* Görsel */}
                <div style={{ position: "relative", width: "100%", aspectRatio: "4/3", background: "var(--sand)" }}>
                  <img
                    src={m.reference_image_url}
                    alt={m.name}
                    style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
                  />

                  

                  {/* Checkmark */}
                  {sel && (
                    <div style={{
                      position:       "absolute",
                      top:            "10px",
                      right:          "10px",
                      width:          "26px",
                      height:         "26px",
                      borderRadius:   "50%",
                      background:     "var(--pool)",
                      display:        "flex",
                      alignItems:     "center",
                      justifyContent: "center",
                      color:          "white",
                      fontSize:       "13px",
                      fontWeight:     700,
                      boxShadow:      "0 2px 8px rgba(29,123,191,0.5)",
                    }}>
                      ✓
                    </div>
                  )}
                </div>

                {/* Metin */}
                <div style={{ padding: "14px 16px 16px" }}>
                  {m.tag && (
                    <span style={{
                      display: "inline-block",
                      padding: "2px 8px",
                      borderRadius: "99px",
                      fontSize: "10px",
                      fontWeight: 700,
                      background: sel ? "var(--pool)" : "rgba(0,0,0,0.08)",
                      color: sel ? "white" : "var(--text-muted)",
                      marginBottom: "6px",
                    }}>
                      {m.tag}
                    </span>
                  )}
                  <h3 style={{
                    fontFamily: "var(--font-fraunces), serif",
                    fontSize:   "18px",
                    fontWeight: 700,
                    color:      "var(--navy)",
                    marginBottom: "2px",
                  }}>
                    {m.name}
                  </h3>
                  {m.sub && (
                    <p style={{ fontSize: "11px", fontWeight: 600, color: "var(--gold)", marginBottom: "6px" }}>
                      {m.sub}
                    </p>
                  )}
                  <p style={{ fontSize: "12px", color: "var(--text-muted)", lineHeight: 1.5 }}>
                    {m.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}