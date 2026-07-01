"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import AppPage from "@/app/app/page";

function EmbedContent() {
  const params   = useSearchParams();
  const clientId = params.get("client");

  if (!clientId) {
    return (
      <div style={{ padding: 40, textAlign: "center", fontFamily: "sans-serif" }}>
        <h2 style={{ color: "#cc0000", marginBottom: 8 }}>Geçersiz bağlantı</h2>
        <p style={{ color: "#555" }}>
          Bu form yalnızca yetkili bir bayi bağlantısı üzerinden açılabilir.
        </p>
      </div>
    );
  }

  return <AppPage clientId={clientId} isEmbed={true} />;
}

export default function EmbedPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Yükleniyor...</div>}>
      <EmbedContent />
    </Suspense>
  );
}
