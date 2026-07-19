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

  const modelUpper = model.toUpperCase();
  const isRoma = modelUpper === "ROMA";
  const isRelax = modelUpper === "RELAX";
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

  // ---- Şekil (model bazlı, referansa devredilmiş) ----
  // ROMA: serbest form oval + S-dalgası + yuvarlak uçların referansla AYNI
  // olması gereken köşe/uç profili (S4 — "köşelerde de aynı şekil olsun").
  // RELAX: köşe merdivenlerin referanstaki gibi BELİRGİN, dikdörtgen ve
  // net hatlı çıkması gerekiyor (S3 — düz/gömme küvet çıkmasın).
  // Diğer modeller: nötr dikdörtgen + basamak konumu kopyası.
  const shapeLine = isRoma
    ? `Pool shape: copy the reference pool's silhouette EXACTLY — a soft freeform oval, both ends rounded. This is explicitly NOT a symmetric ellipse or stadium shape: one long side has a pronounced outward bulge partway along its length, breaking the curve into a visible S-wave. If your output silhouette looks like a smooth symmetric oval, it is WRONG — exaggerate the bulge until it clearly departs from symmetry. The rounded end profiles (how tightly each end curves) must match the reference's ends exactly, not a generic rounded rectangle. Copy the molded interior too: wide steps at the rounded end, bench along one side, visible under the water, in the same position as the reference.`
    : isRelax
    ? `Pool shape: copy the reference pool's silhouette EXACTLY — a clean rectangle with sharp, square corners (never rounded). The built-in corner staircase is a DEFINING feature of this model and must be clearly visible and unmistakably rectangular/stepped — sharp right-angle step edges, each step's front face flat and vertical, exactly like the reference photo. Do not smooth, round, or simplify the steps into a curved or blended shape, and do not let them disappear into a flat pool floor. Corner steps stay in the same corner as the reference, fully visible and readable under the water.`
    : `Pool shape: copy the reference pool EXACTLY — a clean rectangle. Copy its molded interior too: the built-in steps in the SAME position as the reference (corner steps stay in the same corner), visible under the water.`;

  // ---- Kılavuz + yön ----
  // S1: kılavuz fal.ts'te OPAK dolgu ile çiziliyor (yarı saydam değil).
  // S2/S5: kutunun boyutu gerçek havuz ölçüsüne kilitli (fal.ts, parsePoolAspect).
  const guideLines = hasSurround
    ? `Image 1 has a SOLID magenta rectangle: a placeholder block marking the water area at this photo's exact real-world scale — its size is a precise measurement, not a rough suggestion. The pool must fill this block edge-to-edge and never extend past it in any direction. A THIN magenta outline further out marks the outer edge of the paving. A dashed magenta line marks the pool's long axis.
Paving fills ONLY the ring between the solid block and the thin outline; its outer edge is straight and rectangular, grass starts right at the thin outline.
REPLACE THE ENTIRE SOLID MAGENTA BLOCK with the pool and REPLACE the thin outline/dashed line areas with paving/grass. Nothing pink, magenta, or purple may remain anywhere in the final image.`
    : `Image 1 has a SOLID magenta rectangle: a placeholder block marking the pool's exact footprint at this photo's real-world scale — its size is a precise measurement, not a suggestion. A dashed magenta line marks the pool's long axis.
Build the pool exactly inside this block, filling it edge-to-edge, same direction as drawn.
REPLACE THE ENTIRE SOLID MAGENTA BLOCK with the pool. Nothing pink, magenta, or purple may remain anywhere in the final image.`;

  // Yön: MÜŞTERİ SEÇİMİ MUTLAKTIR — bahçenin gerçek açısı, çit/yol hattı,
  // perspektif ya da "doğal" görünen yerleşim asla dikkate alınmaz. Yön,
  // sahnenin gerçek dünya geometrisine değil, SADECE fotoğraf kadrajına
  // (alt kenar / kamera ekseni) göre tanımlanır ve kılavuz zaten bu şekilde
  // çizilmiştir — model kılavuzu birebir izler, bahçeye göre "düzeltmeye"
  // çalışmaz.
  const orientationLine =
    poolOrientation === "horizontal"
      ? `ORIENTATION IS MANDATORY AND NON-NEGOTIABLE: the pool lies LEFT-TO-RIGHT relative to the photo frame — its long edges parallel to the bottom edge of the photo, exactly as the magenta guide is drawn. This is defined ONLY by the photo's frame, never by the garden's real shape, fence lines, path direction, slope, or perspective — ignore all of those completely and follow the guide box exactly as drawn, even if the garden "looks like" it should be angled differently. Never diagonal. Never pointing toward the house. Do NOT change the photo's framing or aspect ratio — only the pool is horizontal, not the image.`
      : poolOrientation === "vertical"
      ? `ORIENTATION IS MANDATORY AND NON-NEGOTIABLE: the pool points STRAIGHT AWAY from the camera toward the background relative to the photo frame — short end nearest the camera, exactly as the magenta guide is drawn. This is defined ONLY by the photo's frame, never by the garden's real shape, fence lines, path direction, slope, or perspective — ignore all of those completely and follow the guide box exactly as drawn, even if the garden "looks like" it should be angled differently. Never diagonal. Never lying left-to-right. Do NOT change the photo's framing or aspect ratio — only the pool is vertical, not the image.`
      : "";

  // ---- Zemin çevresi ----
  // S5: "about 1.2m" → SERT ÜST SINIR. Kullanıcı isteği: havuz kenarındaki
  // seramik/deck mesafesi 1,2 metreyi ASLA geçmeyecek.
  const surroundLines = ceramicColor
    ? `Paving: LARGE matte ${ceramicColorEn} porcelain slabs, each 33x66cm exactly — big 2:1 rectangles laid long-side parallel to the pool. NOT mosaic, NOT small square tiles, NOT bathroom tiles.
Two rows per side, MAXIMUM 1.2m total width measured from the pool's edge outward — this is a hard ceiling, never wider, even if the guide area looks like it allows more; if in doubt, keep it narrower rather than exceed 1.2m.
One color everywhere: the slab row touching the water is IDENTICAL to the others — no lighter, darker, or white border row. Water meets slab directly.
The paving is SUNK INTO the lawn: its surface level with the grass, no visible thickness or platform edge where it meets the lawn. Clean surface — no covers or fixtures.`
    : deckColor
    ? `Deck: ${deckColorEn} composite wood boards, 20cm wide, laid parallel to the pool, MAXIMUM 1.2m total width measured from the pool's edge outward per side — this is a hard ceiling, never wider.
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