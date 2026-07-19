import type {
  ClientConfig,
  PoolModel,
  ColorOption,
  Features,
  Brand,
  Contact,
} from "./config-types";

/**
 * Varsayılan katalog — bugüne kadar koda gömülü olan RELAX/ROMA modelleri, ölçüler,
 * deck/seramik renkleri ve prompt şekil açıklamaları buraya taşındı.
 *
 * İki amacı var:
 *  1. Bir firmanın client_configs kaydı yoksa/eksikse fallback (regresyon = 0).
 *  2. Mevcut firma (havuzyaptir) için seed verisi üretmek.
 *
 * Referans görsel URL'leri: public/pools/ altındaki dosyalar, NEXT_PUBLIC_SITE_URL ile
 * birleştirilip TAM (absolute) URL olarak üretiliyor. fal.ts bu URL'leri server-side
 * fetch() ile indiriyor — göreceli yol ("/pools/...") ÇALIŞMAZ, mutlaka tam domain gerekir.
 *
 * Eski davranışla geriye dönük uyumluluk için: NEXT_PUBLIC_*_REFERENCE_URL env var'ları
 * hâlâ set edilmişse, onlar öncelikli olur (override). Set değilse, aşağıdaki yerel
 * dosyalara düşülür.
 */

// Sitenin yayındaki tam adresi. Vercel'e deploy ediyorsan Project → Settings →
// Environment Variables kısmına ekle. Örn: https://havuzai.vercel.app
// veya kendi alan adın: https://havuzyaptir.com
// BOŞ KALIRSA aşağıdaki pool referansları çalışmaz (relatif path fetch edilemez) —
// bu durumda konsola uyarı basılır.
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

// Prompt'ta kullanılan detaylı şekil açıklamaları (eski lib/prompt.ts'ten aynen).
// NOT: prompt.ts şu an bu alanı OKUMUYOR (hardcode kendi shapeLine mantığını
// kullanıyor) — bu metinler şu an etkisiz. Test turu bitince ayrı ele alınacak.
const RELAX_SHAPE = `STRICTLY RECTANGULAR fiberglass pool.
Perfectly straight parallel long sides.
Sharp 90-degree corners (very slightly softened radius only).
Clean boxy rectangular silhouette from above.
Horizontal ribbing texture on interior walls.
DO NOT make it oval. DO NOT curve the sides. MUST be rectangular.
THIS IS A RECTANGLE. NOT OVAL. NOT ROUND. NOT CURVED.`;

const ROMA_SHAPE = `Fiberglass pool shaped like a ROUNDED RECTANGLE — also called a "squircle rectangle" or "pill shape".
Two long sides that are straight and parallel.
Two short ends that are large semicircles — fully rounded, like half circles.
The width is about half the length.
All transitions between straight sides and rounded ends are smooth.
This shape is like a standard swimming pool — rectangular body with two rounded ends.
NOT eye-shaped. NOT pointed ends. NOT kidney. NOT oval with pointed sides.
Horizontal ribbing texture on interior walls.
The pool has integrated entry steps at one short end — wide built-in steps that are part of the pool shell itself, descending into the water. These steps are inside the pool, not external. They appear as 3-4 wide platforms/ledges going from the pool edge down into the water at one short end.`;

export const DEFAULT_POOL_MODELS: PoolModel[] = [
  {
    id: "RELAX",
    name: "RELAX",
    sub: "Organik & Aile",
    description:
      "dikdörtgen yapısıyla işlevsel ve sade bir tasarım sunan, her bahçeye kolaylıkla uyum sağlayan havuz modelidir.",
    prompt_description: RELAX_SHAPE,
    tag: "En Popüler",
    // Birincil: açılı/perspektif çekim — basamakların gerçek 3D görünümünü taşıyor.
    reference_image_url:
      process.env.NEXT_PUBLIC_RELAX_REFERENCE_URL || poolAsset("buyuk-relax-model.jpg"),
    // İkincil: tepeden çekim — basamağın tam pozisyon/genişlik bilgisini destekliyor.
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
    // Birincil: yandan çekim — tam silüet (S-dalgası dahil) burada görünüyor.
    reference_image_url:
      process.env.NEXT_PUBLIC_ROMA_REFERENCE_URL || poolAsset("roma-model-yandan.jpg"),
    // İkincil: yakın plan — basamak detayı.
    reference_image_url_2:
      process.env.NEXT_PUBLIC_ROMA_REFERENCE_URL_2 || poolAsset("roma-model-yakin-plan.jpg"),
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