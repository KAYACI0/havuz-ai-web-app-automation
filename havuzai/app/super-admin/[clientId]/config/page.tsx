"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ConfigEditor from "@/components/super-admin/ConfigEditor";

/**
 * Firma config'i için ayrı, URL ile erişilebilir sayfa: /super-admin/<clientId>/config
 * Kendi super-admin şifre kapısı vardır; doğrulandıktan sonra ConfigEditor'ı render eder.
 * (Aynı editör /super-admin firma listesindeki ⚙️ Ayarla butonuyla modal olarak da açılır.)
 */
export default function ClientConfigPage({ params }: { params: Promise<{ clientId: string }> }) {
  const router = useRouter();
  const [clientId, setClientId] = useState("");
  const [clientName, setClientName] = useState("");
  const [adminPass, setAdminPass] = useState("");
  const [authed, setAuthed] = useState(false);

  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => { params.then((p) => setClientId(p.clientId)); }, [params]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pass.trim()) { setErr("Şifre boş olamaz."); return; }
    setLoading(true);
    setErr("");
    const res = await fetch("/api/super-admin/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: pass }),
    });
    if (!res.ok) { setLoading(false); setErr("Yanlış şifre."); return; }

    // Firma adını al (başlıkta göstermek için)
    try {
      const r = await fetch("/api/super-admin/clients", {
        headers: { "x-super-admin-password": pass },
      });
      const d = await r.json();
      const c = (d.clients || []).find((x: { id: string }) => x.id === clientId);
      setClientName(c?.name || clientId);
    } catch {
      setClientName(clientId);
    }

    setAdminPass(pass);
    setAuthed(true);
    setLoading(false);
  };

  if (!clientId) return null;

  if (!authed) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 w-full max-w-sm shadow-2xl">
          <div className="text-center mb-8">
            <div className="text-3xl mb-2">⚙️</div>
            <h1 className="text-xl font-black text-white">Firma Konfigürasyonu</h1>
            <p className="text-gray-500 text-sm mt-1 font-mono">{clientId}</p>
          </div>
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <input
              type="password"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              placeholder="Super admin şifresi"
              autoFocus
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-white rounded-xl
                         placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {err && <p className="text-red-400 text-sm">{err}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl font-bold transition-colors"
            >
              {loading ? "Kontrol ediliyor..." : "Aç →"}
            </button>
            <button
              type="button"
              onClick={() => router.push("/super-admin")}
              className="text-gray-500 hover:text-gray-300 text-sm transition-colors"
            >
              ← Firma listesine dön
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <ConfigEditor
      client={{ id: clientId, name: clientName }}
      adminPass={adminPass}
      onClose={() => router.push("/super-admin")}
    />
  );
}
