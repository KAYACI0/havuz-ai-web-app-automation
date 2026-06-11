"use client";

import { useEffect, useState, useCallback } from "react";
import type { LogEntry } from "@/lib/logger";

const LEVEL_STYLE: Record<string, string> = {
  info:    "bg-blue-50  text-blue-800  border-blue-200",
  success: "bg-green-50 text-green-800 border-green-200",
  error:   "bg-red-50   text-red-800   border-red-200",
};

const LEVEL_ICON: Record<string, string> = {
  info: "ℹ️", success: "✅", error: "❌",
};

export default function LogsPage() {
  const [logs, setLogs]           = useState<LogEntry[]>([]);
  const [autoRefresh, setAuto]    = useState(true);
  const [expanded, setExpanded]   = useState<string | null>(null);
  const [filter, setFilter]       = useState<"all" | "error" | "success" | "info">("all");

  const secret = typeof window !== "undefined"
    ? new URLSearchParams(window.location.search).get("secret") || ""
    : "";

  const fetchLogs = useCallback(async () => {
    const res  = await fetch(`/api/logs?secret=${secret}`);
    if (res.status === 401) { setLogs([]); return; }
    const data = await res.json();
    setLogs(data);
  }, [secret]);

  const clearLogs = async () => {
    await fetch(`/api/logs?secret=${secret}`, { method: "DELETE" });
    setLogs([]);
  };

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  useEffect(() => {
    if (!autoRefresh) return;
    const id = setInterval(fetchLogs, 2000);
    return () => clearInterval(id);
  }, [autoRefresh, fetchLogs]);

  const visible = filter === "all" ? logs : logs.filter((l) => l.level === filter);
  const errorCount   = logs.filter((l) => l.level === "error").length;
  const successCount = logs.filter((l) => l.level === "success").length;

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 font-mono p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">🪵 HavuzAI — Log Paneli</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {logs.length} kayıt &nbsp;·&nbsp;
            <span className="text-red-400">{errorCount} hata</span> &nbsp;·&nbsp;
            <span className="text-green-400">{successCount} başarılı</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAuto(e.target.checked)}
              className="accent-blue-500"
            />
            Otomatik yenile (2s)
          </label>
          <button
            onClick={fetchLogs}
            className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded text-sm"
          >
            ↻ Yenile
          </button>
          <button
            onClick={clearLogs}
            className="px-3 py-1.5 bg-red-900 hover:bg-red-800 rounded text-sm text-red-300"
          >
            🗑 Temizle
          </button>
        </div>
      </div>

      {/* Filtreler */}
      <div className="flex gap-2 mb-4">
        {(["all", "error", "success", "info"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors
              ${filter === f
                ? "bg-blue-600 text-white"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"}`}
          >
            {f === "all" ? "Tümü" : f === "error" ? "❌ Hata" : f === "success" ? "✅ Başarılı" : "ℹ️ Bilgi"}
          </button>
        ))}
      </div>

      {/* Log Listesi */}
      {visible.length === 0 ? (
        <div className="text-center py-20 text-gray-600">
          <p className="text-4xl mb-3">📭</p>
          <p>Henüz log yok. /app sayfasında form gönder.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {visible.map((entry) => (
            <div
              key={entry.id}
              className={`border rounded-lg overflow-hidden cursor-pointer
                transition-all ${LEVEL_STYLE[entry.level]}`}
              onClick={() =>
                setExpanded(expanded === entry.id ? null : entry.id)
              }
            >
              <div className="flex items-center gap-3 px-4 py-2.5">
                <span className="text-base">{LEVEL_ICON[entry.level]}</span>
                <span className="text-xs text-gray-500 shrink-0 w-24">
                  {new Date(entry.timestamp).toLocaleTimeString("tr-TR")}
                </span>
                <span className="text-xs font-bold shrink-0 w-36 truncate opacity-70">
                  {entry.step}
                </span>
                <span className="text-sm font-medium flex-1 truncate">
                  {entry.message}
                </span>
                {entry.data !== undefined && (
                  <span className="text-xs opacity-50 shrink-0">
                    {expanded === entry.id ? "▲" : "▼"} detay
                  </span>
                )}
              </div>

              {expanded === entry.id && entry.data !== undefined && (
                <div className="border-t border-current border-opacity-20 px-4 py-3 bg-black/10">
                  <pre className="text-xs overflow-x-auto whitespace-pre-wrap break-all">
                    {JSON.stringify(entry.data, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
