"use client";

import { useState, useEffect } from "react";

export interface GuideStep {
  icon:  string;
  title: string;
  desc:  string;
}

interface Props {
  tourKey: string;       // localStorage key — her sayfa için benzersiz
  steps:   GuideStep[];
  autoOpen?: boolean;    // ilk ziyarette otomatik aç
}

export default function HowToUse({ tourKey, steps, autoOpen = true }: Props) {
  const [open, setOpen]       = useState(false);
  const [current, setCurrent] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (autoOpen) {
      const seen = localStorage.getItem(`tour_${tourKey}`);
      if (!seen) { setOpen(true); setCurrent(0); }
    }
  }, [tourKey, autoOpen]);

  const close = () => {
    localStorage.setItem(`tour_${tourKey}`, "1");
    setOpen(false);
    setCurrent(0);
  };

  const prev = () => setCurrent(c => Math.max(0, c - 1));
  const next = () => {
    if (current < steps.length - 1) setCurrent(c => c + 1);
    else close();
  };

  if (!mounted) return null;

  const step = steps[current];
  const progress = ((current + 1) / steps.length) * 100;

  return (
    <>
      {/* Floating trigger button */}
      <button
        onClick={() => { setOpen(true); setCurrent(0); }}
        title="Nasıl Kullanılır?"
        style={{
          position: "fixed",
          bottom: "28px",
          right: "28px",
          zIndex: 9000,
          width: "44px",
          height: "44px",
          borderRadius: "50%",
          background: "var(--navy)",
          border: "2px solid rgba(255,255,255,0.15)",
          color: "white",
          fontSize: "18px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 20px rgba(12,31,63,0.35)",
          transition: "transform 0.2s, box-shadow 0.2s",
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.1)";
          (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 6px 28px rgba(12,31,63,0.5)";
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
          (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 20px rgba(12,31,63,0.35)";
        }}
      >
        ?
      </button>

      {/* Backdrop + Modal */}
      {open && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 9999,
            background: "rgba(12,31,63,0.55)",
            backdropFilter: "blur(6px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "16px",
            animation: "fadeIn 0.2s ease",
          }}
          onClick={close}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: "440px",
              background: "var(--white)",
              borderRadius: "24px",
              overflow: "hidden",
              boxShadow: "0 24px 80px rgba(12,31,63,0.4)",
              animation: "fadeUp 0.3s cubic-bezier(0.16,1,0.3,1)",
            }}
          >
            {/* Header */}
            <div style={{
              padding: "20px 24px 16px",
              background: "var(--navy)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "20px" }}>📖</span>
                <div>
                  <p style={{
                    fontFamily: "var(--font-fraunces), serif",
                    fontSize: "16px",
                    fontWeight: 700,
                    color: "white",
                    lineHeight: 1.2,
                  }}>
                    Nasıl Kullanılır?
                  </p>
                  <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.45)", marginTop: "2px" }}>
                    Adım {current + 1} / {steps.length}
                  </p>
                </div>
              </div>
              <button
                onClick={close}
                style={{
                  width: "30px", height: "30px",
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.1)",
                  border: "none",
                  color: "rgba(255,255,255,0.7)",
                  fontSize: "16px",
                  cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                ×
              </button>
            </div>

            {/* Progress bar */}
            <div style={{ height: "3px", background: "var(--border)" }}>
              <div style={{
                height: "100%",
                width: `${progress}%`,
                background: "var(--gold)",
                transition: "width 0.4s cubic-bezier(0.16,1,0.3,1)",
              }} />
            </div>

            {/* Step content */}
            <div style={{ padding: "32px 28px 24px", minHeight: "220px" }}>
              <div style={{
                width: "64px", height: "64px",
                borderRadius: "20px",
                background: "var(--sand)",
                border: "1.5px solid var(--border)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "28px",
                marginBottom: "20px",
              }}>
                {step.icon}
              </div>

              <h3 style={{
                fontFamily: "var(--font-fraunces), serif",
                fontSize: "22px",
                fontWeight: 700,
                color: "var(--navy)",
                marginBottom: "10px",
                lineHeight: 1.3,
              }}>
                {step.title}
              </h3>

              <p style={{
                fontSize: "15px",
                color: "var(--text-muted)",
                lineHeight: 1.7,
              }}>
                {step.desc}
              </p>
            </div>

            {/* Step dots */}
            <div style={{
              display: "flex",
              justifyContent: "center",
              gap: "6px",
              paddingBottom: "8px",
            }}>
              {steps.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  style={{
                    width:  current === i ? "20px" : "7px",
                    height: "7px",
                    borderRadius: "99px",
                    background: current === i ? "var(--gold)" : i < current ? "var(--gold-pale)" : "var(--border)",
                    border: "none",
                    cursor: "pointer",
                    transition: "all 0.3s cubic-bezier(0.16,1,0.3,1)",
                    padding: 0,
                  }}
                />
              ))}
            </div>

            {/* Navigation */}
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "16px 28px 24px",
              gap: "12px",
            }}>
              {current > 0 ? (
                <button onClick={prev} className="btn-secondary" style={{ flex: 1 }}>
                  ← Önceki
                </button>
              ) : (
                <button onClick={close}
                  style={{
                    flex: 1,
                    padding: "12px",
                    border: "none",
                    background: "none",
                    fontSize: "13px",
                    color: "var(--text-faint)",
                    cursor: "pointer",
                    textAlign: "left",
                  }}>
                  Atla
                </button>
              )}

              <button
                onClick={next}
                className="btn-primary"
                style={{ flex: 2, justifyContent: "center" }}
              >
                {current < steps.length - 1 ? "İleri →" : "Anladım ✓"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
