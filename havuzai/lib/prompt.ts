import type { ClientConfig } from "./config-types";

export interface PoolConfig {
  model:        string;
  size:         string;
  deck:         string;
  ceramic:      string;
  hasWaterfall: boolean;
  hasStairs:    boolean;
  stairType:    "corner" | "wide";
}

export function buildPoolPrompt(config: PoolConfig, clientConfig: ClientConfig): string {
  const { model, size, ceramic, deck } = config;

  const poolModel    = clientConfig.pool_models.find((m) => m.id === model);
  const modelName    = poolModel?.name || model;
  const deckColor    = deck    ? clientConfig.deck_colors.find((d)    => d.id === deck)    : null;
  const ceramicColor = ceramic ? clientConfig.ceramic_colors.find((c) => c.id === ceramic) : null;

  const isRoma = model.toUpperCase() === "ROMA";
  const hasSurround = Boolean(ceramicColor || deckColor);

  // Türkçe renk adlarını İngilizceye çevir — model Türkçe rengi tanımıyor
  // ("Mavi tiles" → kırmızı tuğla vakası yaşandı).
  const COLOR_EN: Record<string, string> = {
    mavi: "blue", beyaz: "white", gri: "gray", "açık gri": "light gray",
    "koyu gri": "dark gray", antrasit: "anthracite gray", bej: "beige",
    krem: "cream", kahverengi: "brown", "açık kahve": "light brown",
    siyah: "black", yeşil: "green", turkuaz: "turquoise", kum: "sand",
    kırmızı: "brick red", bordo: "burgundy",
  };
  const toEnColor = (name: string) =>
    COLOR_EN[name.trim().toLowerCase()] ?? name;
  const ceramicColorEn = ceramicColor ? toEnColor(ceramicColor.name) : "";
  const deckColorEn    = deckColor    ? toEnColor(deckColor.name)    : "";

  // fal.ts iki havuz referansını tek yan-yana board'da birleştirir:
  // havuz her zaman Image 2. Seçilen rengin referans görseli varsa Image 3,
  // şelale ondan sonraki numara olur.
  const hasRef2 = Boolean(poolModel?.reference_image_url_2);
  const poolRefLabel = hasRef2
    ? "Image 2 shows the pool model from two angles side by side"
    : "Image 2 shows the pool model";
  const hasMaterialRef = Boolean(
    (ceramicColor as { reference_image_url?: string } | null)?.reference_image_url ||
    (deckColor as { reference_image_url?: string } | null)?.reference_image_url
  );
  const waterfallImageNo = hasMaterialRef ? 4 : 3;
  const materialLabel = hasMaterialRef
    ? ceramicColor
      ? `Image 3 shows the EXACT ${toEnColor(ceramicColor.name)} paving material — match its color, texture, and slab look precisely.`
      : `Image 3 shows the EXACT ${deckColor ? toEnColor(deckColor.name) : ""} deck material — match its color, texture, and board look precisely.`
    : "";

  // ---- Şekil: referansa devredilmiş, gerçek ürüne uygun tek netleştirme ----
  // DİKKAT: Roma "teardrop" DEĞİLDİR — gerçek referans fotoğrafıyla doğrulandı.
  const shapeLine = isRoma
    ? `Pool shape: copy the reference pool EXACTLY — the Roma is a soft freeform oval: both ends fully rounded, sides gently curving, one long side flowing with a subtle wave. No sharp corners, no rigid straight edges. Copy its molded interior too: wide steps at the rounded end and a bench ledge along one side, visible under the water.`
    : `Pool shape: copy the reference pool EXACTLY — a clean rectangle with straight sides. Copy its molded interior too: the built-in steps in the SAME position as the reference (corner steps stay in the same corner), visible under the water with soft light and shadow on each step edge.`;

  // ---- Magenta kılavuz (fal.ts HER üretimde çizer) ----
  const guideLines = hasSurround
    ? `Image 1 has magenta construction marks placed at the BEST spot of the garden: a SOLID magenta rectangle completely covering the pool's exact footprint, a THIN outer rectangle marking the outer edge of the paving, and a dashed line showing the pool's long axis.
Build the water exactly over the solid rectangle, the pool's long axis aligned with the dashed line. Paving fills ONLY the ring between the two rectangles — the paving's outer edge is straight and rectangular, and the lawn starts right at the thin line. Nothing is built outside the thin line.
PAINT OVER ALL MAGENTA COMPLETELY. Zero magenta pixels in the final image.`
    : `Image 1 has magenta construction marks placed at the BEST spot of the garden: a SOLID magenta rectangle completely covering the pool's exact footprint, and a dashed line showing the pool's long axis.
Build the pool exactly over the solid rectangle, its long axis aligned with the dashed line. The lawn continues right at the rectangle's edge — nothing else is built.
PAINT OVER ALL MAGENTA COMPLETELY. Zero magenta pixels in the final image.`;

  // ---- Zemin çevresi ----
  const surroundLines = ceramicColor
    ? `Paving: LARGE matte ${ceramicColorEn} porcelain slabs — long rectangles, each slab clearly TWICE as long as it is wide, laid long-side parallel to the pool in a RUNNING-BOND brick pattern with staggered joints (a pattern impossible with square tiles). NOT mosaic, NOT small square tiles, NOT bathroom tiles. Two slab rows per side, about 1.2m total — never wider.
One color everywhere: the slab row touching the water is IDENTICAL to the others — no lighter, darker, or white border row. Water meets slab directly. The pool interior is smooth fiberglass — no tile strip or mosaic band at the waterline inside the pool.
The paving is SUNK INTO the lawn: its surface level with the grass, no visible thickness or platform edge where it meets the lawn. Clean surface — no covers or fixtures.`
    : deckColor
    ? `Deck: ${deckColorEn} composite wood boards, 20cm wide, laid parallel to the pool, about 1.2m total per side — never wider.
The deck is SUNK INTO the lawn: its surface level with the grass, no visible thickness or platform edge where it meets the lawn. Boards reach the water directly — no white strip, and the board row at the water is identical to the others. Clean surface — no covers or fixtures.`
    : `No paving, no deck: the existing ground runs directly to the water's edge. Do not add any border, coping, or rim.`;

  // ---- Ekipman ----
  const equipLines = [
    config.hasStairs
      ? `Exactly ONE stainless steel 3-step ladder, at the end of the pool away from the molded steps. Never two ladders.`
      : "",
    config.hasWaterfall
      ? `Exactly ONE small stainless cobra waterfall (about 35cm) on one long side, water pouring into the pool. Never two waterfalls. Image ${waterfallImageNo} shows the waterfall style.`
      : "",
  ].filter(Boolean).join("\n");

  return `
Edit Image 1 (the customer's garden photo): add ONE luxury fiberglass swimming pool, professionally installed. ${poolRefLabel} — the ${modelName}.${materialLabel ? ` ${materialLabel}` : ""} The result must look like a real photograph.

IN-GROUND — MOST IMPORTANT: the pool is dug INTO the earth. Water surface level with the lawn. No pool shell, wall, or lip visible above the ground. Never a pool sitting on top of the grass.

${shapeLine}
Size ${size} meters — keep the proportions.

PLACEMENT:
${guideLines}
GRASS IS VISIBLE ON ALL FOUR SIDES of the pool and its paving: between them and every edge of the photo there is always open lawn — the pool and the paving never touch or run past the left, right, top, or bottom edge of the image. The pool stays clearly smaller than the house.

${surroundLines}

${equipLines ? `${equipLines}\n` : ""}
Keep everything else in the photo unchanged: buildings, trees, fences, framing, aspect ratio, camera angle, lighting. Photorealistic only — never a render or illustration.
  `.trim();
}