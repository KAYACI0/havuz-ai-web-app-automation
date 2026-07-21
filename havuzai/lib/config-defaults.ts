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
Integrated entry steps and relaxation bench along interior walls.
MUST BE PLACED FLAT AND FLUSH AT 0CM ELEVATION WITH THE LAWN.
DO NOT make it oval. DO NOT curve the sides. MUST be rectangular.`;

const ROMA_SHAPE = `Fiberglass pool shaped like a classic Roman pill shape with two semicircle ends and straight parallel long sides.
It features WIDE INTEGRATED UNDERWATER ENTRY STEPS molded directly inside one rounded end of the pool shell, exactly matching the primary reference image.
The surround consists of high-end 33x66 cm rectangular ceramic tiles or real wood deck laid seamlessly around the pool edge.
The pool and surround are completely buried flush with the lawn level (0cm height, zero vertical side-walls).
No external ladders, no slanted diagonal angles, no raised platform sides.`;

export const DEFAULT_POOL_MODELS: PoolModel[] = [
  {
    id: "RELAX",
    name: "RELAX",
    sub: "Organik & Aile",
    description:
      "dikdörtgen yapısıyla işlevsel ve sade bir tasarım sunan, her bahçeye kolaylıkla uyum sağlayan havuz modelidir.",
    prompt_description: RELAX_SHAPE,
    tag: "En Popüler",
    reference_image_url:
      process.env.NEXT_PUBLIC_RELAX_REFERENCE_URL || poolAsset("buyuk-relax-model.jpg"),
    reference_image_url_2:
      process.env.NEXT_PUBLIC_RELAX_REFERENCE_URL_2 || poolAsset("kucuk-relax-model-3.jpg"),
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
    // DÜZELTME: Birincil resim YAKIN PLAN (Düz basamaklar, kavisler ve net hatlar için)
    reference_image_url:
      process.env.NEXT_PUBLIC_ROMA_REFERENCE_URL || poolAsset("roma-model-yakin-plan.jpg"),
    // DÜZELTME: İkincil resim YANDAN (Derinlik desteği için)
    reference_image_url_2:
      process.env.NEXT_PUBLIC_ROMA_REFERENCE_URL_2 || poolAsset("roma-model-yandan.jpg"),
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