import { getClientConfig } from "@/lib/config";

/**
 * GET /api/pwa/manifest?c=<bayi-kimliği>&k=<panel|form>
 *
 * İki ayrı uygulama için manifest üretir:
 *  - k=panel (varsayılan): bayi paneli. Uygulama doğrudan /admin/<bayi> sayfasına açılır.
 *  - k=form: müşteri formu (fotoğraf yükle, görsel oluştur). Uygulama /app?client=<bayi> sayfasına açılır;
 *    uygulama adı ve renk firmanın marka ayarlarından gelir.
 */

// Sadece güvenli karakterler: manifest içine ve start_url'e rastgele metin girmesin.
const clean = (v: string | null) => (v || "").replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 64);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const c = clean(searchParams.get("c"));
  const kind = searchParams.get("k") === "form" ? "form" : "panel";

  let name = kind === "form" ? "HavuzAI" : "HavuzAI Panel";
  let shortName = "HavuzAI";
  let theme = "#0C1F3F";
  let startUrl = "/";
  const description =
    kind === "form"
      ? "Bahçenin fotoğrafını yükle, havuzunu yapay zekayla gör."
      : "Havuz taleplerini görüntüle, müşterileri ara ve siparişleri takip et.";

  if (kind === "panel") {
    startUrl = c ? `/admin/${c}` : "/";
  } else if (c) {
    startUrl = `/app?client=${c}`;
    try {
      const cfg = await getClientConfig(c);
      const company = cfg.brand?.company_name?.trim();
      if (company) {
        name = company;
        shortName = company.slice(0, 12);
      }
      const color = cfg.brand?.primary_color;
      if (color && /^#[0-9a-fA-F]{6}$/.test(color)) theme = color;
    } catch {
      // Firma bulunamazsa varsayılan ad ve renkle devam edilir.
    }
  }

  const manifest = {
    id: startUrl,
    name,
    short_name: shortName,
    description,
    start_url: startUrl,
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#FFFFFF",
    theme_color: theme,
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