"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import AppPage from "@/app/app/page";

function EmbedContent() {
  const params   = useSearchParams();
  const clientId = params.get("client");

  console.log("EMBED PAGE - URL clientId:", clientId);
  console.log("EMBED PAGE - Full URL:", typeof window !== "undefined" ? window.location.href : "(SSR)");

  if (!clientId) {
    return (
      <div style={{ padding: 20, fontFamily: "sans-serif" }}>
        <strong>HATA: client parametresi URL&apos;de yok.</strong>
        <br />
        Mevcut URL: {typeof window !== "undefined" ? window.location.href : "(bilinmiyor)"}
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
