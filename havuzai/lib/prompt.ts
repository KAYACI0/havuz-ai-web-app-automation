import type { ClientConfig } from "./config-types";

export interface PoolConfig {
  model: string;
  size: string;
  deck: string;
  ceramic: string;
  hasWaterfall: boolean;
  hasStairs: boolean;
  stairType: "corner" | "wide";
}

export function buildPoolPrompt(
  config: PoolConfig,
  clientConfig: ClientConfig
): string {
  const { model, size, ceramic, deck } = config;

  const poolModel = clientConfig.pool_models.find((m) => m.id === model);
  const modelName = poolModel?.name || model;
  const deckColor = deck ? clientConfig.deck_colors.find((d) => d.id === deck) : null;
  const ceramicColor = ceramic
    ? clientConfig.ceramic_colors.find((c) => c.id === ceramic)
    : null;

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

  // ---- Referans görsel envanteri — fal.ts'in image_urls dizisine EKLEDİĞİ
  // SIRAYLA birebir aynı olmalı. Numaralar burada hesaplandıktan sonra fal.ts
  // tarafında aynı sırayla eklenmezse model yanlış görsele yönlendirilir. ----
  const hasRef2 = Boolean(poolModel?.reference_image_url_2);
  const materialRefUrl = ceramicColor?.reference_image_url || deckColor?.reference_image_url || null;
  const hasMaterialRef = Boolean(materialRefUrl);
  const stairRefUrl = clientConfig.features?.stair_reference_url;
  const hasStairRef = Boolean(config.hasStairs && stairRefUrl);

  // Image 1 = bahçe, Image 2 = havuz referansı (her zaman var). Sonrası opsiyonel,
  // fal.ts'teki push sırasıyla AYNI OLMALI: malzeme -> şelale -> merdiven.
  let nextImg = 3;
  const materialImgNo = hasMaterialRef ? nextImg++ : null;
  const waterfallImgNo = config.hasWaterfall ? nextImg++ : null;
  const stairImgNo = hasStairRef ? nextImg++ : null;

  const referenceGuideLines = [
    `Image 1: the customer's garden photo — THIS IS THE IMAGE TO EDIT. It has a SOLID magenta rectangle marking the pool's exact footprint at real-world scale, and (if a surround is selected) a thin magenta outline marking the paving's outer edge, plus a dashed magenta line marking the pool's long axis.`,
    hasRef2
      ? `Image 2: split into two panels side by side — LEFT panel is the full ${modelName} pool, RIGHT panel is a close-up of the steps/interior. The right panel is the authoritative source for the true step shape, count, and position — it is not decorative.`
      : `Image 2: the ${modelName} pool model — use this exact shape and interior.`,
    materialImgNo
      ? `Image ${materialImgNo}: close-up of the exact ${ceramicColor ? "tile" : "deck"} material — match this color, texture, and finish precisely, more than the color name alone.`
      : "",
    waterfallImgNo
      ? `Image ${waterfallImgNo}: the waterfall style — copy its exact shape and finish.`
      : "",
    stairImgNo
      ? `Image ${stairImgNo}: the ladder/stair style — copy this exact ladder design instead of inventing a generic one.`
      : "",
  ].filter(Boolean).join("\n");

  // ---- Şekil (model bazlı, referansa devredilmiş) ----
  const shapeLine = isRoma
    ? `Pool shape: copy the reference pool's silhouette EXACTLY — a soft freeform oval, both ends rounded. NOT a symmetric ellipse or stadium shape. One long side has a single asymmetric outward bulge, off-center (roughly one-third of the way along its length), about 15-20% of the pool's total width. The opposite long side stays a plain smooth curve with no bulge. Both long sides must look DIFFERENT from each other — if you could fold the pool in half along its center and both sides matched, that is WRONG; redraw it lopsided. Copy the molded interior too: wide steps at the rounded end, bench along one side, visible under the water, in the same position as the reference.`
    : isRelax
    ? `Pool shape: copy the reference pool's silhouette EXACTLY — a clean rectangle with sharp, square corners (never rounded). The built-in corner staircase lives INSIDE this rectangle, underwater — it is not a bite taken out of the outer edge. It must render as distinct flat rectangular tiers (3-4 tiers) stacked like real stairs — each tier a flat horizontal tread with a vertical riser, sharp right-angle edges throughout, getting smaller as they rise toward the corner. This must NOT look like a single smooth curved cutout, a ramp, or a plain straight ladder standing in for it — if the steps read as one continuous curve instead of 3-4 distinct flat tiers, it is WRONG. The pool's outer rectangular outline stays perfectly straight and square right past the steps.`
    : `Pool shape: copy the reference pool EXACTLY — a clean rectangle. Copy its molded interior including the built-in steps in the SAME position as the reference, visible under the water.`;

  // ---- Yerleşim / kılavuz ----
  const guideLines = hasSurround
    ? `The pool must fill the solid magenta block edge-to-edge and never extend past it. Paving fills ONLY the ring between the solid block and the thin outline; grass starts right at the thin outline. REPLACE the entire solid magenta block with the pool, and REPLACE the thin outline/dashed line areas with paving. Nothing pink, magenta, or purple may remain anywhere in the final image.`
    : `Build the pool exactly inside the solid magenta block, filling it edge-to-edge, same direction as drawn. REPLACE the entire solid magenta block with the pool. Nothing pink, magenta, or purple may remain anywhere in the final image.`;

  // ---- Zemin çevresi ----
  const surroundLines = ceramicColor
    ? `Paving: LARGE matte ${ceramicColorEn} porcelain slabs, each 33x66cm exactly — 2:1 rectangles laid long-side parallel to the pool. NOT mosaic, NOT small square tiles.
Two rows per side, MAXIMUM 1.2m total width from the pool's edge outward — hard ceiling, never wider, even if the guide area looks like it allows more.
One color everywhere — the row touching the water is IDENTICAL to the others, no lighter/darker/white border row. Water meets slab directly.
GROUND LEVEL — check this carefully: the slabs are flush with the surrounding lawn, at the SAME height, like a mat laid on top of the ground. There is NO raised platform, NO visible side wall, edge, lip, or step-down/step-up of any kind where the grass meets the paving — a ball rolling across the grass would roll straight onto the slabs without a bump. There must be NO gap, shadow strip, or sliver of daylight visible between the paving and the lawn anywhere along its edge. If your output shows a visible edge, curb, or the paving looking like a deck/platform sitting above the lawn, it is WRONG.`
    : deckColor
    ? `Deck: ${deckColorEn} composite wood boards, 20cm wide, laid parallel to the pool. MAXIMUM 1.2m total width from the pool's edge outward per side — hard ceiling, never wider.
GROUND LEVEL — check this carefully: the deck boards are flush with the surrounding lawn, at the SAME height, like a mat laid on top of the ground. There is NO raised platform, NO visible side wall, edge, lip, or step-down/step-up of any kind where the grass meets the deck. Do NOT add a trim board, facia, box frame, or any vertical side panel around the deck's perimeter — real decking usually has this, but here it must be absent: picture the boards as thin flat tiles laid directly on the soil, not a framed carpentry box. There must be NO gap, shadow strip, or sliver of daylight visible between the deck and the lawn anywhere along its edge. Boards reach water directly — no white strip. If your output shows a visible edge, curb, trim board, facia, or the deck looking like a raised platform, it is WRONG.`
    : `No paving, no deck: the existing ground runs directly to the water's edge. Do not add any border.`;

  // ---- Ekipman ----
  const equipLines = [
    config.hasStairs
      ? `Exactly ONE stainless steel 3-step ladder, at the end away from the molded steps. Never two ladders.${stairImgNo ? ` Match the ladder style shown in Image ${stairImgNo}.` : ""}`
      : "",
    config.hasWaterfall
      ? `Exactly ONE small stainless cobra waterfall (about 35cm) on one long side, water pouring into the pool. Never two waterfalls.`
      : "",
  ].filter(Boolean).join("\n");

  return `
Edit Image 1 (the customer's garden photo): add ONE luxury fiberglass swimming pool, professionally installed in-ground. The pool model is the ${modelName}.${config.hasWaterfall ? " A dedicated image shows the waterfall style." : ""} The result must look like a real photograph.

REFERENCE IMAGES:
${referenceGuideLines}

IN-GROUND — MOST IMPORTANT: the pool is dug INTO the earth. Water surface level with the lawn. No pool shell, wall, or lip visible above the ground. Never a pool sitting on top of the grass.

PERSPECTIVE — MOST IMPORTANT, CHECK BEFORE FINISHING: everything you add must follow the SAME camera perspective as the original photo — same viewpoint height, same vanishing point, same horizon line. The far edge of the pool/paving must appear smaller and higher in the frame than the near edge, exactly like the real grass and hedges do. Never draw the pool or paving as a flat, top-down, or face-on rectangle pasted onto the scene — it must recede into the photo's depth like a real object resting on the lawn. If the result looks like a flat image floating above the grass, disconnected from the ground and ignoring the photo's perspective lines, it is WRONG.

${shapeLine}
Size ${size} meters — keep the proportions. The pool stays clearly smaller than the house. Leave a generous, clearly visible strip of lawn on every side beyond the paving/deck — the finished pool area (water + paving) must never reach the photo's edges, and must never fill more than roughly two-thirds of the visible garden's width.

PLACEMENT:
${guideLines}

${surroundLines}

${equipLines ? `${equipLines}\n` : ""}
Keep everything else in the photo unchanged: buildings, trees, fences, framing, camera angle, lighting. Photorealistic only — never a render or illustration.

FORBIDDEN:
- Pool above ground or walls visible
- Wrong pool shape (must match Image 2, including its interior steps)
- Pool extending beyond garden boundaries
- Cartoon or render style
- Pool or paving floating above the lawn, with a visible gap or shadow strip underneath
- Flat, top-down, or face-on geometry that ignores the photo's own camera perspective
${ceramicColor ? "- White border between water and tiles\n- Tile area raised above grass, or any visible edge/curb where grass meets tiles" : ""}
${deckColor ? "- White coping between water and deck\n- Deck raised above grass like a platform, or any visible edge/curb where grass meets deck\n- Trim board, facia, or vertical side panel around the deck's perimeter" : ""}
${config.hasStairs ? "- More than one ladder" : ""}
${config.hasWaterfall ? "- More than one waterfall" : ""}
  `.trim();
}