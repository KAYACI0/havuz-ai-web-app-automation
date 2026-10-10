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
  const showDeck = (config.deck_colors?.length ?? 0) > 0;
  const showCeramic = (config.ceramic_colors?.length ?? 0) > 0;
  const showWaterfall = config.features?.waterfall;
  const showStairs = config.features?.stairs;

  const [showModal, setShowModal] = useState(false);
  const [tempLength, setTempLength] = useState(form.gardenLength || "");
  const [tempWidth, setTempWidth]   = useState(form.gardenWidth  || "");
  const [fitError, setFitError]     = useState(false);

  function handleSurroundToggle(type: "deck" | "ceramic") {
    const selected = type === "deck" ? !!form.deckType : !!form.ceramicType;

    // Zaten işaretliyse kaldır
    if (selected) {
      update({ deckType: "", ceramicType: "" });
      return;
    }

    // Deck ve seramik birbirini dışlar
    if (type === "deck") update({ deckType: "default", ceramicType: "" });
    else update({ ceramicType: "default", deckType: "" });

    setTempLength(form.gardenLength || "");
    setTempWidth(form.gardenWidth || "");
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

  // Atla: ölçü girmeden devam et, kart seçimi korunur
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

      {/* BAŞLIK */}
      <div className="text-center">
        <h2 className="text-xl font-extrabold uppercase tracking-wide" style={{ color: "#BFA58A" }}>
          Havuz Etrafı İçin
        </h2>
        <p className="text-sm font-bold uppercase tracking-wide" style={{ color: "#C4A24E" }}>
          İstediğiniz özellikleri işaretleyin
        </p>
      </div>

      {/* 4 KART */}
      <div className="grid grid-cols-2 gap-3">
        {showDeck && (
          <FeatureCard
            title="HAVUZ ETRAFI"
            subtitle="DECK KAPLAMA"
            image={config.features?.deck_image_url || ""}
            checked={!!form.deckType}
            onToggle={() => handleSurroundToggle("deck")}
          />
        )}
        {showCeramic && (
          <FeatureCard
            title="HAVUZ ETRAFI"
            subtitle="SERAMİK KAPLAMA"
            image={config.features?.ceramic_image_url || ""}
            checked={!!form.ceramicType}
            onToggle={() => handleSurroundToggle("ceramic")}
          />
        )}
        {showWaterfall && (
          <FeatureCard
            title="PASLANMAZ"
            subtitle="HAVUZ ŞELALESİ"
            image={config.features?.waterfall_image_url || ""}
            checked={!!form.hasWaterfall}
            onToggle={() => update({ hasWaterfall: !form.hasWaterfall })}
          />
        )}
        {showStairs && (
          <FeatureCard
            title="PASLANMAZ"
            subtitle="HAVUZ MERDİVENİ"
            image={config.features?.stairs_image_url || ""}
            checked={!!form.hasStairs}
            onToggle={() => update({ hasStairs: !form.hasStairs })}
          />
        )}
      </div>
    </div>
  );
}

function FeatureCard({
  title, subtitle, image, checked, onToggle,
}: {
  title: string;
  subtitle: string;
  image: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="text-left p-2 transition-all"
      style={{
        background: "#F5EFE6",
        border: `2px solid ${checked ? "var(--pool)" : "#E8DFD0"}`,
        borderRadius: "6px",
      }}
    >
      <div className="flex items-start gap-2 mb-2">
        <div
          className="w-5 h-5 flex-shrink-0 flex items-center justify-center text-white text-xs font-bold"
          style={{
            background: checked ? "var(--pool)" : "#F5EFE6",
            border: `2px solid ${checked ? "var(--pool)" : "#D9CBB5"}`,
            borderRadius: "3px",
          }}
        >
          {checked ? "✓" : ""}
        </div>
        <div className="text-[11px] font-bold leading-tight" style={{ color: "var(--navy)" }}>
          {title}
          <br />
          {subtitle}
        </div>
      </div>
      {image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={image}
          alt={subtitle}
          className="w-full aspect-[4/3] object-cover"
          onError={(e) => { e.currentTarget.style.display = "none"; }}
        />
      )}
    </button>
  );
}
