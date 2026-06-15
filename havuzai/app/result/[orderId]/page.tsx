"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import HowToUse from "@/components/HowToUse";

async function downloadImage(url: string, filename: string) {
  try {
    const res  = await fetch(url);
    const blob = await res.blob();
    const href = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = href;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(href);
  } catch {
    window.open(url, "_blank");
  }
}

const RESULT_GUIDE = [
  {
    icon: "✅",
    title: "Talebiniz Alındı",
    desc: "Görseliniz başarıyla oluşturuldu ve talebi kayıt altına aldık. Uzmanlarımız en kısa sürede sizinle iletişime geçecek.",
  },
  {
    icon: "🖼️",
    title: "Önce / Sonra Karşılaştırın",
    desc: "Sol panelde orijinal fotoğrafınız, sağ panelde ise AI'nın havuzu yerleştirdiği görsel yer almaktadır. Görsele tıklayarak tam ekranda inceleyebilirsiniz.",
  },
  {
    icon: "📋",
    title: "Seçimlerinizin Özeti",
    desc: "Havuz modeli, ölçü, deck ve seramik rengi gibi seçimleriniz burada listelenmektedir. Teklif görüşmesinde bu bilgilere ihtiyacınız olabilir.",
  },
  {
    icon: "📞",
    title: "Ücretsiz Teklif",
    desc: "Uzmanlarımız 24 saat içinde sizi arayarak ihtiyaçlarınıza özel bir fiyat teklifi sunacak. Herhangi bir ücret talep edilmez.",
  },
];

interface Order {
  pool_model:     string;
  pool_size:      string;
  deck_type:      string;
  ceramic_type:   string;
  stair_type:     string;
  has_waterfall:  boolean;
  has_stairs:     boolean;
  original_photo: string;
  ai_photo:       string;
  client_id:      string;
}

