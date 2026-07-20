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
  const shapeDesc    = poolModel?.prompt_description || poolModel?.description || `${model} shaped fiberglass pool`;
  const deckColor    = deck    ? clientConfig.deck_colors.find((d) => d.id === deck)    : null;
  const ceramicColor = ceramic ? clientConfig.ceramic_colors.find((c) => c.id === ceramic) : null;

  const modelUpper = model.toUpperCase();
  const isRoma  = modelUpper === "ROMA";
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
  const deckColorEn    = deckColor    ? toEnColor(deckColor.name)    : "";

  const hasRef2 = Boolean(poolModel?.reference_image_url_2);
  const poolRefLabel = hasRef2
    ? "Image 2 shows the pool model from two angles side by side (full view + close-up of the steps)"
    : "Image 2 shows the pool model";
  const waterfallImageNo = 3;

  const shapeLine = isRoma
    ? `Pool shape: copy the reference pool's silhouette EXACTLY — a soft freeform oval, both ends rounded. NOT a symmetric ellipse or stadium shape. One long side has a single asymmetric outward bulge (off-center, about 15-20% of total width), the opposite long side is a plain smooth curve. Both long sides must look DIFFERENT from each other. Copy the molded interior too: wide steps at the rounded end, bench along one side, visible under the water.`
    : isRelax
    ? `Pool shape: copy the reference pool's silhouette EXACTLY — a clean rectangle with sharp square corners. The built-in corner staircase lives INSIDE this rectangle (not a bite out of the outer edge). Steps must render as distinct flat rectangular tiers (3-4 tiers), NOT a smooth curved cutout or ramp. Outer silhouette stays perfectly straight and square.`
    : `Pool shape: copy the reference pool EXACTLY — a clean rectangle. Copy its molded interior including built-in steps in the SAME position as the reference.`;

  const guideLines = hasSurround
    ? `Image 1 has a SOLID magenta rectangle marking the water area at exact real-world scale. A THIN magenta outline further out marks the outer edge of the paving. A dashed magenta line marks the pool's long axis.
The pool must fill the solid block edge-to-edge. Paving fills ONLY the ring between the solid block and the thin outline. Grass starts right at the thin outline.
REPLACE the entire solid magenta block with the pool. REPLACE the thin outline/dashed line areas with paving. Nothing pink, magenta, or purple may remain in the final image.`
    : `Image 1 has a SOLID magenta rectangle marking the pool's exact footprint at real-world scale. A dashed magenta line marks the pool's long axis.
Build the pool exactly inside this block, filling it edge-to-edge.
REPLACE the entire solid magenta block with the pool. Nothing pink, magenta, or purple may remain in the final image.`;

  const surroundLines = ceramicColor
    ? `Paving: LARGE matte ${ceramicColorEn} porcelain slabs, each 33x66cm exactly — 2:1 rectangles laid long-side parallel to the pool. NOT mosaic, NOT small square tiles.
Two rows per side, MAXIMUM 1.2m total width from pool edge outward — hard ceiling, never wider.
One color everywhere — the row touching the water is IDENTICAL to the others, no white border row. Water meets slab directly.
The paving is SUNK INTO the lawn: surface level with grass, no visible thickness or platform edge.`
    : deckColor
    ? `Deck: ${deckColorEn} composite wood boards, 20cm wide, laid parallel to the pool. MAXIMUM 1.2m total width from pool edge outward per side — hard ceiling, never wider.
The deck is SUNK INTO the lawn: surface level with grass, no visible thickness or platform edge. Boards reach water directly — no white strip.`
    : `No paving, no deck: existing ground runs directly to the water's edge. Do not add any border.`;

  const equipLines = [
    config.hasStairs
      ? `Exactly ONE stainless steel 3-step ladder at the end away from the molded steps. Never two ladders.`
      : "",
    config.hasWaterfall
      ? `Exactly ONE small stainless cobra waterfall (~35cm wide) on one long side, water pouring into the pool. Never two waterfalls.`
      : "",
  ].filter(Boolean).join("\n");

  return `
Edit Image 1 (customer's garden photo): add ONE luxury fiberglass swimming pool, professionally installed in-ground. ${poolRefLabel} — the ${modelName}.${config.hasWaterfall ? ` Image ${waterfallImageNo} shows the waterfall style.` : ""} Result must look like a real photograph.

IN-GROUND — MOST IMPORTANT: pool is dug INTO the earth. Water surface level with lawn. No pool shell, wall, or lip visible above ground. Never sitting on top of grass.

${shapeLine}
Size ${size} meters — keep proportions. Pool stays clearly smaller than the house. Leave visible grass on every side beyond the paving/deck.

PLACEMENT:
${guideLines}
Place the pool in the most natural and aesthetically fitting position in the garden.

${surroundLines}

${equipLines ? `${equipLines}\n` : ""}
Keep everything else in the photo unchanged: buildings, trees, fences, framing, camera angle, lighting. Photorealistic only — never a render or illustration.

FORBIDDEN:
- Pool above ground or walls visible
- Wrong pool shape (must match Image 2)
- Pool extending beyond garden boundaries
- Cartoon or render style
${ceramicColor ? "- White border between water and tiles\n- Tile area raised above grass" : ""}
${deckColor ? "- White coping between water and deck" : ""}
${config.hasStairs ? "- More than one ladder" : ""}
${config.hasWaterfall ? "- More than one waterfall" : ""}
  `.trim();
}