import type {
  ClientConfig,
  PoolModel,
  ColorOption,
  Features,
  Brand,
  Contact,
} from "./config-types";

/**
 * Varsayılan katalog — Roma ve Relax modelleri, ölçüler,
 * deck/seramik renkleri ve prompt şekil açıklamaları güncellendi.
 */

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/$/, "");

if (!SITE_URL) {
  console.warn(
    "[config-defaults] NEXT_PUBLIC_SITE_URL tanımlı değil — public/pools/ altındaki " +
      "referans görselleri fal.ai'ye gönderilemeyecek (relatif URL fetch edilemez)."
  );
}

/** public/pools/ altındaki bir dosyayı tam URL'e çevirir. */
function poolAsset(filename: string): string {
  return `${SITE_URL}/pools/${encodeURIComponent(filename)}`;
}

const RELAX_SHAPE = `STRICTLY RECTANGULAR fiberglass pool.
Perfectly straight parallel long sides with sharp 90-degree corners.
Clean boxy rectangular silhouette embedded completely in-ground.
Integrated entry steps molded into ONE corner of the pool, exactly matching the reference images — the steps stay in that same corner, not centered on an end.
MUST BE PLACED FLAT AND FLUSH AT 0CM ELEVATION WITH THE LAWN.
DO NOT make it oval. DO NOT curve the sides. MUST be rectangular.`;

// DİKKAT — bu metin daha önce "two semicircle ends" (simetrik pill/stadyum
// şekli) diyordu. Bu YANLIŞTI ve Roma'nın günlerce simetrik oval/stadyum
// çıkmasının doğrudan sebebiydi — model burada yazana uyuyordu.
// Gerçek ürün fotoğraflarıyla doğrulanan doğru geometri: iki uç birbirinden
// FARKLI. Bir uç geniş ve tam yuvarlak; diğer uç daha dar ve YUVARLAK
// DEĞİL, iki düz yüzeyin künt bir açıyla birleştiği kesik bir uç (tekne
// pruvası gibi). ASİMETRİK bir şekil — simetrik oval/pill değil.
const ROMA_SHAPE = `Fiberglass pool with an ASYMMETRIC shape — the two ends look clearly DIFFERENT from each other:
- ONE end is WIDE and fully ROUNDED (a smooth semicircle curve).
- The OTHER end is NARROWER with a CHAMFERED POINT — not a sharp knife-tip, not a round curve, but two flat angled facets meeting at a shallow, blunt angle (like the bow of a boat).
- The two long sides connecting the ends are NOT straight and NOT parallel — they curve and taper gently from the wide rounded end toward the narrow chamfered end.
This is NOT a symmetric oval, NOT a pill/stadium shape, NOT a rectangle, NOT a rounded rectangle. Match the reference images' silhouette exactly — including the asymmetry.
It features WIDE INTEGRATED UNDERWATER ENTRY STEPS molded directly inside the NARROW chamfered end of the pool shell, exactly matching the reference images.
The surround consists of high-end 33x66 cm rectangular ceramic tiles (running-bond brick pattern, never mosaic) or real wood deck laid seamlessly around the pool edge, sunk flush with the lawn.
The pool and surround are completely buried flush with the lawn level (0cm height, zero vertical side-walls visible from outside).
No external ladders on this model unless separately selected, no slanted diagonal angles, no raised platform sides.`;

export const DEFAULT_POOL_MODELS: PoolModel[] = [
  {
    id: "RELAX",
    name: "RELAX",
    sub: "Organik & Aile",
    description:
      "dikdörtgen yapısıyla işlevsel ve sade bir tasarım sunan, her bahçeye kolaylıkla uyum sağlayan havuz modelidir.",
    prompt_description: RELAX_SHAPE,
    tag: "En Popüler",
    // Stüdyo çekimi, temiz arka plan, köşe basamağı net görünür.
    reference_image_url:
      process.env.NEXT_PUBLIC_RELAX_REFERENCE_URL || poolAsset("relax-referans-1.jpeg"),
    reference_image_url_2:
      process.env.NEXT_PUBLIC_RELAX_REFERENCE_URL_2 || poolAsset("relax-referans-2.jpeg"),
    sizes: ["2.25x4.45x1.5", "3x5x1.5", "3x6x1.5", "3x7x1.5", "3x8x1.5"],
  },
  {
    id: "ROMA",
    name: "ROMA",
    sub: "Klasik & Prestij",
    description:
      "Yumuşak oval hatlarıyla doğal ve şık görünüm. Modern bahcelere mükemmel uyum sağlanması.",
    prompt_description: ROMA_SHAPE,
    tag: "Premium",
    // Birincil: havuzun TAM silüetini gösteren, "Roma Model" etiketli görsel.
    reference_image_url:
      process.env.NEXT_PUBLIC_ROMA_REFERENCE_URL || poolAsset("roma-referans-1.jpeg"),
    // İkincil: basamakların net göründüğü yakın/geniş açı.
    reference_image_url_2:
      process.env.NEXT_PUBLIC_ROMA_REFERENCE_URL_2 || poolAsset("roma-referans-2.jpeg"),
    sizes: ["3x6x1.5"],
  },
];

export const DEFAULT_DECK_COLORS: ColorOption[] = [
  { id: "ceviz", name: "Ceviz", hex: "#8B6347" },
  { id: "antrasit04", name: "Antrasit 04", hex: "#4A4A4A" },
  { id: "koyu-kahve", name: "Koyu Kahve", hex: "#3D2B1F" },
  { id: "yesil", name: "Yeşil", hex: "#5C7A3E" },
  { id: "kirmizi", name: "Kırmızı", hex: "#8B3A3A" },
  { id: "gunes-sarisi", name: "Güneş Sarısı", hex: "#C8A45A" },
  { id: "bej", name: "Bej", hex: "#C4A882" },
];

export const DEFAULT_CERAMIC_COLORS: ColorOption[] = [
  { id: "turkuaz", name: "Turkuaz", hex: "linear-gradient(135deg, #0EA5E9, #06B6D4)" },
  { id: "mavi", name: "Mavi", hex: "linear-gradient(135deg, #3B82F6, #1D4ED8)" },
  { id: "beyaz", name: "Beyaz", hex: "linear-gradient(135deg, #E0F2FE, #BAE6FD)" },
  { id: "gri", name: "Gri", hex: "linear-gradient(135deg, #94A3B8, #64748B)" },
  { id: "krem", name: "Krem", hex: "linear-gradient(135deg, #FEF3C7, #D4A853)" },
];

export const DEFAULT_FEATURES: Features = {
  waterfall: true,
  stairs: true,
};

export const DEFAULT_BRAND: Brand = {
  primary_color: "#1D7BBF",
  logo_url: "",
  company_name: "",
};

export const DEFAULT_CONTACT: Contact = {};

/** Tam varsayılan config üretir (client_id verilerek). */
export function defaultConfig(clientId: string): ClientConfig {
  return {
    client_id: clientId,
    pool_models: DEFAULT_POOL_MODELS,
    deck_colors: DEFAULT_DECK_COLORS,
    ceramic_colors: DEFAULT_CERAMIC_COLORS,
    features: DEFAULT_FEATURES,
    brand: DEFAULT_BRAND,
    contact: DEFAULT_CONTACT,
  };
}