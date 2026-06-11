import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "HavuzAI — Bahçenize Hayalinizdeki Havuzu Ekleyin",
  description: "Yapay zeka ile evinizin fotoğrafına anında prefabrik havuz ekleyin. 15 saniyede gerçekçi görsel, hemen teklif alın.",
};

export default function LandingPage() {
  return (
    <>
      <style>{`
        @keyframes bubbleUp {
          0% { transform: translateY(0) scale(1); opacity: 0.6; }
          100% { transform: translateY(-120px) scale(0.3); opacity: 0; }
        }
        @keyframes heroFadeIn {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scanLine {
          0% { top: 0; }
          50% { top: calc(100% - 2px); }
          50.01% { top: 0; }
          100% { top: calc(100% - 2px); }
        }
        @keyframes gradShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes floatAnim {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        .hero-1 { animation: heroFadeIn 0.7s cubic-bezier(0.16,1,0.3,1) 0.1s both; }
        .hero-2 { animation: heroFadeIn 0.7s cubic-bezier(0.16,1,0.3,1) 0.25s both; }
        .hero-3 { animation: heroFadeIn 0.7s cubic-bezier(0.16,1,0.3,1) 0.4s both; }
        .hero-4 { animation: heroFadeIn 0.7s cubic-bezier(0.16,1,0.3,1) 0.55s both; }
        .hero-5 { animation: heroFadeIn 0.7s cubic-bezier(0.16,1,0.3,1) 0.7s both; }
        .hero-6 { animation: heroFadeIn 0.9s cubic-bezier(0.16,1,0.3,1) 0.5s both; }
        .bubble {
          position: absolute;
          border-radius: 50%;
          background: rgba(29,123,191,0.3);
          animation: bubbleUp 3s ease-in infinite;
        }
        .scan-line {
          position: absolute;
          left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg, transparent, rgba(184,147,90,0.8), transparent);
          animation: scanLine 2.5s ease-in-out infinite;
          pointer-events: none;
        }
        .shimmer-gold {
          background: linear-gradient(90deg, #B8935A, #F0D9A8, #B8935A, #D4AF7A);
          background-size: 300% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: gradShift 4s linear infinite;
        }
        .float-wave { animation: floatAnim 2s ease-in-out infinite; }
        .float-wave-2 { animation: floatAnim 2.3s ease-in-out 0.2s infinite; }
        .float-wave-3 { animation: floatAnim 2.6s ease-in-out 0.4s infinite; }

        /* Hover effects via pure CSS */
        .btn-gold-lp {
          display: inline-flex; align-items: center; gap: 10px;
          padding: 16px 36px;
          background: linear-gradient(135deg, #B8935A 0%, #D4AF7A 100%);
          color: #fff;
          border: none; border-radius: 14px;
          font-size: 16px; font-weight: 700;
          font-family: var(--font-jakarta), inherit;
          cursor: pointer; text-decoration: none;
          transition: transform 0.25s, box-shadow 0.25s, background 0.25s;
          box-shadow: 0 6px 24px rgba(184,147,90,0.45);
          letter-spacing: 0.01em;
        }
        .btn-gold-lp:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(184,147,90,0.6);
          background: linear-gradient(135deg, #C9A46A 0%, #E4BF8A 100%);
        }
        .btn-gold-lp-lg {
          padding: 18px 48px;
          font-size: 17px;
        }
        .btn-ghost-lp {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 15px 32px;
          background: transparent;
          color: rgba(255,255,255,0.85);
          border: 1.5px solid rgba(255,255,255,0.25); border-radius: 14px;
          font-size: 15px; font-weight: 500;
          font-family: var(--font-jakarta), inherit;
          cursor: pointer; text-decoration: none;
          transition: all 0.25s;
          letter-spacing: 0.01em;
        }
        .btn-ghost-lp:hover {
          border-color: rgba(184,147,90,0.6);
          color: #D4AF7A;
          background: rgba(184,147,90,0.08);
        }
        .nav-link {
          color: rgba(255,255,255,0.65);
          font-size: 14px; font-weight: 500;
          text-decoration: none;
          transition: color 0.2s;
        }
        .nav-link:hover { color: #D4AF7A; }
        .card-lift {
          transition: transform 0.3s cubic-bezier(0.16,1,0.3,1), box-shadow 0.3s ease;
        }
        .card-lift:hover {
          transform: translateY(-6px);
          box-shadow: 0 24px 48px rgba(12,31,63,0.2);
        }
        .pool-card {
          border-radius: 24px; overflow: hidden;
          background: #fff;
          border: 1.5px solid #E5DDD0;
          transition: all 0.3s cubic-bezier(0.16,1,0.3,1);
        }
        .pool-card:hover {
          transform: translateY(-8px);
          border-color: #B8935A;
          box-shadow: 0 32px 64px rgba(12,31,63,0.15), 0 0 0 1px rgba(184,147,90,0.2);
        }
        .pool-card-img {
          width: 100%; height: 100%; object-fit: cover;
          transition: transform 0.5s ease;
        }
        .pool-card:hover .pool-card-img { transform: scale(1.04); }
        .model-link {
          display: inline-flex; align-items: center; gap: 8px;
          font-weight: 700; font-size: 14px;
          text-decoration: none;
          transition: gap 0.2s;
        }
        .model-link-blue { color: #1D7BBF; }
        .model-link-green { color: #059669; }
        .model-link:hover { gap: 14px; }
        .footer-link {
          color: rgba(255,255,255,0.35);
          font-size: 13px; text-decoration: none;
          transition: color 0.2s;
        }
        .footer-link:hover { color: #D4AF7A; }
        .code-block {
          border-radius: 16px; overflow: hidden;
          background: #0C1F3F;
          box-shadow: 0 20px 60px rgba(12,31,63,0.3);
          transition: transform 0.3s cubic-bezier(0.16,1,0.3,1), box-shadow 0.3s ease;
        }
        .code-block:hover {
          transform: translateY(-6px);
          box-shadow: 0 32px 80px rgba(12,31,63,0.4);
        }
        /* ── TABLET (≤900px) ── */
        @media (max-width: 900px) {
          .hero-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
          .hero-visual { display: block !important; }
          .features-grid { grid-template-columns: 1fr !important; }
          .biz-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
          .nav-links { display: none !important; }
          .pool-models-grid { grid-template-columns: 1fr !important; gap: 24px !important; }
          .stats-grid { gap: 0 !important; flex-direction: column !important; }
          .stats-item { border-right: none !important; border-bottom: 1px solid rgba(255,255,255,0.08) !important; padding: 20px 24px !important; }
          .stats-item:last-child { border-bottom: none !important; }
        }

        /* ── MOBILE (≤640px) ── */
        @media (max-width: 640px) {
          .nav-bar { padding: 0 16px !important; }
          .nav-cta-mobile { display: inline-flex !important; }
          .hero-section { padding-top: 64px !important; }
          .hero-content { padding: 40px 20px 60px !important; }
          .hero-buttons { flex-direction: column !important; }
          .hero-buttons a, .hero-buttons button { width: 100% !important; justify-content: center !important; }
          .hero-stats { gap: 20px !important; flex-wrap: wrap !important; }
          .section-pad { padding: 64px 20px !important; }
          .section-pad-sm { padding: 48px 20px !important; }
          .biz-section { padding: 64px 20px !important; }
          .cta-section { padding: 72px 20px !important; }
          .footer-inner { padding: 28px 20px !important; flex-direction: column !important; align-items: center !important; text-align: center !important; gap: 20px !important; }
          .pool-card-body { padding: 20px !important; }
          .code-block-inner { padding: 18px 14px !important; font-size: 11px !important; line-height: 1.8 !important; }
          .features-heading { margin-bottom: 40px !important; }
          .btn-gold-lp-lg { padding: 16px 32px !important; font-size: 16px !important; }
        }
      `}</style>

      {/* ── NAVBAR ── */}
      <nav className="nav-bar" style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        padding: "0 40px", height: "64px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: "rgba(12,31,63,0.95)",
        backdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}>
        <img
          src="/pools/havuzai-logo-şeffaf.png"
          alt="HavuzAI"
          style={{ height: "38px", width: "auto", objectFit: "contain",
            background: "white", borderRadius: "8px", padding: "4px 8px" }}
        />
        <div className="nav-links" style={{ display: "flex", alignItems: "center", gap: "32px" }}>
          <a href="#nasil-calisir" className="nav-link">Nasıl Çalışır?</a>
          <a href="#modeller" className="nav-link">Modeller</a>
          <Link href="/app" className="btn-gold-lp" style={{ padding: "10px 24px", fontSize: "14px" }}>
            Uygulamaya Git →
          </Link>
        </div>
        {/* Mobilde görünen CTA */}
        <Link href="/app" className="nav-cta-mobile btn-gold-lp" style={{
          display: "none", padding: "9px 18px", fontSize: "13px", borderRadius: "10px",
        }}>
          Dene →
        </Link>
      </nav>

      {/* ── HERO ── */}
      <section className="hero-section" style={{
        minHeight: "100vh",
        background: "linear-gradient(150deg, #060F1F 0%, #0C1F3F 35%, #0F2547 65%, #071525 100%)",
        display: "flex", alignItems: "center",
        position: "relative", overflow: "hidden",
        paddingTop: "64px",
      }}>
        {/* Dot grid */}
        <div style={{
          position: "absolute", inset: 0, opacity: 0.04,
          backgroundImage: "radial-gradient(circle at 1px 1px, #B8935A 1px, transparent 0)",
          backgroundSize: "44px 44px", pointerEvents: "none",
        }} />
        {/* Ambient glows */}
        <div style={{
          position: "absolute", bottom: "-80px", right: "-80px",
          width: "600px", height: "600px",
          background: "radial-gradient(ellipse at center, rgba(29,123,191,0.18) 0%, transparent 65%)",
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", top: "20%", left: "-100px",
          width: "400px", height: "400px",
          background: "radial-gradient(ellipse at center, rgba(184,147,90,0.07) 0%, transparent 65%)",
          pointerEvents: "none",
        }} />
        {/* Bubbles */}
        {([
          { left: "62%", bottom: "15%", size: 8, delay: "0s", dur: "2.5s" },
          { left: "68%", bottom: "22%", size: 5, delay: "1.2s", dur: "2.9s" },
          { left: "72%", bottom: "10%", size: 11, delay: "0.6s", dur: "3.3s" },
          { left: "58%", bottom: "30%", size: 6, delay: "2s", dur: "3.7s" },
          { left: "75%", bottom: "18%", size: 9, delay: "1.8s", dur: "4.1s" },
        ] as const).map((b, i) => (
          <div key={i} className="bubble" style={{
            left: b.left, bottom: b.bottom,
            width: b.size, height: b.size,
            animationDelay: b.delay, animationDuration: b.dur,
          }} />
        ))}

        <div className="hero-grid hero-content" style={{
          maxWidth: "1200px", margin: "0 auto", padding: "80px 40px",
          display: "grid", gridTemplateColumns: "1fr 1fr", gap: "80px",
          alignItems: "center", width: "100%",
        }}>
          {/* Copy */}
          <div>
            <div className="hero-1" style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              padding: "6px 16px",
              background: "rgba(184,147,90,0.12)",
              border: "1px solid rgba(184,147,90,0.25)",
              borderRadius: "99px", marginBottom: "32px",
            }}>
              <span style={{
                width: "6px", height: "6px", borderRadius: "50%",
                background: "#B8935A", display: "inline-block",
              }} />
              <span style={{ color: "#D4AF7A", fontSize: "13px", fontWeight: 600, letterSpacing: "0.05em" }}>
                AI Destekli Havuz Görselleştirme
              </span>
            </div>

            <h1 style={{ fontFamily: "var(--font-fraunces), Georgia, serif", lineHeight: 1.1, marginBottom: "24px" }}>
              <div className="hero-2" style={{ fontSize: "clamp(40px, 5vw, 68px)", color: "#fff", fontWeight: 800 }}>
                Bahçenize
              </div>
              <div className="hero-3" style={{ fontSize: "clamp(40px, 5vw, 68px)", fontWeight: 800 }}>
                <span className="shimmer-gold">Hayalinizdeki</span>
              </div>
              <div className="hero-4" style={{ fontSize: "clamp(40px, 5vw, 68px)", color: "#fff", fontWeight: 800 }}>
                Havuzu Ekleyin.
              </div>
            </h1>

            <p className="hero-4" style={{
              color: "rgba(255,255,255,0.55)", fontSize: "18px", lineHeight: 1.7,
              marginBottom: "44px", maxWidth: "460px",
            }}>
              Evinizin fotoğrafını yükleyin, yapay zeka{" "}
              <strong style={{ color: "rgba(255,255,255,0.8)" }}>15 saniye</strong>{" "}
              içinde gerçekçi bir havuz görseli üretsin. Anında teklif alın, karar verin.
            </p>

            <div className="hero-5 hero-buttons" style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
              <Link href="/app" className="btn-gold-lp">
                Ücretsiz Dene
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </Link>
              <a href="#nasil-calisir" className="btn-ghost-lp">
                Nasıl Çalışır?
              </a>
            </div>

            <div className="hero-5 hero-stats" style={{ marginTop: "40px", display: "flex", gap: "32px" }}>
              {[
                { n: "~15 sn", label: "Görsel üretim süresi" },
                { n: "2 model", label: "RELAX & ROMA" },
                { n: "Ücretsiz", label: "Deneme erişimi" },
              ].map((s, i) => (
                <div key={i}>
                  <div style={{
                    fontFamily: "var(--font-fraunces), Georgia, serif",
                    fontSize: "22px", fontWeight: 700, color: "#D4AF7A",
                  }}>{s.n}</div>
                  <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px" }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Hero image */}
          <div className="hero-6 hero-visual">
            <div style={{
              position: "relative",
              borderRadius: "24px",
              overflow: "hidden",
              border: "1.5px solid rgba(255,255,255,0.08)",
              boxShadow: "0 40px 80px rgba(0,0,0,0.5)",
            }}>
              <img
                src="/öncesi-sonrası-landing.png"
                alt="Havuz öncesi ve sonrası"
                style={{ width: "100%", height: "auto", display: "block" }}
              />
            </div>
          </div>
        </div>

        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0, height: "80px",
          background: "linear-gradient(0deg, #F5EFE6 0%, transparent 100%)",
          pointerEvents: "none",
        }} />
      </section>

      {/* ── STATS ── */}
      <section style={{
        background: "#0C1F3F",
        borderTop: "1px solid rgba(184,147,90,0.2)",
        borderBottom: "1px solid rgba(184,147,90,0.1)",
      }}>
        <div className="stats-grid" style={{
          maxWidth: "1000px", margin: "0 auto", padding: "0 40px",
          display: "flex", justifyContent: "center", flexWrap: "wrap",
        }}>
          {[
            { icon: "⚡", value: "~15 saniye", label: "Görsel üretim süresi" },
            { icon: "🎯", value: "Gerçekçi AI", label: "fal.ai Flux teknolojisi" },
            { icon: "💼", value: "B2B Widget", label: "Sitenize entegre edin" },
            { icon: "🔒", value: "Güvenli", label: "Verileriniz korunur" },
          ].map((s, i) => (
            <div key={i} className="stats-item" style={{
              textAlign: "center", padding: "28px 40px",
              borderRight: i < 3 ? "1px solid rgba(255,255,255,0.08)" : "none",
            }}>
              <div style={{ fontSize: "24px", marginBottom: "6px" }}>{s.icon}</div>
              <div style={{
                fontFamily: "var(--font-fraunces), Georgia, serif",
                color: "#D4AF7A", fontSize: "20px", fontWeight: 700, marginBottom: "4px",
              }}>{s.value}</div>
              <div style={{ color: "rgba(255,255,255,0.45)", fontSize: "13px" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="nasil-calisir" className="section-pad" style={{ background: "#F5EFE6", padding: "100px 40px" }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
          <div className="features-heading" style={{ textAlign: "center", marginBottom: "72px" }}>
            <span style={{
              display: "inline-block", padding: "4px 16px",
              background: "rgba(12,31,63,0.08)", borderRadius: "99px",
              color: "#1A3560", fontSize: "13px", fontWeight: 600,
              letterSpacing: "0.05em", marginBottom: "16px",
            }}>
              NASIL ÇALIŞIR?
            </span>
            <h2 style={{
              fontFamily: "var(--font-fraunces), Georgia, serif",
              fontSize: "clamp(32px, 4vw, 52px)", fontWeight: 800,
              color: "#0C1F3F", lineHeight: 1.15,
            }}>
              Üç adımda<br />
              <span style={{ color: "#B8935A" }}>hayalinize ulaşın.</span>
            </h2>
          </div>

          <div className="features-grid" style={{
            display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "32px",
          }}>
            {[
              {
                step: "01", icon: "📷",
                title: "Fotoğraf Yükleyin",
                desc: "Bahçenizin net bir fotoğrafını yükleyin. Havuzun yerleştirileceği alanı gösterin.",
                bg: "#EBF5FB",
              },
              {
                step: "02", icon: "🏊",
                title: "Model & Boyut Seçin",
                desc: "RELAX ya da ROMA modelini, uygun boyutu ve çevre tasarımını tercih edin.",
                bg: "#F0E4CE",
              },
              {
                step: "03", icon: "✨",
                title: "Görselinizi Alın",
                desc: "Yapay zeka 15 saniyede bahçenize gerçekçi bir havuz yerleştirir, anında teklif alırsınız.",
                bg: "#EBF0FA",
              },
            ].map((item, i) => (
              <div key={i} className="card-lift" style={{
                borderRadius: "20px", background: "#fff",
                padding: "36px 32px",
                border: "1.5px solid #E5DDD0",
                position: "relative", overflow: "hidden",
              }}>
                <div style={{
                  position: "absolute", top: "-20px", right: "-20px",
                  width: "100px", height: "100px", borderRadius: "50%",
                  background: item.bg, opacity: 0.7,
                }} />
                <div style={{ position: "relative", zIndex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
                    <div style={{
                      width: "48px", height: "48px", borderRadius: "50%",
                      background: "linear-gradient(135deg, #0C1F3F, #1A3560)",
                      color: "#D4AF7A",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontFamily: "var(--font-fraunces), Georgia, serif",
                      fontSize: "20px", fontWeight: 700, flexShrink: 0,
                      boxShadow: "0 4px 16px rgba(12,31,63,0.25)",
                    }}>{item.step}</div>
                    <span style={{ fontSize: "28px" }}>{item.icon}</span>
                  </div>
                  <h3 style={{
                    fontFamily: "var(--font-fraunces), Georgia, serif",
                    fontSize: "22px", fontWeight: 700, color: "#0C1F3F", marginBottom: "12px",
                  }}>{item.title}</h3>
                  <p style={{ color: "#6B7280", fontSize: "15px", lineHeight: 1.65 }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: "center", marginTop: "56px" }}>
            <Link href="/app" className="btn-gold-lp">
              Hemen Başla
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ── POOL MODELS ── */}
      <section id="modeller" className="section-pad" style={{ background: "#fff", padding: "100px 40px" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "72px" }}>
            <span style={{
              display: "inline-block", padding: "4px 16px",
              background: "rgba(29,123,191,0.08)", borderRadius: "99px",
              color: "#1D7BBF", fontSize: "13px", fontWeight: 600,
              letterSpacing: "0.05em", marginBottom: "16px",
            }}>
              HAVUZ MODELLERİ
            </span>
            <h2 style={{
              fontFamily: "var(--font-fraunces), Georgia, serif",
              fontSize: "clamp(32px, 4vw, 52px)", fontWeight: 800,
              color: "#0C1F3F", lineHeight: 1.15,
            }}>
              Size özel iki tasarım,<br />
              <span style={{ color: "#1D7BBF" }}>sonsuz esneklik.</span>
            </h2>
          </div>

          <div className="pool-models-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px" }}>
            {[
              {
                name: "RELAX", tagline: "Organik Oval Tasarım",
                desc: "Aile kullanımına özel, yumuşak hatlarıyla doğayla uyumlu modern bir yaşam alanı.",
                image: "/pools/pool-relax.png",
                tag: "Aile & Konfor", tagColor: "#059669",
                linkClass: "model-link model-link-green",
              },
              {
                name: "ROMA", tagline: "Klasik Dikdörtgen",
                desc: "Modern villa mimarisiyle mükemmel uyum sağlayan, zamansız klasik form.",
                image: "/pools/pool-roma.jpg",
                tag: "Prestij & Modern", tagColor: "#1D7BBF",
                linkClass: "model-link model-link-blue",
              },
            ].map((model, i) => (
              <div key={i} className="pool-card">
                <div style={{ position: "relative", aspectRatio: "16/9", overflow: "hidden" }}>
                  <img src={model.image} alt={`${model.name} Havuz Modeli`} className="pool-card-img" />
                  <div style={{
                    position: "absolute", inset: 0,
                    background: "linear-gradient(0deg, rgba(12,31,63,0.7) 0%, transparent 60%)",
                  }} />
                  <div style={{
                    position: "absolute", top: "16px", left: "16px",
                    padding: "4px 14px", borderRadius: "99px",
                    background: model.tagColor, color: "#fff",
                    fontSize: "12px", fontWeight: 700,
                  }}>
                    {model.tag}
                  </div>
                </div>
                <div className="pool-card-body" style={{ padding: "32px" }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "12px", marginBottom: "8px" }}>
                    <h3 style={{
                      fontFamily: "var(--font-fraunces), Georgia, serif",
                      fontSize: "30px", fontWeight: 800, color: "#0C1F3F",
                    }}>{model.name}</h3>
                    <span style={{ color: "#6B7280", fontSize: "15px" }}>{model.tagline}</span>
                  </div>
                  <p style={{ color: "#6B7280", fontSize: "15px", lineHeight: 1.65, marginBottom: "24px" }}>
                    {model.desc}
                  </p>
                  <Link href="/app" className={model.linkClass}>
                    Bu modeli dene
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOR BUSINESSES ── */}
      <section className="biz-section" style={{
        background: "linear-gradient(135deg, #F5EFE6 0%, #EDE4D7 100%)",
        padding: "100px 40px",
      }}>
        <div className="biz-grid" style={{
          maxWidth: "1000px", margin: "0 auto",
          display: "grid", gridTemplateColumns: "1fr 1fr", gap: "80px",
          alignItems: "center",
        }}>
          <div>
            <span style={{
              display: "inline-block", padding: "4px 16px",
              background: "rgba(12,31,63,0.1)", borderRadius: "99px",
              color: "#1A3560", fontSize: "13px", fontWeight: 600,
              letterSpacing: "0.05em", marginBottom: "24px",
            }}>
              FİRMALAR İÇİN
            </span>
            <h2 style={{
              fontFamily: "var(--font-fraunces), Georgia, serif",
              fontSize: "clamp(28px, 3.5vw, 44px)", fontWeight: 800,
              color: "#0C1F3F", lineHeight: 1.2, marginBottom: "24px",
            }}>
              Sitenize entegre edin,<br />
              <span style={{ color: "#B8935A" }}>müşterinizi etkileyin.</span>
            </h2>
            <p style={{ color: "#6B7280", fontSize: "16px", lineHeight: 1.7, marginBottom: "36px" }}>
              HavuzAI widget&apos;ını tek satır kod ile kendi web sitenize ekleyin. Ziyaretçileriniz
              doğrudan sitenizde havuz görselleştirme deneyimi yaşasın, potansiyel müşteriler sizinle iletişime geçsin.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {[
                "Sitenize kolay entegrasyon — tek satır script",
                "Müşteri bilgileri doğrudan size iletilir",
                "Kendi marka kimliğinizle özelleştirin",
              ].map((f, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                  <div style={{
                    width: "22px", height: "22px", borderRadius: "50%",
                    background: "linear-gradient(135deg, #0C1F3F, #1A3560)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0, marginTop: "2px",
                  }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#D4AF7A" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </div>
                  <span style={{ color: "#374151", fontSize: "15px", lineHeight: 1.6 }}>{f}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="code-block">
            <div style={{
              padding: "12px 16px",
              background: "rgba(255,255,255,0.05)",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
              display: "flex", alignItems: "center", gap: "8px",
            }}>
              {(["#ff5f57", "#ffbd2e", "#28ca41"] as const).map((c, i) => (
                <div key={i} style={{ width: "12px", height: "12px", borderRadius: "50%", background: c }} />
              ))}
              <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "12px", marginLeft: "8px" }}>
                index.html
              </span>
            </div>
            <div className="code-block-inner" style={{ padding: "28px", fontFamily: "monospace", fontSize: "13px", lineHeight: 2 }}>
              <div style={{ color: "rgba(255,255,255,0.25)" }}>{`<!-- HavuzAI Widget -->`}</div>
              <div>
                <span style={{ color: "#569CD6" }}>{"<script"}</span>
                <span style={{ color: "#9CDCFE" }}>{" src"}</span>
                <span style={{ color: "rgba(255,255,255,0.6)" }}>=</span>
                <span style={{ color: "#CE9178" }}>{'"https://havuzai.com.tr/widget.js"'}</span>
              </div>
              <div style={{ paddingLeft: "16px" }}>
                <span style={{ color: "#9CDCFE" }}>data-client</span>
                <span style={{ color: "rgba(255,255,255,0.6)" }}>=</span>
                <span style={{ color: "#CE9178" }}>{'"firma-id"'}</span>
              </div>
              <div>
                <span style={{ color: "#569CD6" }}>{">"}</span>
                <span style={{ color: "#569CD6" }}>{"</script>"}</span>
              </div>
              <div style={{ marginTop: "8px" }}>
                <span style={{ color: "rgba(255,255,255,0.2)" }}>{"//"}</span>
                <span style={{ color: "rgba(255,255,255,0.4)" }}> Hepsi bu kadar. ✓</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="cta-section" style={{
        background: "linear-gradient(150deg, #060F1F 0%, #0C1F3F 50%, #071525 100%)",
        padding: "120px 40px", textAlign: "center",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", inset: 0, opacity: 0.04,
          backgroundImage: "radial-gradient(circle at 1px 1px, #B8935A 1px, transparent 0)",
          backgroundSize: "44px 44px", pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: "600px", height: "400px",
          background: "radial-gradient(ellipse at center, rgba(29,123,191,0.12) 0%, transparent 60%)",
          pointerEvents: "none",
        }} />

        <div style={{ position: "relative", zIndex: 1, maxWidth: "640px", margin: "0 auto" }}>
          <div style={{ marginBottom: "12px" }}>
            <span className="float-wave" style={{ display: "inline-block", fontSize: "28px", margin: "0 4px" }}>🌊</span>
            <span className="float-wave-2" style={{ display: "inline-block", fontSize: "28px", margin: "0 4px" }}>🌊</span>
            <span className="float-wave-3" style={{ display: "inline-block", fontSize: "28px", margin: "0 4px" }}>🌊</span>
          </div>
          <h2 style={{
            fontFamily: "var(--font-fraunces), Georgia, serif",
            fontSize: "clamp(36px, 5vw, 60px)", fontWeight: 800,
            color: "#fff", lineHeight: 1.1, marginBottom: "24px",
          }}>
            Hayalinizdeki havuzu<br />
            <span className="shimmer-gold">bugün görün.</span>
          </h2>
          <p style={{
            color: "rgba(255,255,255,0.5)", fontSize: "17px", lineHeight: 1.7,
            marginBottom: "48px",
          }}>
            Ücretsiz deneyin. Fotoğrafınızı yükleyin, AI bahçenize 15 saniyede gerçekçi bir havuz eklesin.
          </p>
          <Link href="/app" className="btn-gold-lp btn-gold-lp-lg">
            Uygulamaya Git
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </Link>
          <div style={{ marginTop: "24px", color: "rgba(255,255,255,0.25)", fontSize: "13px" }}>
            Kayıt gerekmez · Kredi kartı istemez · 15 saniyede sonuç
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: "#060F1F", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="footer-inner" style={{
        padding: "32px 40px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        flexWrap: "wrap", gap: "16px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <img
            src="/pools/havuzai-logo-şeffaf.png"
            alt="HavuzAI"
            style={{ height: "36px", width: "auto", objectFit: "contain",
              background: "white", borderRadius: "6px", padding: "4px 8px" }}
          />
          <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "13px" }}>
            © 2025 havuzai.com.tr
          </span>
        </div>
        <div style={{ display: "flex", gap: "32px" }}>
          <Link href="/app" className="footer-link">Uygulama</Link>
          <Link href="/admin" className="footer-link">Admin</Link>
        </div>
      </div>
      </footer>
    </>
  );
}
