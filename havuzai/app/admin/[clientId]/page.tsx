"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import HowToUse from "@/components/HowToUse";
import { supabaseBrowser } from "@/lib/supabase-browser";

const ADMIN_GUIDE = [
  {
    icon: "📋",
    title: "Sipariş Listesi",
    desc: "Müşterilerden gelen tüm havuz talepleri burada listelenmektedir. Her kart, müşterinin orijinal fotoğrafını ve AI tarafından oluşturulan havuzlu görseli yan yana gösterir.",
  },
  {
    icon: "🔍",
    title: "Siparişleri Filtreleyin",
    desc: "Sol menüden 'Yeni', 'Arandı', 'Teklif Verildi' veya 'Tamamlandı' filtrelerini kullanarak siparişleri durumlarına göre görüntüleyebilirsiniz. Kırmızı sayaç bekleyen yeni siparişleri gösterir.",
  },
  {
    icon: "👆",
    title: "Detayları Görün",
    desc: "Herhangi bir siparişe tıklayarak müşteri bilgilerini, görselleri ve havuz seçimlerini içeren detay modalını açabilirsiniz.",
  },
  {
    icon: "⚡",
    title: "Durumu İlerletin",
    desc: "Her siparişin sağındaki hızlı aksiyon butonu ile durumu tek tıkla ilerletebilirsiniz: Yeni → Arandı → Teklif Verildi → Tamamlandı. Detay modalından da bu işlemi yapabilirsiniz.",
  },
  {
    icon: "↻",
    title: "Yeni Siparişleri Takip Edin",
    desc: "Sağ üstteki 'Yenile' butonu ile siparişleri manuel olarak güncelleyebilirsiniz. Yeni müşteri form gönderdiğinde liste otomatik güncellenmez — yenilemek gerekir.",
  },
];

interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  pool_model: string;
  pool_size: string;
  deck_type: string;
  ceramic_type: string;
  original_photo: string;
  ai_photo: string;
  status: string;
  created_at: string;
}

const STATUS = {
  new:       { label: "Yeni",           bg: "#EFF6FF", text: "#1D4ED8", dot: "#3B82F6" },
  contacted: { label: "Arandı",         bg: "#FFFBEB", text: "#92400E", dot: "#F59E0B" },
  offered:   { label: "Teklif Verildi", bg: "#F5F3FF", text: "#5B21B6", dot: "#8B5CF6" },
  completed: { label: "Tamamlandı",     bg: "#ECFDF5", text: "#065F46", dot: "#10B981" },
  cancelled: { label: "İptal",          bg: "#FEF2F2", text: "#991B1B", dot: "#EF4444" },
};

const NEXT: Record<string, { status: string; label: string }> = {
  new:       { status: "contacted", label: "Arandı işaretle" },
  contacted: { status: "offered",   label: "Teklif verildi" },
  offered:   { status: "completed", label: "Tamamlandı" },
};

const FILTERS = ["all", "new", "contacted", "offered", "completed"] as const;

