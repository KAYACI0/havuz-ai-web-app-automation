"use client";

import { useEffect, useState } from "react";
import type { ClientConfig, PoolModel, ColorOption } from "@/lib/config-types";

interface Props {
  client: { id: string; name: string };
  adminPass: string;
  onClose: () => void;
}

const inputCls =
  "w-full px-3 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg text-sm " +
  "focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500";
const labelCls = "block text-xs text-gray-400 mb-1";

export default function ConfigEditor({ client, adminPass, onClose }: Props) {
  const [config, setConfig] = useState<ClientConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [savedOk, setSavedOk] = useState(false);

  useEffect(() => {
    fetch(`/api/super-admin/config?clientId=${encodeURIComponent(client.id)}`, {
      headers: { "x-super-admin-password": adminPass },
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setConfig(d.config);
        else setError(d.error || "Yüklenemedi.");
      })
      .catch(() => setError("Bağlantı hatası."))
      .finally(() => setLoading(false));
  }, [client.id, adminPass]);

  // ─── Görsel yükleme ───────────────────────────────────────────
  async function uploadAsset(file: File, kind: string): Promise<string> {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("clientId", client.id);
    fd.append("kind", kind);
    const res = await fetch("/api/super-admin/upload-asset", {
      method: "POST",
      headers: { "x-super-admin-password": adminPass },
      body: fd,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Yükleme başarısız.");
    return data.url as string;
  }

  // ─── Immutable güncelleyiciler ────────────────────────────────
  const patch = (p: Partial<ClientConfig>) => setConfig((c) => (c ? { ...c, ...p } : c));

  const updateModel = (i: number, p: Partial<PoolModel>) =>
    setConfig((c) =>
      c ? { ...c, pool_models: c.pool_models.map((m, idx) => (idx === i ? { ...m, ...p } : m)) } : c
    );
  const addModel = () =>
    setConfig((c) =>
      c
        ? {
            ...c,
            pool_models: [
              ...c.pool_models,
              { id: `MODEL_${Date.now()}`, name: "Yeni Model", description: "", reference_image_url: "", sizes: [] },
            ],
          }
        : c
    );
  const removeModel = (i: number) =>
    setConfig((c) => (c ? { ...c, pool_models: c.pool_models.filter((_, idx) => idx !== i) } : c));

  const updateColor = (key: "deck_colors" | "ceramic_colors", i: number, p: Partial<ColorOption>) =>
    setConfig((c) => (c ? { ...c, [key]: c[key].map((x, idx) => (idx === i ? { ...x, ...p } : x)) } : c));
  const addColor = (key: "deck_colors" | "ceramic_colors") =>
    setConfig((c) =>
      c ? { ...c, [key]: [...c[key], { id: `c_${Date.now()}`, name: "", hex: "#000000" }] } : c
    );
  const removeColor = (key: "deck_colors" | "ceramic_colors", i: number) =>
    setConfig((c) => (c ? { ...c, [key]: c[key].filter((_, idx) => idx !== i) } : c));

  // ─── Kaydet ───────────────────────────────────────────────────
  const handleSave = async () => {
    if (!config) return;
    setSaving(true);
    setError("");
    setSavedOk(false);
    const res = await fetch("/api/super-admin/config", {
      method: "PUT",
      headers: { "Content-Type": "application/json", "x-super-admin-password": adminPass },
      body: JSON.stringify({ clientId: client.id, config }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { setError(data.error || "Kaydedilemedi."); return; }
    setSavedOk(true);
    setTimeout(() => setSavedOk(false), 2500);
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-stretch justify-center p-0 sm:p-4">
      <div className="bg-gray-950 border border-gray-800 w-full max-w-3xl sm:rounded-2xl flex flex-col max-h-screen sm:max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800 shrink-0">
          <div>
            <h2 className="text-white font-bold">⚙️ Konfigürasyon</h2>
            <p className="text-xs text-gray-500">{client.name} · {client.id}</p>
          </div>
          <div className="flex items-center gap-2">
            {savedOk && <span className="text-green-400 text-sm">✓ Kaydedildi</span>}
            <button onClick={handleSave} disabled={saving || loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-sm font-bold">
              {saving ? "Kaydediliyor..." : "💾 Kaydet"}
            </button>
            <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl leading-none px-2">×</button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-8">
          {loading && <p className="text-gray-500 text-center py-10">Yükleniyor...</p>}
          {error && <div className="p-3 bg-red-900/40 border border-red-700 rounded-xl text-red-300 text-sm">{error}</div>}

          {config && (
            <>
              {/* ── MODELLER ── */}
              <section>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-white font-bold text-sm uppercase tracking-wider">🏊 Havuz Modelleri</h3>
                  <button onClick={addModel} className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-lg text-xs font-medium">+ Model Ekle</button>
                </div>
                <div className="flex flex-col gap-4">
                  {config.pool_models.map((m, i) => (
                    <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex flex-col gap-3">
                      <div className="flex gap-4">
                        {/* Görsel */}
                        <div className="shrink-0">
                          <div className="w-28 h-28 rounded-lg bg-gray-800 border border-gray-700 overflow-hidden flex items-center justify-center">
                            {m.reference_image_url
                              ? <img src={m.reference_image_url} alt={m.name} className="w-full h-full object-cover" />
                              : <span className="text-gray-600 text-xs text-center px-2">Referans görsel yok</span>}
                          </div>
                          <label className="mt-2 block text-center px-2 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-lg text-xs cursor-pointer">
                            Görsel Yükle
                            <input type="file" accept="image/*" className="hidden"
                              onChange={async (e) => {
                                const f = e.target.files?.[0];
                                if (!f) return;
                                try { const url = await uploadAsset(f, "model"); updateModel(i, { reference_image_url: url }); }
                                catch (err) { setError((err as Error).message); }
                              }} />
                          </label>
                        </div>
                        {/* Alanlar */}
                        <div className="flex-1 flex flex-col gap-2">
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className={labelCls}>ID (kararlı — değiştirmeyin)</label>
                              <input className={inputCls + " font-mono"} value={m.id}
                                onChange={(e) => updateModel(i, { id: e.target.value })} />
                            </div>
                            <div>
                              <label className={labelCls}>Ad</label>
                              <input className={inputCls} value={m.name}
                                onChange={(e) => updateModel(i, { name: e.target.value })} />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className={labelCls}>Alt başlık</label>
                              <input className={inputCls} value={m.sub || ""}
                                onChange={(e) => updateModel(i, { sub: e.target.value })} />
                            </div>
                            <div>
                              <label className={labelCls}>Rozet (tag)</label>
                              <input className={inputCls} value={m.tag || ""}
                                onChange={(e) => updateModel(i, { tag: e.target.value })} />
                            </div>
                          </div>
                          <div>
                            <label className={labelCls}>Ölçüler (virgülle: 3x5x1.5, 3x6x1.5)</label>
                            <input className={inputCls} value={m.sizes.join(", ")}
                              onChange={(e) => updateModel(i, { sizes: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })} />
                          </div>
                        </div>
                      </div>
                      <div>
                        <label className={labelCls}>Kart açıklaması (müşteriye gösterilir)</label>
                        <textarea className={inputCls} rows={2} value={m.description}
                          onChange={(e) => updateModel(i, { description: e.target.value })} />
                      </div>
                      <div>
                        <label className={labelCls}>AI şekil açıklaması (İngilizce önerilir — boşsa kart açıklaması kullanılır)</label>
                        <textarea className={inputCls + " font-mono text-xs"} rows={4} value={m.prompt_description || ""}
                          onChange={(e) => updateModel(i, { prompt_description: e.target.value })} />
                      </div>
                      <div className="text-right">
                        <button onClick={() => removeModel(i)} className="px-3 py-1.5 bg-red-900/40 hover:bg-red-900/70 text-red-300 border border-red-800/50 rounded-lg text-xs">🗑️ Modeli Sil</button>
                      </div>
                    </div>
                  ))}
                  {config.pool_models.length === 0 && <p className="text-gray-600 text-sm text-center py-4">Henüz model yok.</p>}
                </div>
              </section>

              {/* ── DECK RENKLERİ ── */}
              <ColorSection
                title="🎨 Deck Renkleri"
                colors={config.deck_colors}
                onAdd={() => addColor("deck_colors")}
                onRemove={(i) => removeColor("deck_colors", i)}
                onUpdate={(i, p) => updateColor("deck_colors", i, p)}
              />

              {/* ── SERAMİK RENKLERİ ── */}
              <ColorSection
                title="💧 Seramik Renkleri"
                colors={config.ceramic_colors}
                allowGradient
                onAdd={() => addColor("ceramic_colors")}
                onRemove={(i) => removeColor("ceramic_colors", i)}
                onUpdate={(i, p) => updateColor("ceramic_colors", i, p)}
              />

              {/* ── ÖZELLİKLER ── */}
              <section>
                <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-3">✨ Ekstra Özellikler</h3>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 accent-blue-500" checked={!!config.features.waterfall}
                      onChange={(e) => patch({ features: { ...config.features, waterfall: e.target.checked } })} />
                    🌊 Şelale
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 accent-blue-500" checked={!!config.features.stairs}
                      onChange={(e) => patch({ features: { ...config.features, stairs: e.target.checked } })} />
                    🪜 Merdiven
                  </label>
                </div>
              </section>

              {/* ── MARKA ── */}
              <section>
                <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-3">🏷️ Marka</h3>
                <div className="flex flex-col gap-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>Firma adı</label>
                      <input className={inputCls} value={config.brand.company_name || ""}
                        onChange={(e) => patch({ brand: { ...config.brand, company_name: e.target.value } })} />
                    </div>
                    <div>
                      <label className={labelCls}>Ana renk</label>
                      <div className="flex gap-2 items-center">
                        <input type="color" className="w-10 h-9 bg-gray-800 border border-gray-700 rounded-lg"
                          value={config.brand.primary_color || "#1D7BBF"}
                          onChange={(e) => patch({ brand: { ...config.brand, primary_color: e.target.value } })} />
                        <input className={inputCls + " font-mono"} value={config.brand.primary_color || ""}
                          onChange={(e) => patch({ brand: { ...config.brand, primary_color: e.target.value } })} />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-20 h-16 rounded-lg bg-white border border-gray-700 overflow-hidden flex items-center justify-center shrink-0">
                      {config.brand.logo_url
                        ? <img src={config.brand.logo_url} alt="logo" className="w-full h-full object-contain" />
                        : <span className="text-gray-400 text-[10px]">Logo yok</span>}
                    </div>
                    <label className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-lg text-xs cursor-pointer">
                      Logo Yükle
                      <input type="file" accept="image/*" className="hidden"
                        onChange={async (e) => {
                          const f = e.target.files?.[0];
                          if (!f) return;
                          try { const url = await uploadAsset(f, "logo"); patch({ brand: { ...config.brand, logo_url: url } }); }
                          catch (err) { setError((err as Error).message); }
                        }} />
                    </label>
                  </div>
                </div>
              </section>

              {/* ── İLETİŞİM ── */}
              <section>
                <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-3">📞 İletişim (sonuç sayfasında gösterilir)</h3>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className={labelCls}>Telefon</label>
                    <input className={inputCls} value={config.contact.phone || ""}
                      onChange={(e) => patch({ contact: { ...config.contact, phone: e.target.value } })} />
                  </div>
                  <div>
                    <label className={labelCls}>WhatsApp (905xxxxxxxxx)</label>
                    <input className={inputCls} value={config.contact.whatsapp || ""}
                      onChange={(e) => patch({ contact: { ...config.contact, whatsapp: e.target.value } })} />
                  </div>
                  <div>
                    <label className={labelCls}>E-posta</label>
                    <input className={inputCls} value={config.contact.email || ""}
                      onChange={(e) => patch({ contact: { ...config.contact, email: e.target.value } })} />
                  </div>
                </div>
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Renk bölümü (deck / seramik ortak) ─────────────────────── */
function ColorSection({
  title, colors, allowGradient, onAdd, onRemove, onUpdate,
}: {
  title: string;
  colors: ColorOption[];
  allowGradient?: boolean;
  onAdd: () => void;
  onRemove: (i: number) => void;
  onUpdate: (i: number, p: Partial<ColorOption>) => void;
}) {
  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white font-bold text-sm uppercase tracking-wider">{title}</h3>
        <button onClick={onAdd} className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-lg text-xs font-medium">+ Renk Ekle</button>
      </div>
      <div className="flex flex-col gap-2">
        {colors.map((c, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg border border-gray-700 shrink-0" style={{ background: c.hex }} />
            <input className={inputCls} placeholder="Ad" value={c.name}
              onChange={(e) => onUpdate(i, { name: e.target.value })} />
            {!allowGradient && (
              <input type="color" className="w-10 h-9 bg-gray-800 border border-gray-700 rounded-lg shrink-0"
                value={/^#[0-9a-fA-F]{6}$/.test(c.hex) ? c.hex : "#000000"}
                onChange={(e) => onUpdate(i, { hex: e.target.value })} />
            )}
            <input className={inputCls + " font-mono text-xs"} placeholder={allowGradient ? "hex veya CSS gradient" : "#RRGGBB"}
              value={c.hex} onChange={(e) => onUpdate(i, { hex: e.target.value })} />
            <button onClick={() => onRemove(i)} className="px-2.5 py-2 bg-red-900/40 hover:bg-red-900/70 text-red-300 border border-red-800/50 rounded-lg text-xs shrink-0">🗑️</button>
          </div>
        ))}
        {colors.length === 0 && <p className="text-gray-600 text-sm py-2">Renk yok.</p>}
      </div>
    </section>
  );
}
