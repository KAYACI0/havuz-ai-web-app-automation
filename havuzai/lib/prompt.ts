import type { ClientConfig } from "./config-types";

export interface PoolConfig {
  model: string;
  size: string;
  deck: string;
  ceramic: string;
  hasWaterfall: boolean;
  hasStairs: boolean;
  stairType: "corner" | "wide";
  poolOrientation: "horizontal" | "vertical" | "";
}

export function buildPoolPrompt(
  config: PoolConfig,
  clientConfig: ClientConfig
): string {
  const { model, size, ceramic, deck, poolOrientation } = config;

  const poolModel = clientConfig.pool_models.find((m) => m.id === model);
  const modelName = poolModel?.name || model;
  const deckColor = deck
    ? clientConfig.deck_colors.find((d) => d.id === deck)
    : null;
  const ceramicColor = ceramic
    ? clientConfig.ceramic_colors.find((c) => c.id === ceramic)
    : null;

  const isRoma = model.toUpperCase() === "ROMA";
  const hasSurround = Boolean(ceramicColor || deckColor);

  // Türkçe renk adlarını İngilizceye çevir (model Türkçe rengi tanımıyor).
  const COLOR_EN: Record<string, string> = {
    mavi: "blue", beyaz: "white", gri: "gray", "açık gri": "light gray",
    "koyu gri": "dark gray", antrasit: "anthracite gray", bej: "beige",
    krem: "cream", kahverengi: "brown", "açık kahve": "light brown",
    siyah: "black", yeşil: "green", turkuaz: "turquoise", kum: "sand",
  };
  const toEnColor = (name: string) =>
    COLOR_EN[name.trim().toLowerCase()] ?? name;
  const ceramicColorEn = ceramicColor ? toEnColor(ceramicColor.name) : "";
  const deckColorEn = deckColor ? toEnColor(deckColor.name) : "";

  const hasRef2 = Boolean(poolModel?.reference_image_url_2);
  // İkinci referans varsa fal.ts ikisini tek board'da birleştirip Image 2
  // olarak gönderir — havuz her zaman Image 2, şelale her zaman Image 3.
  const poolRefLabel = hasRef2
    ? "Image 2 shows the pool model from two angles side by side (full view + close-up of the steps)"
    : "Image 2 shows the pool model";
  const waterfallImageNo = 3;

  // ---- Şekil (referansa devredilmiş, tek netleştirme satırı) ----
  // ROMA: S-dalgası tarifi güçlendirildi (S4) — önceki "gently wavy" ifadesi
  // modelin simetrik oval/stadyuma yuvarlamasına izin veriyordu.
  const shapeLine = isRoma
    ? `Pool shape: copy the reference pool EXACTLY — a soft freeform oval, both ends rounded. This is explicitly NOT a symmetric ellipse or stadium shape: one long side has a pronounced outward bulge partway along its length, breaking the curve into a visible S-wave. If your output silhouette looks like a smooth symmetric oval, it is WRONG — exaggerate the bulge until it clearly departs from symmetry. Copy its molded interior too: wide steps at the rounded end, bench along one side, visible under the water.`
    : `Pool shape: copy the reference pool EXACTLY — a clean rectangle. Copy its molded interior too: the built-in steps in the SAME position as the reference (corner steps stay in the same corner), visible under the water.`;

  // ---- Kılavuz + yön ----
  // S1: kılavuz artık fal.ts'te OPAK dolgu ile çiziliyor (yarı saydam değil).
  // Buradaki dil buna göre "yer tutucu blok / değiştir" çerçevesine geçti —
  // salt "üstünü boya" komutundan daha net bir "bu nesneyi değiştir" görevi.
  // S2/S5: kutunun boyutu artık gerçek havuz ölçüsüne kilitli (fal.ts,
  // parsePoolAspect) — bu yüzden "kesin ölçek" cümlesi eklendi.
  const guideLines = hasSurround
    ? `Image 1 has a SOLID magenta rectangle: a placeholder block marking the water area at this photo's exact real-world scale — its size is a precise measurement, not a rough suggestion. The pool must fill this block edge-to-edge and never extend past it in any direction. A THIN magenta outline further out marks the outer edge of the paving. A dashed magenta line marks the pool's long axis.
Paving fills ONLY the ring between the solid block and the thin outline; its outer edge is straight and rectangular, grass starts right at the thin outline.
REPLACE THE ENTIRE SOLID MAGENTA BLOCK with the pool and REPLACE the thin outline/dashed line areas with paving/grass. Nothing pink, magenta, or purple may remain anywhere in the final image.`
    : `Image 1 has a SOLID magenta rectangle: a placeholder block marking the pool's exact footprint at this photo's real-world scale — its size is a precise measurement, not a suggestion. A dashed magenta line marks the pool's long axis.
Build the pool exactly inside this block, filling it edge-to-edge, same direction as drawn.
REPLACE THE ENTIRE SOLID MAGENTA BLOCK with the pool. Nothing pink, magenta, or purple may remain anywhere in the final image.`;

  const orientationLine =
    poolOrientation === "horizontal"
      ? `The pool lies LEFT-TO-RIGHT, exactly as the guide is drawn — its long edges parallel to the bottom of the photo. Never diagonal. Never pointing toward the house. Do NOT change the photo's framing or aspect ratio — only the pool is horizontal, not the image.`
      : poolOrientation === "vertical"
      ? `The pool points STRAIGHT AWAY from the camera toward the background, exactly as the guide is drawn — short end nearest the camera. Never diagonal. Never lying left-to-right. Do NOT change the photo's framing or aspect ratio — only the pool is vertical, not the image.`
      : "";

  // ---- Zemin çevresi ----
  const surroundLines = ceramicColor
    ? `Paving: LARGE matte ${ceramicColorEn} porcelain slabs, each 33x66cm — big 2:1 rectangles laid long-side parallel to the pool. NOT mosaic, NOT small square tiles, NOT bathroom tiles. Two rows per side, about 1.2m total.
One color everywhere: the slab row touching the water is IDENTICAL to the others — no lighter, darker, or white border row. Water meets slab directly.
The paving is SUNK INTO the lawn: its surface level with the grass, no visible thickness or platform edge where it meets the lawn. Clean surface — no covers or fixtures.`
    : deckColor
    ? `Deck: ${deckColorEn} composite wood boards, 20cm wide, laid parallel to the pool, about 1.2m total per side.
The deck is SUNK INTO the lawn: its surface level with the grass, no visible thickness or platform edge where it meets the lawn. Boards reach the water directly — no white strip. Clean surface — no covers or fixtures.`
    : `No paving, no deck: the existing ground runs directly to the water's edge. Do not add any border.`;

  // ---- Ekipman ----
  const equipLines = [
    config.hasStairs
      ? `Exactly ONE stainless steel 3-step ladder, at the end away from the molded steps. Never two ladders.`
      : "",
    config.hasWaterfall
      ? `Exactly ONE small stainless cobra waterfall (about 35cm) on one long side, water pouring into the pool. Never two waterfalls.`
      : "",
  ]
    .filter(Boolean)
    .join("\n");

  return `
Edit Image 1 (the customer's garden photo): add ONE luxury fiberglass swimming pool, professionally installed. ${poolRefLabel} — the ${modelName}.${config.hasWaterfall ? ` Image ${waterfallImageNo} shows the waterfall style.` : ""} The result must look like a real photograph.

IN-GROUND — MOST IMPORTANT: the pool is dug INTO the earth. Water surface level with the lawn. No pool shell, wall, or lip visible above the ground. Never a pool sitting on top of the grass.

${shapeLine}
Size ${size} meters — keep the proportions. The pool stays clearly smaller than the house, with grass visible on all sides, never touching the photo edges.

${orientationLine ? `PLACEMENT:\n${guideLines}\n${orientationLine}\n` : ""}
${surroundLines}

${equipLines ? `${equipLines}\n` : ""}
Keep everything else in the photo unchanged: buildings, trees, fences, framing, camera angle, lighting. Photorealistic only — never a render or illustration.
  `.trim();
}