"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import AppPage from "@/app/app/page";

function EmbedContent() {
  const params   = useSearchParams();
  const clientId = params.get("client") || "default";

  return <AppPage clientId={clientId} isEmbed={true} />;
}

export default function EmbedPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Yükleniyor...</div>}>
      <EmbedContent />
    </Suspense>
  );
}
