"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [clientId, setClientId] = useState("havuzyaptir");
  const [secret, setSecret]     = useState("");
  const [error, setError]       = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId) {
      setError("Firma ID boş olamaz.");
      return;
    }
    // Basit client-side koruma — gerçek auth Supabase RLS ile sağlanır
    router.push(`/admin/${clientId}`);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-black text-blue-700">🏊 HavuzAI</h1>
          <p className="text-gray-500 text-sm mt-1">Admin Paneli</p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Firma ID
            </label>
            <input
              type="text"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              placeholder="havuzyaptir"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl
                         focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Şifre
            </label>
            <input
              type="password"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl
                         focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          <button
            type="submit"
            className="w-full py-3 bg-blue-600 text-white rounded-xl
                       font-bold hover:bg-blue-700 transition-colors"
          >
            Giriş Yap →
          </button>
        </form>
      </div>
    </div>
  );
}
