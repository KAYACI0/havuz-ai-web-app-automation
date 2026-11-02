/**
 * GET /api/pwa/manifest?c=<bayi-kimliği>
 *
 * Bayi paneli için PWA manifest'i üretir. start_url bayinin kendi panel adresi olur,
 * böylece telefona kurulan uygulama doğrudan o bayinin paneline açılır.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  // Sadece güvenli karakterler: manifest içine ve start_url'e rastgele metin girmesin.
  const c = (searchParams.get("c") || "").replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 64);
  const startUrl = c ? `/admin/${c}` : "/";

  const manifest = {
    id: startUrl,
    name: "HavuzAI Panel",
    short_name: "HavuzAI",
    description: "Havuz taleplerini görüntüle, müşterileri ara ve siparişleri takip et.",
    start_url: startUrl,
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#FFFFFF",
    theme_color: "#0C1F3F",
    lang: "tr",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };

  return new Response(JSON.stringify(manifest), {
    headers: {
      "Content-Type": "application/manifest+json; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}