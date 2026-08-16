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

export function buildPoolPrompt(
  config: PoolConfig,
  clientConfig: ClientConfig
): string {
  const { model, size, ceramic, deck } = config;

  const poolModel = clientConfig.pool_models.find((m) => m.id === model);
  const modelName = poolModel?.name || model;
  const deckColor = deck ? clientConfig.deck_colors.find((d) => d.id === deck) : null;
  const ceramicColor = ceramic ? clientConfig.ceramic_colors.find((c) => c.id === ceramic) : null;

  const modelUpper = model.toUpperCase();
  const isRoma = modelUpper === "ROMA";
  const isRelax = modelUpper === "RELAX";
  const hasSurround = Boolean(ceramicColor || deckColor);

  const COLOR_EN: Record<string, string> = {
    mavi: "blue", beyaz: "white", gri: "gray", "açık gri": "light gray",
    "koyu gri": "dark gray", antrasit: "anthracite gray", bej: "beige",
    krem: "cream", kahverengi: "brown", "açık kahve": "light brown",
    siyah: "black", yeşil: "green", turkuaz: "turquoise", kum: "sand",
  };
  const toEnColor = (name: string) => COLOR_EN[name.trim().toLowerCase()] ?? name;
  const ceramicColorEn = ceramicColor ? toEnColor(ceramicColor.name) : "";
  const deckColorEn = deckColor ? toEnColor(deckColor.name) : "";

  const hasRef2 = Boolean(poolModel?.reference_image_url_2);
  const poolRefLabel = hasRef2
    ? "Image 2 shows the pool model from two angles side by side (full view + close-up of the steps)"
    : "Image 2 shows the pool model";
  const waterfallImageNo = 3;

  const shapeLine = isRoma
    ? `Pool shape: copy the reference pool's silhouette EXACTLY — a soft freeform oval, both ends rounded. This is explicitly NOT a symmetric ellipse or stadium shape. Measure it like this: take the long side closer to the steps — at roughly one-third of the way along its length, the edge bulges outward by an amount equal to about 15-20% of the pool's total width, then curves back in. This bulge is a single asymmetric lobe, NOT a wave repeated on both sides, and it is OFF-CENTER, not in the middle of the long side. The opposite long side stays a plain smooth curve with no bulge. Check your own output before finishing: if you could draw a mirror line through the pool's center and both long sides look the same, you have drawn a symmetric oval and MUST redraw it — the two long sides must look different from each other. The rounded end profiles must match the reference's ends exactly, not a generic rounded rectangle. Copy the molded interior too: wide steps at the rounded end, bench along one side, visible under the water, in the same position as the reference.`
    : isRelax
    ? `Pool shape: copy the reference pool's silhouette EXACTLY — a clean rectangle with sharp, square corners (never rounded, never a curved notch cut into any corner — the OUTER silhouette has four straight right-angle corners). The built-in corner staircase lives INSIDE this rectangle, underwater — it is not a bite taken out of the pool's outer edge. It must render as a set of distinct flat rectangular tiers stacked like a real staircase: each tier a flat horizontal rectangle with a vertical front face, tiers getting smaller as they rise toward the corner, sharp right-angle edges throughout. This must NOT look like a single smooth curved or quarter-circle cutout, a ramp, or a rounded corner — if the steps read as one continuous curve rather than 3-4 distinct flat rectangular tiers, it is WRONG. Corner steps stay in the same corner as the reference, fully visible and readable under the water, while the pool's outer rectangular outline stays perfectly straight and square right past them.`
    : `Pool shape: copy the reference pool EXACTLY — a clean rectangle. Copy its molded interior too: the built-in steps in the SAME position as the reference (corner steps stay in the same corner), visible under the water.`;

  const guideLines = hasSurround
    ? `Image 1 has a SOLID magenta rectangle: a placeholder block marking the water area at this photo's exact real-world scale — its size is a precise measurement, not a rough suggestion. The pool must fill this block edge-to-edge and never extend past it in any direction. A THIN magenta outline further out marks the outer edge of the paving. A dashed magenta line marks the pool's long axis.
Paving fills ONLY the ring between the solid block and the thin outline; its outer edge is straight and rectangular, grass starts right at the thin outline.
REPLACE THE ENTIRE SOLID MAGENTA BLOCK with the pool and REPLACE the thin outline/dashed line areas with paving/grass. Nothing pink, magenta, or purple may remain anywhere in the final image.`
    : `Image 1 has a SOLID magenta rectangle: a placeholder block marking the pool's exact footprint at this photo's real-world scale — its size is a precise measurement, not a suggestion. A dashed magenta line marks the pool's long axis.
Build the pool exactly inside this block, filling it edge-to-edge, same direction as drawn.
REPLACE THE ENTIRE SOLID MAGENTA BLOCK with the pool. Nothing pink, magenta, or purple may remain anywhere in the final image.`;

  const surroundLines = ceramicColor
    ? `Paving: LARGE matte ${ceramicColorEn} porcelain slabs, each 33x66cm exactly — big 2:1 rectangles laid long-side parallel to the pool. NOT mosaic, NOT small square tiles, NOT bathroom tiles.
Two rows per side, MAXIMUM 1.2m total width measured from the pool's edge outward — this is a hard ceiling, never wider.
One color everywhere: the slab row touching the water is IDENTICAL to the others — no lighter, darker, or white border row. Water meets slab directly.
The paving is SUNK INTO the lawn: its surface level with the grass, no visible thickness or platform edge where it meets the lawn. Clean surface — no covers or fixtures.`
    : deckColor
    ? `Deck: ${deckColorEn} composite wood boards, 20cm wide, laid parallel to the pool, MAXIMUM 1.2m total width measured from the pool's edge outward per side — this is a hard ceiling, never wider.
The deck is SUNK INTO the lawn: its surface level with the grass, no visible thickness or platform edge where it meets the lawn. Boards reach the water directly — no white strip. Clean surface — no covers or fixtures.`
    : `No paving, no deck: the existing ground runs directly to the water's edge. Do not add any border.`;

  const equipLines = [
    config.hasStairs
      ? `Exactly ONE stainless steel 3-step ladder, at the end away from the molded steps. Never two ladders.`
      : "",
    config.hasWaterfall
      ? `Exactly ONE small stainless cobra waterfall (about 35cm) on one long side, water pouring into the pool. Never two waterfalls.`
      : "",
  ].filter(Boolean).join("\n");

  return `
Edit Image 1 (the customer's garden photo): add ONE luxury fiberglass swimming pool, professionally installed. ${poolRefLabel} — the ${modelName}.${config.hasWaterfall ? ` Image ${waterfallImageNo} shows the waterfall style.` : ""} The result must look like a real photograph.

IN-GROUND — MOST IMPORTANT: the pool is dug INTO the earth. Water surface level with the lawn. No pool shell, wall, or lip visible above the ground. Never a pool sitting on top of the grass.

${shapeLine}
Size ${size} meters — keep the proportions. The pool stays clearly smaller than the house. Leave a generous, clearly visible strip of lawn on every side beyond the paving/deck.

PLACEMENT:
${guideLines}
Place the pool in the most natural and aesthetically fitting position in the garden. Choose the orientation (horizontal or vertical relative to the house) that looks most natural and realistic for this specific garden layout.

${surroundLines}

${equipLines ? `${equipLines}\n` : ""}
Keep everything else in the photo unchanged: buildings, trees, fences, framing, camera angle, lighting. Photorealistic only — never a render or illustration.
  `.trim();
}