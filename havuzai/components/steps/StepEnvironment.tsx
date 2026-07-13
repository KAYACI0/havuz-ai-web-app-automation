"use client";

import { useState } from "react";
import type { FormData } from "@/app/app/page";
import type { ClientConfig } from "@/lib/config-types";

interface Props {
  form: FormData;
  update: (d: Partial<FormData>) => void;
  config: ClientConfig;
}

function parsePoolSize(size: string): { length: number; width: number } | null {
  const parts = size.split("x");
  if (parts.length < 2) return null;
  const length = parseFloat(parts[0]);
  const width  = parseFloat(parts[1]);
  if (isNaN(length) || isNaN(width)) return null;
  return { length, width };
}

function checkFits(poolSize: string, gardenLength: string, gardenWidth: string): boolean {
  if (!gardenLength || !gardenWidth) return true;
  const gl = parseFloat(gardenLength);
  const gw = parseFloat(gardenWidth);
  if (isNaN(gl) || isNaN(gw)) return true;
  const parsed = parsePoolSize(poolSize);
  if (!parsed) return true;
  const extra = 1.2;
  const totalLength = parsed.length + extra;
  const totalWidth  = parsed.width  + extra;
  const fitsNormal  = totalLength <= gl && totalWidth <= gw;
  const fitsRotated = totalLength <= gw && totalWidth <= gl;
  return fitsNormal || fitsRotated;
}

export default function StepEnvironment({ form, update, config }: Props) {
  const decks = config.deck_colors;
  const ceramics = config.ceramic_colors;
  const showWaterfall = config.features?.waterfall;
  const showStairs = config.features?.stairs;
  const showExtras = showWaterfall || showStairs;

  const [showModal, setShowModal] = useState(false);
  const [tempLength, setTempLength] = useState(form.gardenLength || "");
  const [tempWidth, setTempWidth]   = useState(form.gardenWidth  || "");
  const [fitError, setFitError]     = useState(false);

  function handleSurroundSelect(type: "deck" | "ceramic", id: string) {
    if (type === "deck") {
      update({ deckType: id, ceramicType: "" });
    } else {
      update({ ceramicType: id, deckType: "" });
    }
    setTempLength(form.gardenLength || "");
    setTempWidth(form.gardenWidth   || "");
    setFitError(false);
    setShowModal(true);
  }

  function handleModalConfirm() {
    if (tempLength && tempWidth) {
      const fits = checkFits(form.poolSize, tempLength, tempWidth);
      if (!fits) {
        setFitError(true);
        return;
      }
    }
    update({ gardenLength: tempLength, gardenWidth: tempWidth });
    setShowModal(false);
    setFitError(false);
  }

  function handleModalSkip() {
    update({ gardenLength: "", gardenWidth: "" });
    setShowModal(false);
    setFitError(false);
  }

  return (
    <div className="space-y-6">

      {/* MODAL */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: "20px",
              padding: "28px",
              width: "100%",
              maxWidth: "380px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
            }}
          >
            <h3 style={{ color: "var(--navy)", fontWeight: 700, fontSize: "18px", marginBottom: "8px" }}>
              Havuz kurulacak alan
            </h3>
            <p style={{ color: "var(--text-muted)", fontSize: "13px", marginBottom: "20px" }}>
              Alanın ölçüsünü girin, havuzun sığıp sığmadığını kontrol edelim. İsterseniz atlayabilirsiniz.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
              <div>
                <label style={{ fontSize: "12px", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>
                  📏 Boy (Uzun Kenar)
                </label>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    step="0.5"
                    placeholder="örn: 8"
                    value={tempLength}
                    onChange={(e) => { setTempLength(e.target.value); setFitError(false); }}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      borderRadius: "8px",
                      border: `1.5px solid ${fitError ? "#ef4444" : "var(--border)"}`,
                      fontSize: "14px",
                      color: "var(--navy)",
                      outline: "none",
                    }}
                  />
                  <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>m</span>
                </div>
              </div>
              <div>
                <label style={{ fontSize: "12px", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>
                  📐 En (Kısa Kenar)
                </label>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    step="0.5"
                    placeholder="örn: 4"
                    value={tempWidth}
                    onChange={(e) => { setTempWidth(e.target.value); setFitError(false); }}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      borderRadius: "8px",
                      border: `1.5px solid ${fitError ? "#ef4444" : "var(--border)"}`,
                      fontSize: "14px",
                      color: "var(--navy)",
                      outline: "none",
                    }}
                  />
                  <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>m</span>
                </div>
              </div>
            </div>

            {fitError && (
              <div
                style={{
                  background: "#FEF2F2",
                  border: "1px solid #FECACA",
                  borderRadius: "10px",
                  padding: "10px 14px",
                  marginBottom: "16px",
                }}
              >
                <p style={{ color: "#DC2626", fontSize: "13px", fontWeight: 600 }}>
                  ⚠️ Seçtiğiniz havuz bu alana sığmıyor!
                </p>
                <p style={{ color: "#DC2626", fontSize: "12px", marginTop: "4px" }}>
                  Lütfen geri dönüp daha küçük bir havuz ölçüsü seçin veya alanı kontrol edin.
                </p>
              </div>
            )}

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={handleModalSkip}
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: "10px",
                  border: "1.5px solid var(--border)",
                  background: "white",
                  color: "var(--text-muted)",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Atla
              </button>
              <button
                onClick={handleModalConfirm}
                style={{
                  flex: 2,
                  padding: "10px",
                  borderRadius: "10px",
                  border: "none",
                  background: "var(--pool)",
                  color: "white",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Onayla
              </button>
            </div>
          </div>
        </div>
      )}

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
                  onClick={() => handleSurroundSelect("deck", d.id)}
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
                  onClick={() => handleSurroundSelect("ceramic", c.id)}
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
                  <div className="text-sm font-semibold" style={{ color: form.hasWaterfall ? "var(--pool)" : "#374151" }}>
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
                  <div className="text-sm font-semibold" style={{ color: form.hasStairs ? "var(--pool)" : "#374151" }}>
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
