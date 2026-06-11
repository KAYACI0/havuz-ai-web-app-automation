"use client";

import { useState, useEffect, useCallback } from "react";

type Client = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  plan: string;
  monthly_fee: number;
  is_active: boolean;
  created_at: string;
  last_login: string | null;
};

type Tab = "create" | "list";

const PLANS = ["basic", "pro", "enterprise"];

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ş/g, "s")
    .replace(/ı/g, "i").replace(/ö/g, "o").replace(/ç/g, "c")
    .replace(/[^a-z0-9]/g, "");
}

function generatePassword(length = 12) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#";
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("tr-TR", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

/* ─── Login ─────────────────────────────────────────────────── */
function LoginScreen({ onAuth }: { onAuth: (pass: string) => void }) {
  const [val, setVal]         = useState("");
  const [err, setErr]         = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!val.trim()) { setErr("Şifre boş olamaz."); return; }
    setLoading(true);
    setErr("");
    const res = await fetch("/api/super-admin/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: val }),
    });
    setLoading(false);
    if (!res.ok) { setErr("Yanlış şifre."); return; }
    onAuth(val);
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 w-full max-w-sm shadow-2xl">
        <div className="text-center mb-8">
          <div className="text-3xl mb-2">🔐</div>
          <h1 className="text-xl font-black text-white">Super Admin</h1>
          <p className="text-gray-500 text-sm mt-1">HavuzAI Yönetim Paneli</p>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="password"
            value={val}
            onChange={(e) => setVal(e.target.value)}
            placeholder="Admin şifresi"
            autoFocus
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-white
                       rounded-xl placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {err && <p className="text-red-400 text-sm">{err}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl font-bold transition-colors"
          >
            {loading ? "Kontrol ediliyor..." : "Giriş →"}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ─── Edit modal ────────────────────────────────────────────── */
function EditModal({
  client, adminPass, onClose, onSaved,
}: {
  client: Client; adminPass: string; onClose: () => void; onSaved: () => void;
}) {
  const [name, setName]           = useState(client.name);
  const [email, setEmail]         = useState(client.email);
  const [phone, setPhone]         = useState(client.phone || "");
  const [plan, setPlan]           = useState(client.plan);
  const [fee, setFee]             = useState(String(client.monthly_fee));
  const [isActive, setIsActive]   = useState(client.is_active);
  const [newPass, setNewPass]     = useState("");
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch(`/api/super-admin/clients/${client.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-super-admin-password": adminPass,
      },
      body: JSON.stringify({
        name,
        email,
        phone,
        plan,
        monthly_fee: Number(fee) || 0,
        is_active: isActive,
        ...(newPass ? { plain_password: newPass } : {}),
      }),
    });

    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error || "Hata oluştu."); return; }
    onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-white font-bold text-lg">✏️ Firmayı Düzenle</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl leading-none">×</button>
        </div>

        <form onSubmit={handleSave} className="flex flex-col gap-3">
          <div>
            <label className="block text-xs text-gray-400 mb-1">ID</label>
            <input
              value={client.id}
              disabled
              className="w-full px-3 py-2.5 bg-gray-800/50 border border-gray-700 text-gray-500
                         rounded-xl text-sm font-mono cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Firma Adı</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 text-white
                         rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">E-posta</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 text-white
                         rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Telefon</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 text-white
                         rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Plan</label>
              <select
                value={plan}
                onChange={(e) => setPlan(e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 text-white
                           rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {PLANS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Aylık Ücret (₺)</label>
              <input
                type="number"
                value={fee}
                onChange={(e) => setFee(e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 text-white
                           rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex items-center gap-3 px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl">
            <input
              type="checkbox"
              id="is_active_edit"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 accent-blue-500"
            />
            <label htmlFor="is_active_edit" className="text-sm text-gray-300 cursor-pointer">
              Aktif hesap
            </label>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">
              Yeni Şifre <span className="text-gray-600">(boş bırakılırsa değişmez)</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                placeholder="Değiştirmek için girin"
                className="flex-1 px-3 py-2.5 bg-gray-800 border border-gray-700 text-white
                           rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => setNewPass(generatePassword())}
                className="px-3 py-2.5 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-xl text-sm transition-colors"
              >
                🎲
              </button>
            </div>
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <div className="flex gap-3 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-sm font-medium transition-colors"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-sm font-bold transition-colors"
            >
              {loading ? "Kaydediliyor..." : "Kaydet"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Delete modal ──────────────────────────────────────────── */
function DeleteModal({
  client, adminPass, onClose, onDeleted,
}: {
  client: Client; adminPass: string; onClose: () => void; onDeleted: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const handleDelete = async () => {
    setLoading(true);
    const res = await fetch(`/api/super-admin/clients/${client.id}`, {
      method: "DELETE",
      headers: { "x-super-admin-password": adminPass },
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error || "Hata oluştu."); return; }
    onDeleted();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-red-800/50 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <div className="text-center mb-5">
          <div className="text-3xl mb-2">⚠️</div>
          <h2 className="text-white font-bold text-lg">Firmayı Sil</h2>
          <p className="text-gray-400 text-sm mt-2">
            <span className="text-white font-semibold">{client.name}</span> firmasını kalıcı olarak silmek istediğinize emin misiniz?
          </p>
        </div>
        {error && <p className="text-red-400 text-sm text-center mb-3">{error}</p>}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-sm font-medium transition-colors"
          >
            İptal
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="flex-1 py-2.5 bg-red-700 hover:bg-red-600 disabled:opacity-50 text-white rounded-xl text-sm font-bold transition-colors"
          >
            {loading ? "Siliniyor..." : "Evet, Sil"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main ──────────────────────────────────────────────────── */
export default function SuperAdminPage() {
  const [adminPass, setAdminPass] = useState("");
  const [authed, setAuthed]       = useState(false);
  const [tab, setTab]             = useState<Tab>("create");

  /* create form */
  const [name, setName]         = useState("");
  const [clientId, setClientId] = useState("");
  const [email, setEmail]       = useState("");
  const [phone, setPhone]       = useState("");
  const [plan, setPlan]         = useState("basic");
  const [fee, setFee]           = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [result, setResult]     = useState<{
    adminUrl: string; email: string; password: string; widgetScript: string;
  } | null>(null);

  /* list */
  const [clients, setClients]           = useState<Client[]>([]);
  const [listLoading, setListLoading]   = useState(false);
  const [listError, setListError]       = useState("");
  const [editClient, setEditClient]     = useState<Client | null>(null);
  const [deleteClient, setDeleteClient] = useState<Client | null>(null);

  const fetchClients = useCallback(async (pass: string) => {
    setListLoading(true);
    setListError("");
    const res = await fetch("/api/super-admin/clients", {
      headers: { "x-super-admin-password": pass },
    });
    const data = await res.json();
    setListLoading(false);
    if (!res.ok) { setListError(data.error || "Yüklenemedi."); return; }
    setClients(data.clients || []);
  }, []);

  useEffect(() => {
    if (authed && tab === "list") fetchClients(adminPass);
  }, [authed, tab, adminPass, fetchClients]);

  const handleAuth = (pass: string) => { setAdminPass(pass); setAuthed(true); };

  const handleNameChange = (val: string) => {
    setName(val);
    setClientId(slugify(val));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    const res = await fetch("/api/super-admin/create-client", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        password: adminPass,
        clientData: {
          id: clientId,
          name,
          email,
          phone,
          plan,
          monthly_fee: Number(fee) || 0,
          plain_password: password,
        },
      }),
    });

    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error || "Bir hata oluştu."); return; }

    setResult({
      adminUrl: "https://havuzai.com.tr/admin",
      email,
      password,
      widgetScript: `<script src="https://havuzai.com.tr/widget.js" data-client="${clientId}" defer></script>`,
    });
    setName(""); setClientId(""); setEmail(""); setPhone("");
    setPlan("basic"); setFee(""); setPassword("");
  };

  const handleCopyAll = () => {
    if (!result) return;
    navigator.clipboard.writeText(
      `🏊 HavuzAI - Mağaza Bilgileri\n\nAdmin Paneli: ${result.adminUrl}\nE-posta: ${result.email}\nŞifre: ${result.password}\n\nWidget Kodu:\n${result.widgetScript}`
    );
  };

  if (!authed) return <LoginScreen onAuth={handleAuth} />;

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <div className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <h1 className="text-white font-black text-lg">🏊 HavuzAI Super Admin</h1>
        <button
          onClick={() => { setAuthed(false); setAdminPass(""); }}
          className="text-gray-500 hover:text-gray-300 text-sm transition-colors"
        >
          Çıkış
        </button>
      </div>

      {/* Tabs */}
      <div className="px-6 pt-5 flex gap-2">
        {(["create", "list"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-xl text-sm font-bold transition-colors ${
              tab === t
                ? "bg-blue-600 text-white"
                : "bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700"
            }`}
          >
            {t === "create" ? "➕ Yeni Mağaza" : `🏢 Firmalar${clients.length > 0 ? ` (${clients.length})` : ""}`}
          </button>
        ))}
      </div>

      <div className="p-6 max-w-3xl mx-auto">

        {/* ── CREATE TAB ── */}
        {tab === "create" && (
          <>
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl">
              <form onSubmit={handleCreate} className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Firma Adı</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="Örn: Havuz Yaptır"
                    required
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-white
                               rounded-xl placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Client ID <span className="text-gray-500 font-normal">(otomatik)</span>
                  </label>
                  <input
                    type="text"
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    placeholder="havuzyaptir"
                    required
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 text-blue-300
                               rounded-xl placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">E-posta</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="firma@example.com"
                    required
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-white
                               rounded-xl placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Telefon</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="05xx xxx xx xx"
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-white
                               rounded-xl placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Plan</label>
                    <select
                      value={plan}
                      onChange={(e) => setPlan(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-white
                                 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {PLANS.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Aylık Ücret (₺)</label>
                    <input
                      type="number"
                      value={fee}
                      onChange={(e) => setFee(e.target.value)}
                      placeholder="2500"
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-white
                                 rounded-xl placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Şifre</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Şifre girin veya üretin"
                      required
                      className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 text-white
                                 rounded-xl placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setPassword(generatePassword())}
                      className="px-4 py-3 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-xl text-sm font-medium transition-colors whitespace-nowrap"
                    >
                      🎲 Üret
                    </button>
                  </div>
                </div>
                {error && (
                  <div className="p-3 bg-red-900/40 border border-red-700 rounded-xl text-red-300 text-sm">
                    {error}
                  </div>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50
                             text-white rounded-xl font-bold transition-colors mt-2"
                >
                  {loading ? "Oluşturuluyor..." : "Mağaza Oluştur →"}
                </button>
              </form>
            </div>

            {result && (
              <div className="mt-5 bg-green-900/20 border border-green-700 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-green-400 font-bold text-lg">✅ Mağaza Oluşturuldu!</h2>
                  <button
                    onClick={handleCopyAll}
                    className="px-4 py-2 bg-green-700 hover:bg-green-600 text-white rounded-xl text-sm font-bold transition-colors"
                  >
                    📋 Tümünü Kopyala
                  </button>
                </div>
                <div className="flex flex-col gap-3 text-sm">
                  {[
                    { label: "Admin URL", value: result.adminUrl,  mono: true,  highlight: false },
                    { label: "E-posta",   value: result.email,     mono: false, highlight: false },
                    { label: "Şifre",     value: result.password,  mono: true,  highlight: true  },
                  ].map((row) => (
                    <div key={row.label} className="flex justify-between items-center bg-gray-800/60 rounded-xl px-4 py-3">
                      <span className="text-gray-400">{row.label}</span>
                      <span className={`${row.mono ? "font-mono" : ""} ${row.highlight ? "text-green-300 font-bold" : "text-white"}`}>
                        {row.value}
                      </span>
                    </div>
                  ))}
                  <div className="bg-gray-800/60 rounded-xl px-4 py-3">
                    <p className="text-gray-400 mb-2">Widget Kodu</p>
                    <code className="text-blue-300 text-xs break-all leading-relaxed block">
                      {result.widgetScript}
                    </code>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* ── LIST TAB ── */}
        {tab === "list" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-gray-400 text-sm">{clients.length} firma kayıtlı</p>
              <button
                onClick={() => fetchClients(adminPass)}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-sm transition-colors"
              >
                ↻ Yenile
              </button>
            </div>

            {listLoading && (
              <div className="text-center py-12 text-gray-500">Yükleniyor...</div>
            )}
            {listError && (
              <div className="p-4 bg-red-900/40 border border-red-700 rounded-xl text-red-300 text-sm">{listError}</div>
            )}
            {!listLoading && !listError && clients.length === 0 && (
              <div className="text-center py-12 text-gray-600">
                <div className="text-4xl mb-3">🏢</div>
                <p>Henüz kayıtlı firma yok.</p>
              </div>
            )}

            <div className="flex flex-col gap-3">
              {clients.map((c) => (
                <div
                  key={c.id}
                  className="bg-gray-900 border border-gray-800 rounded-2xl p-5 flex items-start justify-between gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-white font-bold">{c.name}</span>
                      <span className="px-2 py-0.5 bg-blue-900/40 border border-blue-700/50 text-blue-400 rounded-full text-xs font-mono">
                        {c.id}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        c.is_active
                          ? "bg-green-900/40 border border-green-700/50 text-green-400"
                          : "bg-red-900/40 border border-red-700/50 text-red-400"
                      }`}>
                        {c.is_active ? "Aktif" : "Pasif"}
                      </span>
                      <span className="px-2 py-0.5 bg-gray-800 border border-gray-700 text-gray-400 rounded-full text-xs">
                        {c.plan}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm">{c.email}</p>
                    {c.phone && <p className="text-gray-500 text-xs mt-0.5">{c.phone}</p>}
                    <div className="flex gap-3 mt-1">
                      <p className="text-gray-600 text-xs">{formatDate(c.created_at)}</p>
                      {c.monthly_fee > 0 && (
                        <p className="text-gray-600 text-xs">₺{c.monthly_fee.toLocaleString("tr-TR")}/ay</p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => setEditClient(c)}
                      className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-xl text-xs font-medium transition-colors"
                    >
                      ✏️ Düzenle
                    </button>
                    <button
                      onClick={() => setDeleteClient(c)}
                      className="px-3 py-1.5 bg-red-900/40 hover:bg-red-900/70 text-red-400 hover:text-red-300 border border-red-800/50 rounded-xl text-xs font-medium transition-colors"
                    >
                      🗑️ Sil
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {editClient && (
        <EditModal
          client={editClient}
          adminPass={adminPass}
          onClose={() => setEditClient(null)}
          onSaved={() => fetchClients(adminPass)}
        />
      )}
      {deleteClient && (
        <DeleteModal
          client={deleteClient}
          adminPass={adminPass}
          onClose={() => setDeleteClient(null)}
          onDeleted={() => fetchClients(adminPass)}
        />
      )}
    </div>
  );
}
