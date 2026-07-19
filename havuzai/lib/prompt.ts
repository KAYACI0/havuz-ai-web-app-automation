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
  const shapeLine = isRoma
    ? `Pool shape: copy the reference pool EXACTLY — a soft freeform oval, both ends rounded, one long side gently wavy. No sharp corners. Copy its molded interior too: wide steps at the rounded end, bench along one side, visible under the water.`
    : `Pool shape: copy the reference pool EXACTLY — a clean rectangle. Copy its molded interior too: the built-in steps in the SAME position as the reference (corner steps stay in the same corner), visible under the water.`;

  // ---- Kılavuz + yön ----
  const guideLines = hasSurround
    ? `Image 1 has magenta construction marks: THICK rectangle = the water area. THIN outer rectangle = outer edge of the paving. Dashed line = the pool's long axis.
Water goes exactly inside the thick rectangle. Paving fills ONLY the ring between the two rectangles. The paving's outer edge is straight and rectangular; grass starts right at the thin line.
PAINT OVER ALL MAGENTA COMPLETELY. Zero magenta in the final image.`
    : `Image 1 has magenta construction marks: the rectangle = the pool's exact footprint, the dashed line = the pool's long axis.
Build the pool exactly inside the rectangle, same direction as drawn.
PAINT OVER ALL MAGENTA COMPLETELY. Zero magenta in the final image.`;

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