export default function AdminPanel({ params }: { params: Promise<{ clientId: string }> }) {
  const router = useRouter();
  const [clientId, setClientId]   = useState("");
  const [authOk, setAuthOk]       = useState(false);
  const [orders, setOrders]       = useState<Order[]>([]);
  const [filter, setFilter]       = useState<string>("all");
  const [selected, setSelected]   = useState<Order | null>(null);
  const [loading, setLoading]     = useState(true);

  // Resolve params then immediately verify auth — nothing renders until both done
  useEffect(() => {
    params.then(async (p) => {
      const id = p.clientId;
      setClientId(id);
      try {
        const { data: { session } } = await supabaseBrowser.auth.getSession();
        if (!session) {
          router.replace("/admin");
          return;
        }
        const { data: client } = await supabaseBrowser
          .from("clients")
          .select("id")
          .eq("auth_user_id", session.user.id)
          .single();
        if (!client || client.id !== id) {
          router.replace("/admin");
        } else {
          setAuthOk(true);
        }
      } catch {
        router.replace("/admin");
      }
    });
  }, [params, router]);

  const load = async () => {
    if (!clientId) return;
    setLoading(true);
    const res  = await fetch(`/api/orders?clientId=${clientId}&status=${filter}`);
    const data = await res.json();
    setOrders(data.orders || []);
    setLoading(false);
  };

  useEffect(() => { if (authOk) load(); }, [authOk, clientId, filter]);

  const advance = async (orderId: string, status: string) => {
    await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setSelected(null);
    load();
  };

  const handleLogout = async () => {
    await supabaseBrowser.auth.signOut();
    router.push("/admin");
  };

  const newCount = orders.filter(o => o.status === "new").length;
  const s = (key: string) => STATUS[key as keyof typeof STATUS] ?? STATUS.new;

  // Auth henüz doğrulanmadıysa boş ekran göster (redirect bekleniyor)
  if (!authOk) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--sand)" }}>
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: "var(--navy)", borderTopColor: "transparent" }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex" style={{ background: "var(--sand)", fontFamily: "var(--font-jakarta), sans-serif" }}>

      {/* Sidebar */}
      <aside className="w-64 shrink-0 flex flex-col"
        style={{ background: "var(--navy)", minHeight: "100vh" }}>

        {/* Brand */}
        <div className="px-6 py-6" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-center gap-2.5">
            <img
              src="/pools/havuzai-logo-şeffaf.png"
              alt="HavuzAI"
              style={{
                height: "72px", width: "auto", objectFit: "contain",
                background: "white", borderRadius: "10px", padding: "8px 14px",
              }}
            />
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>Admin Panel</p>
          </div>
        </div>

        {/* Filters nav */}
        <nav className="flex-1 px-3 py-4">
          <p className="text-xs font-semibold uppercase tracking-widest px-3 mb-3"
            style={{ color: "rgba(255,255,255,0.3)" }}>
            Filtrele
          </p>
          {FILTERS.map((f) => {
            const active = filter === f;
            const info = f !== "all" ? s(f) : null;
            return (
              <button key={f} onClick={() => setFilter(f)}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg mb-1 text-sm font-medium transition-all"
                style={{
                  background: active ? "rgba(255,255,255,0.1)" : "transparent",
                  color:      active ? "white" : "rgba(255,255,255,0.5)",
                }}>
                <div className="flex items-center gap-2.5">
                  {info && (
                    <div className="w-2 h-2 rounded-full shrink-0"
                      style={{ background: info.dot }} />
                  )}
                  <span>{f === "all" ? "Tümü" : info?.label}</span>
                </div>
                {f === "new" && newCount > 0 && (
                  <span className="text-xs px-1.5 py-0.5 rounded-full font-bold"
                    style={{ background: "#EF4444", color: "white" }}>
                    {newCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer + Logout */}
        <div className="px-6 py-4" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <p className="text-xs mb-3" style={{ color: "rgba(255,255,255,0.3)" }}>{clientId}</p>
          <button
            onClick={handleLogout}
            className="w-full py-2 rounded-lg text-sm font-semibold transition-all"
            style={{ background: "rgba(239,68,68,0.15)", color: "#FCA5A5" }}
            onMouseEnter={e => (e.currentTarget.style.background = "rgba(239,68,68,0.25)")}
            onMouseLeave={e => (e.currentTarget.style.background = "rgba(239,68,68,0.15)")}
          >
            Çıkış Yap
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col overflow-hidden">

        {/* Top bar */}
        <header className="px-8 py-5 flex items-center justify-between"
          style={{ background: "var(--white)", borderBottom: "1px solid var(--border-soft)" }}>
          <div>
            <h1 className="font-display text-xl font-bold" style={{ color: "var(--navy)" }}>
              {filter === "all" ? "Tüm Siparişler" : STATUS[filter as keyof typeof STATUS]?.label}
            </h1>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              {orders.length} sipariş
            </p>
          </div>
          <button onClick={load}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{ border: "1.5px solid var(--border)", color: "var(--text-muted)", background: "var(--white)" }}>
            ↻ Yenile
          </button>
        </header>

        {/* Order list */}
        <div className="flex-1 overflow-y-auto p-8">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin-slow"
                style={{ borderColor: "var(--navy)", borderTopColor: "transparent" }} />
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-5xl mb-4 opacity-20">🏊</div>
              <p style={{ color: "var(--text-faint)" }}>Sipariş bulunamadı.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {orders.map((order) => {
                const st = s(order.status);
                const next = NEXT[order.status];
                return (
                  <div key={order.id}
                    className="flex items-center gap-5 p-5 rounded-2xl cursor-pointer transition-all"
                    style={{
                      background: "var(--white)",
                      border: "1px solid var(--border-soft)",
                      boxShadow: "0 1px 4px rgba(12,31,63,0.04)",
                    }}
                    onClick={() => setSelected(order)}
                    onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 4px 20px rgba(12,31,63,0.1)")}
                    onMouseLeave={e => (e.currentTarget.style.boxShadow = "0 1px 4px rgba(12,31,63,0.04)")}
                  >
                    {/* Images */}
                    <div className="flex items-center gap-2 shrink-0">
                      <img src={order.original_photo} alt=""
                        className="w-16 h-16 object-cover rounded-xl" />
                      <span style={{ color: "var(--text-faint)", fontSize: "18px" }}>→</span>
                      <img src={order.ai_photo} alt=""
                        className="w-16 h-16 object-cover rounded-xl"
                        style={{ outline: "2px solid var(--pool)", outlineOffset: "2px" }} />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold" style={{ color: "var(--navy)" }}>
                          {order.customer_name}
                        </h3>
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{ background: st.bg, color: st.text }}>
                          <span className="inline-block w-1.5 h-1.5 rounded-full mr-1.5 align-middle"
                            style={{ background: st.dot }} />
                          {st.label}
                        </span>
                      </div>
                      <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                        📞 {order.customer_phone}
                      </p>
                      <div className="flex gap-3 mt-1">
                        <span className="text-xs" style={{ color: "var(--text-faint)" }}>
                          🏊 {order.pool_model}
                        </span>
                        <span className="text-xs" style={{ color: "var(--text-faint)" }}>
                          📐 {order.pool_size}
                        </span>
                        <span className="text-xs" style={{ color: "var(--text-faint)" }}>
                          {new Date(order.created_at).toLocaleDateString("tr-TR")}
                        </span>
                      </div>
                    </div>

                    {/* Action */}
                    {next && (
                      <button
                        className="shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                        style={{ background: "var(--navy)", color: "white" }}
                        onClick={e => { e.stopPropagation(); advance(order.id, next.status); }}
                        onMouseEnter={e => (e.currentTarget.style.background = "var(--navy-mid)")}
                        onMouseLeave={e => (e.currentTarget.style.background = "var(--navy)")}
                      >
                        {next.label}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(12,31,63,0.5)", backdropFilter: "blur(4px)" }}
          onClick={() => setSelected(null)}>
          <div className="w-full max-w-lg rounded-2xl overflow-hidden"
            style={{ background: "var(--white)", boxShadow: "0 24px 60px rgba(12,31,63,0.3)" }}
            onClick={e => e.stopPropagation()}>

            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4"
              style={{ borderBottom: "1px solid var(--border-soft)" }}>
              <h2 className="font-display font-bold text-lg" style={{ color: "var(--navy)" }}>
                {selected.customer_name}
              </h2>
              <button onClick={() => setSelected(null)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-lg transition-colors"
                style={{ background: "var(--sand)", color: "var(--text-muted)" }}>
                ×
              </button>
            </div>

            {/* Images */}
            <div className="grid grid-cols-2"
              style={{ borderBottom: "1px solid var(--border-soft)" }}>
              <img src={selected.original_photo} alt="Orijinal"
                className="w-full object-cover" style={{ aspectRatio: "4/3" }} />
              <img src={selected.ai_photo} alt="AI"
                className="w-full object-cover" style={{ aspectRatio: "4/3" }} />
            </div>

            {/* Details */}
            <div className="px-6 py-4 grid grid-cols-2 gap-3 text-sm"
              style={{ borderBottom: "1px solid var(--border-soft)" }}>
              {[
                { label: "Telefon",  value: selected.customer_phone },
                { label: "Adres",    value: selected.customer_address },
                { label: "Model",    value: `${selected.pool_model} — ${selected.pool_size}` },
                { label: "Durum",    value: s(selected.status).label },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-xs mb-0.5" style={{ color: "var(--text-faint)" }}>{label}</p>
                  <p className="font-medium" style={{ color: "var(--navy)" }}>{value}</p>
                </div>
              ))}
            </div>

            {/* Action */}
            <div className="px-6 py-4">
              {NEXT[selected.status] ? (
                <button
                  className="btn-primary w-full justify-center"
                  onClick={() => advance(selected.id, NEXT[selected.status].status)}>
                  {NEXT[selected.status].label} →
                </button>
              ) : (
                <div className="text-center text-sm py-1" style={{ color: "var(--text-faint)" }}>
                  {s(selected.status).label}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <HowToUse tourKey="admin" steps={ADMIN_GUIDE} />
    </div>
  );
}
