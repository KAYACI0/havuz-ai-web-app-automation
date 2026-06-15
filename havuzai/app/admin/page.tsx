"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { data, error: authError } = await supabaseBrowser.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !data.user) {
      setError("Email veya şifre hatalı");
      setLoading(false);
      return;
    }

    const { data: client, error: clientError } = await supabaseBrowser
      .from("clients")
      .select("id, name")
      .eq("auth_user_id", data.user.id)
      .single();

    if (clientError || !client) {
      setError("Hesap bulunamadı. Lütfen yönetici ile iletişime geçin.");
      await supabaseBrowser.auth.signOut();
      setLoading(false);
      return;
    }

    router.push(`/admin/${client.id}`);
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
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="firma@email.com"
              required
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl
                         focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 text-white rounded-xl
                       font-bold hover:bg-blue-700 transition-colors disabled:opacity-60"
          >
            {loading ? "Giriş yapılıyor..." : "Giriş Yap →"}
          </button>
        </form>
      </div>
    </div>
  );
}