function ResultContent({ orderId }: { orderId: string }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const aiParam   = searchParams.get("ai");
  const origParam = searchParams.get("orig");

  useEffect(() => {
    const blank: Order = { pool_model:"", pool_size:"", deck_type:"", ceramic_type:"", stair_type:"corner", has_waterfall: false, has_stairs: false, original_photo: origParam ?? "", ai_photo: aiParam ?? "", client_id:"" };
    if (orderId.startsWith("demo-")) {
      if (aiParam && origParam) setOrder(blank);
      return;
    }
    fetch(`/api/orders/${orderId}`)
      .then(r => r.json())
      .then(d => {
        if (d.order) setOrder(d.order);
        else if (aiParam && origParam) setOrder(blank);
      })
      .catch(() => {
        if (aiParam && origParam) setOrder(blank);
      });
  }, [orderId, aiParam, origParam]);

  if (!order) return (
    <div className="min-h-screen flex items-center justify-center"
      style={{ background: "var(--sand)" }}>
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin-slow"
          style={{ borderColor: "var(--navy)", borderTopColor: "transparent" }} />
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>Yükleniyor...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ background: "var(--sand)" }}>

      {/* Top nav */}
      <div className="flex items-center justify-between px-6 py-4"
        style={{ background: "var(--white)", borderBottom: "1px solid var(--border-soft)" }}>
        <div className="flex items-center gap-2">
          <img
            src="/pools/favicon-logo-havuzai.png"
            alt="HavuzAI"
            style={{
              height: "64px", width: "auto", objectFit: "contain",
              background: "white", borderRadius: "10px", padding: "8px 14px",
            }}
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => downloadImage(order?.ai_photo ?? "", "havuzai-gorsel.jpg")}
            className="text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            style={{ color: "var(--pool)", border: "1.5px solid var(--pool)", background: "var(--pool-light)" }}>
            ⬇ İndir
          </button>
          <button
            onClick={() => router.push(order?.client_id ? `/app?client=${order.client_id}` : "/app")}
            className="text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            style={{ color: "var(--navy)", border: "1.5px solid var(--border)" }}>
            Yeni Görsel →
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10">

        {/* Success header */}
        <div className="text-center mb-10 animate-fadeUp">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
            style={{ background: "rgba(5,150,105,0.1)", border: "1.5px solid rgba(5,150,105,0.2)" }}>
            <span className="text-3xl">✅</span>
          </div>
          <h1 className="font-display text-3xl font-bold mb-2" style={{ color: "var(--navy)" }}>
            Görseliniz hazır!
          </h1>
          <p style={{ color: "var(--text-muted)" }}>
            Talebiniz alındı. Uzmanlarımız en kısa sürede sizi arayacak.
          </p>
        </div>

        {/* Before / After */}
        <div className="rounded-2xl overflow-hidden mb-6 animate-fadeUp"
          style={{
            background: "var(--white)",
            border: "1px solid var(--border-soft)",
            boxShadow: "0 4px 24px rgba(12,31,63,0.08)",
            animationDelay: "0.1s",
          }}>

          {/* Labels */}
          <div className="grid grid-cols-2"
            style={{ borderBottom: "1px solid var(--border-soft)" }}>
            <div className="px-6 py-3 flex items-center gap-2"
              style={{ borderRight: "1px solid var(--border-soft)" }}>
              <div className="w-2 h-2 rounded-full" style={{ background: "var(--text-faint)" }} />
              <span className="text-sm font-semibold" style={{ color: "var(--text-muted)" }}>
                Mevcut
              </span>
            </div>
            <div className="px-6 py-3 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ background: "var(--pool)" }} />
              <span className="text-sm font-semibold" style={{ color: "var(--pool)" }}>
                AI Görsel
              </span>
            </div>
          </div>

          {/* Images */}
          <div className="grid grid-cols-2">
            <div style={{ borderRight: "1px solid var(--border-soft)" }}>
              <img src={order.original_photo} alt="Orijinal"
                className="w-full object-cover"
                style={{ aspectRatio: "4/3" }} />
            </div>
            <div className="relative">
              <img src={order.ai_photo} alt="AI Görsel"
                className="w-full object-cover"
                style={{ aspectRatio: "4/3" }} />
              <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-bold"
                style={{ background: "var(--pool)", color: "white" }}>
                AI
              </div>
              <button
                onClick={() => downloadImage(order.ai_photo, "havuzai-gorsel.jpg")}
                className="absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                style={{
                  background: "rgba(0,0,0,0.55)",
                  color: "white",
                  backdropFilter: "blur(6px)",
                  border: "1px solid rgba(255,255,255,0.2)",
                }}>
                ⬇ İndir
              </button>
            </div>
          </div>
        </div>

        {/* Specs + CTA */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fadeUp"
          style={{ animationDelay: "0.2s" }}>

          <div className="rounded-2xl p-6"
            style={{ background: "var(--white)", border: "1px solid var(--border-soft)" }}>
            <h3 className="font-semibold text-sm mb-4" style={{ color: "var(--navy)" }}>
              📋 Seçimleriniz
            </h3>
            <div className="grid grid-cols-2 gap-x-4">
              {[
                { label: "Model",    value: order.pool_model || "—" },
                { label: "Ölçü",    value: order.pool_size  || "—" },
                { label: "Deck",    value: order.deck_type  || "Yok" },
                { label: "Seramik", value: order.ceramic_type || "Yok" },
                { label: "Merdiven", value: order.has_stairs ? "✅ Var" : "❌ Yok" },
                { label: "Şelale",  value: order.has_waterfall ? "✅ Var" : "❌ Yok" },
              ].map((s) => (
                <div key={s.label}
                  className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>{s.label}</span>
                  <span className="text-xs font-semibold" style={{ color: "var(--navy)" }}>{s.value}</span>
                </div>
              ))}
            </div>

            {/* Butonlar */}
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => router.push(order.client_id ? `/app?client=${order.client_id}` : "/app")}
                className="flex-1 text-sm font-bold py-3 rounded-xl text-white transition-colors"
                style={{ background: "#2563EB" }}>
                🔄 Yeni Görsel
              </button>
              <button
                onClick={() => downloadImage(order.ai_photo, "havuzai-gorsel.jpg")}
                className="flex-1 text-sm font-bold py-3 rounded-xl text-white transition-colors"
                style={{ background: "#1F2937" }}>
                ⬇️ İndir
              </button>
            </div>
          </div>

          <div className="rounded-2xl p-6 flex flex-col justify-between"
            style={{
              background: "linear-gradient(135deg, var(--navy) 0%, var(--navy-mid) 100%)",
            }}>
            <div>
              <h3 className="font-display text-xl font-bold text-white mb-2">
                Ücretsiz Teklif Alın
              </h3>
              <p className="text-sm mb-4" style={{ color: "rgba(255,255,255,0.6)" }}>
                Uzmanlarımız 24 saat içinde sizinle iletişime geçecek.
              </p>
            </div>
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl"
              style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)" }}>
              <span className="text-xl">📞</span>
              <div>
                <p className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>Bizi arayın</p>
                <p className="text-sm font-bold text-white">0850 XXX XX XX</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResultPage({ params }: { params: Promise<{ orderId: string }> }) {
  const [orderId, setOrderId] = useState<string | null>(null);
  useEffect(() => { params.then(p => setOrderId(p.orderId)); }, [params]);
  if (!orderId) return null;
  return (
    <Suspense fallback={null}>
      <ResultContent orderId={orderId} />
      <HowToUse tourKey="result" steps={RESULT_GUIDE} autoOpen={false} />
    </Suspense>
  );
}
