"use client";

import type { FormData } from "@/app/app/page";
import type { ClientConfig } from "@/lib/config-types";

interface Props {
  form: FormData;
  update: (d: Partial<FormData>) => void;
  config: ClientConfig;
}

export default function StepModel({ form, update, config }: Props) {
  const models = config.pool_models;
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

                {/* Tag */}
                {m.tag && (
                  <div style={{
                    position:   "absolute",
                    top:        "10px",
                    left:       "10px",
                    padding:    "3px 10px",
                    borderRadius: "99px",
                    fontSize:   "11px",
                    fontWeight: 700,
                    background: sel ? "var(--pool)" : "rgba(0,0,0,0.45)",
                    color:      "white",
                    backdropFilter: "blur(4px)",
                  }}>
                    {m.tag}
                  </div>
                )}

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
    </div>
  );
}
