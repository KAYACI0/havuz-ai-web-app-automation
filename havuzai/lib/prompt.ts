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
  const shapeDesc =
    poolModel?.prompt_description ||
    poolModel?.description ||
    `${model} shaped fiberglass pool`;
  const deckColor = deck
    ? clientConfig.deck_colors.find((d) => d.id === deck)
    : null;
  const ceramicColor = ceramic
    ? clientConfig.ceramic_colors.find((c) => c.id === ceramic)
    : null;

  const isRoma = model.toUpperCase() === "ROMA";

  // ---- Shape (delegated to Image 2, one clarifying line for Roma) ----
  const shapeRule = isRoma
    ? `Copy the EXACT silhouette of the pool in Image 2. The Roma is an asymmetric teardrop: one wide rounded end, one narrower tapered end, gently curving sides. It is never a rectangle and never a rounded rectangle.`
    : `Copy the EXACT silhouette of the pool in Image 2: a clean rectangle with straight sides and square corners.`;

  // ---- Placement guide (drawn by fal.ts when an orientation is selected) ----
  const guideText = `Image 1 contains a temporary magenta rectangle with a dashed center line. That rectangle is the pool's exact footprint; the dashed line is the pool's long axis. Build the pool precisely inside it — same position, same size, same direction as drawn on the image. The magenta marking is construction tape: it must be fully replaced and never visible in the result.`;

  const orientationRule =
    poolOrientation === "horizontal"
      ? `${guideText}

The guide is drawn flat on the image: its long edges are parallel to the bottom edge of the photo. Keep the pool aligned with the guide exactly as drawn — do not re-angle it to follow lawns, fences, hedges, or the garden's perspective lines. The camera sees one LONG side of the pool; the short ends point left and right. If the garden is narrow, make the pool smaller rather than turning it.`
      : poolOrientation === "vertical"
      ? `${guideText}

The pool's long axis points straight away from the camera toward the background, like a lane leading into the garden. The camera sees one SHORT end of the pool as the nearest edge; the long sides recede toward the back with natural perspective. Do not angle the pool and do not lay it left-to-right.`
      : "";

  // ---- Surround ----
  const surroundRule = ceramicColor
    ? `Surround the pool on all four sides with a narrow walkway of ${ceramicColor.name} ceramic tiles, about 1.2m wide (two rows of 33x66cm rectangular tiles laid long-side parallel to the pool, thin grout lines). The walkway is set into the lawn like a real patio: its outer edge sits flush with the grass, and the inner row reaches the water and acts as the pool coping. Every tile is the same ${ceramicColor.name} color, including the row at the water — the water meets tile directly, with only a thin natural shadow at the waterline.`
    : deckColor
    ? `Surround the pool on all four sides with a narrow ${deckColor.name} composite wood deck, about 60cm wide (three 20cm boards laid parallel to the pool edge). The deck sits flush with the lawn and reaches the water directly, acting as the pool coping.`
    : `No surround: the existing ground continues right up to the water's edge. No tiles, no deck, no pavers, no added border of any kind.`;

  // ---- Equipment ----
  const ladderRule = config.hasStairs
    ? `Install exactly one 3-step polished stainless steel entry ladder on one short end of the pool, steps going down into the water. One ladder in the whole image — never two.`
    : "";
  const waterfallRule = config.hasWaterfall
    ? `Install exactly one small stainless steel cobra waterfall blade (about 35cm wide) on the middle of one long side, pouring a smooth sheet of water into the pool. One waterfall in the whole image — never two.`
    : "";

  return `
You are a professional architectural visualization AI. Edit Image 1 (the customer's garden photo) so it looks like a real photograph taken after a luxury fiberglass pool was professionally installed. Image 2 shows the ${modelName} pool model whose shape must be copied exactly.${config.hasWaterfall ? " Image 3 shows the waterfall style." : ""}

PRIORITY 1 — BUILT INTO THE GROUND.
This is an in-ground pool, excavated into the earth. The water surface sits at the same level as the surrounding lawn, and the ground runs naturally up to the water's edge. The pool casts and receives the same shadows as everything else in the scene, so it reads as permanently part of the garden — as if it had always been there. Nothing of the pool's shell, walls, or lip rises above the surrounding ground; from outside, only water and the ground around it are visible. A pool sitting on top of the grass like a container is the single worst possible failure.

PRIORITY 2 — REAL PHOTO, SAME SCENE.
The result is the original photograph with one change: the pool. Keep every building, tree, hedge, fence, path, and object exactly as it is, and keep the photo's framing, aspect ratio, camera angle, lighting, and time of day. Place the pool only on open lawn. Photographic realism only — never a render, illustration, or 3D look.

PRIORITY 3 — SHAPE AND SIZE.
${shapeDesc}
${shapeRule}
The pool is ${size} meters — keep those proportions. Keep it modest in scale: roughly a fifth to a quarter of the visible open lawn, clearly smaller than the house, with open grass on every side, and never extending past any lawn edge, fence, or wall.

${orientationRule ? `PRIORITY 4 — PLACEMENT.\n${orientationRule}\n` : ""}
SURROUND.
${surroundRule}

${ladderRule || waterfallRule ? `EQUIPMENT.\n${[ladderRule, waterfallRule].filter(Boolean).join("\n")}\n` : ""}
FINAL CHECK — the image is wrong if any of these appear:
- the pool or its shell raised above the ground in any way
- a shape different from Image 2${isRoma ? " (any rounded rectangle is wrong for the Roma)" : ""}
- the pool angled diagonally or turned against the selected placement
- any magenta marking left in the image
- a wide band or rim of any color separating the water from its surround
- anything in the original photo changed besides adding the pool
  `.trim();
}