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
    ? "Image 2 is split into two panels side by side: the LEFT panel shows the full pool, the RIGHT panel is a close-up of the steps/interior — treat the right panel as the authoritative source for the exact step shape and count, it is not decorative"
    : "Image 2 shows the pool model";
  const waterfallImageNo = 3;

  const stepsRefLine = hasRef2
    ? " Look specifically at Image 2's right-hand close-up panel for the true step shape, count, and position — do not invent a generic ladder or a single curved ramp instead."
    : "";

  const shapeLine = isRoma
    ? `Pool shape: copy the reference pool's silhouette EXACTLY — a soft freeform oval, both ends rounded. NOT a symmetric ellipse or stadium shape. One long side has a single asymmetric outward bulge (off-center, about 15-20% of total width), the opposite long side is a plain smooth curve. Both long sides must look DIFFERENT from each other — if you could fold the pool in half and both sides match, it is WRONG, redraw it lopsided. Copy the molded interior too: wide steps at the rounded end, bench along one side, visible under the water, in the same position as the reference.${stepsRefLine}`
    : isRelax
    ? `Pool shape: copy the reference pool's silhouette EXACTLY — a clean rectangle with sharp square corners. The built-in corner staircase lives INSIDE this rectangle (not a bite out of the outer edge). Steps must render as distinct flat rectangular tiers (3-4 tiers) stacked like stairs, each with a flat tread and a vertical riser, NOT a smooth curved cutout, ramp, or a single straight ladder standing in for them. Outer silhouette stays perfectly straight and square.${stepsRefLine}`
    : `Pool shape: copy the reference pool EXACTLY — a clean rectangle. Copy its molded interior including built-in steps in the SAME position as the reference.${stepsRefLine}`;

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
GROUND LEVEL — check this carefully: the slabs are flush with the surrounding lawn, at the SAME height, like a mat laid on top of the ground. There is NO raised platform, NO visible side wall, edge, lip, or step-down/step-up of any kind where the grass meets the paving — a ball rolling across the grass would roll straight onto the slabs without a bump. There must be NO gap, shadow strip, or sliver of daylight visible between the paving and the lawn anywhere along its edge — the paving physically touches and rests on the ground, it never floats above it. If your output shows a visible edge, curb, floating slab, or the paving looking like a deck or platform sitting above the lawn, it is WRONG.`
    : deckColor
    ? `Deck: ${deckColorEn} composite wood boards, 20cm wide, laid parallel to the pool. MAXIMUM 1.2m total width from pool edge outward per side — hard ceiling, never wider.
GROUND LEVEL — check this carefully: the deck boards are flush with the surrounding lawn, at the SAME height, like a mat laid on top of the ground. There is NO raised platform, NO visible side wall, edge, lip, or step-down/step-up of any kind where the grass meets the deck — a ball rolling across the grass would roll straight onto the boards without a bump. Do NOT add a trim board, facia, box frame, or any vertical side panel around the deck's perimeter — real decking always has this, but here it must be absent: picture the boards as thin flat paving tiles laid directly on the soil, not a framed carpentry box built up from the ground. Looking at the deck from the side, its outer edge should read as a thin flat line, not a visible vertical face with height. There must be NO gap, shadow strip, or sliver of daylight visible between the deck and the lawn anywhere along its edge — the deck physically touches and rests on the ground, it never floats above it. Boards reach water directly — no white strip. If your output shows a visible edge, curb, trim board, facia, floating deck, or the deck looking like a raised platform or box sitting above the lawn, it is WRONG.`
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

PERSPECTIVE — MOST IMPORTANT, CHECK BEFORE FINISHING: everything you add must be drawn in the SAME camera perspective as the original photo — same viewpoint height, same vanishing point, same horizon line. If the photo was taken from standing height looking slightly down and away, the far edge of the pool/paving must appear smaller and higher in the frame than the near edge, exactly like the real grass and hedges do. Never draw the pool or paving as a flat, top-down, or face-on rectangle pasted onto the scene — it must recede into the photo's depth like a real object resting on that lawn. If the result looks like a flat image floating above the grass, disconnected from the ground and not following the photo's perspective lines, it is WRONG.

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
- Pool or paving floating above the lawn, with a visible gap or shadow strip underneath
- Flat, top-down, or face-on geometry that ignores the photo's own camera perspective
${ceramicColor ? "- White border between water and tiles\n- Tile area raised above grass, or any visible edge/curb where grass meets tiles" : ""}
${deckColor ? "- White coping between water and deck\n- Deck raised above grass like a platform, or any visible edge/curb where grass meets deck\n- Trim board, facia, or vertical side panel around the deck's perimeter (deck must look flush like flat paving, not a framed box)" : ""}
${config.hasStairs ? "- More than one ladder" : ""}
${config.hasWaterfall ? "- More than one waterfall" : ""}
  `.trim();
}