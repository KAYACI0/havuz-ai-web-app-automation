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

  // Config'teki renk adları Türkçe olabilir; İngilizce prompt içinde model
  // bunları renk olarak tanımayabiliyor (örn. "Mavi tiles" → kırmızı tuğla).
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

  // ---- Shape (delegated to Image 2, one clarifying line for Roma) ----
  const shapeRule = isRoma
    ? `Copy the EXACT silhouette of the pool in Image 2. The Roma is an asymmetric teardrop: one wide rounded end, one narrower tapered end, gently curving sides. It is never a rectangle and never a rounded rectangle.
Copy the pool's INTERIOR from Image 2 as well: the Roma has built-in molded fiberglass steps at its WIDE end — broad curved steps following the rounded shape, molded from the same material and color as the pool shell. The steps are clearly visible through the water, with light and gentle shadows defining each step edge underwater.`
    : `Copy the EXACT silhouette of the pool in Image 2: a clean rectangle with straight sides and square corners.
Copy the pool's INTERIOR from Image 2 as well: the model has built-in molded fiberglass entry steps at one short end — full-width steps molded from the same material and color as the pool shell, exactly as shown in Image 2. The steps are clearly visible through the water, with light and gentle shadows defining each step edge underwater.`;

  // ---- Placement guide (drawn by fal.ts when an orientation is selected) ----
  const hasSurround = Boolean(ceramicColor || deckColor);
  const guideText = hasSurround
    ? `Image 1 contains temporary magenta construction guides: a THICK rectangle marking the pool's water footprint, a THIN rectangle around it marking the OUTER edge of the walkway, and a dashed center line showing the pool's long axis. Build the water exactly inside the thick rectangle. Fill the ring between the two rectangles with the walkway — and ONLY that ring: the lawn begins immediately at the thin outer line, and nothing is paved beyond it. All magenta markings are construction tape: fully replaced, never visible in the result.`
    : `Image 1 contains a temporary magenta rectangle with a dashed center line. That rectangle is the pool's exact footprint; the dashed line is the pool's long axis. Build the pool precisely inside it — same position, same size, same direction as drawn on the image. The magenta marking is construction tape: it must be fully replaced and never visible in the result.`;

  const orientationRule =
    poolOrientation === "horizontal"
      ? `${guideText}

The guide is drawn flat on the image: its long edges are parallel to the bottom edge of the photo. Keep the pool aligned with the guide exactly as drawn — do not re-angle it to follow lawns, fences, hedges, or the garden's perspective lines. The camera sees one LONG side of the pool; the short ends point left and right.

PRECISION: the pool's two long edges stay parallel to the photo's bottom edge, and the left and right ends of the pool sit at the same height in the frame — a level, ruler-straight placement, within a couple of degrees at most. If the garden is narrow, make the pool smaller rather than turning it.`
      : poolOrientation === "vertical"
      ? `${guideText}

The pool's long axis points straight away from the camera toward the background, like a lane leading into the garden. The camera sees one SHORT end of the pool as the nearest edge; the long sides recede toward the back with natural perspective.

PRECISION: the pool's long axis lines up with the guide's dashed line exactly as drawn — aimed straight at the background, not leaning left or right, not angled toward any corner. The near short end and the far short end sit vertically stacked in the frame, the far end directly behind the near end. Do not lay the pool left-to-right.`
      : "";

  // ---- Surround ----
  const surroundRule = ceramicColor
    ? `Surround the pool on all four sides with a NARROW walkway of LARGE-FORMAT ${ceramicColorEn} porcelain paving slabs — outdoor terrace paving with a matte finish. The walkway is a thin frame, not a patio: exactly TWO slab rows per side, about 1.2m total — if the walkway looks wider than 1.2m, it is wrong. Each slab is BIG and RECTANGULAR, 33cm x 66cm — twice as long as it is wide, laid with the long side parallel to the pool edge, thin grout joints forming a clean brick pattern of large rectangles. This is NOT pool mosaic: no small square tiles, no glossy bathroom tiles — only large matte ${ceramicColorEn} paving slabs. The walkway is ONE CONTINUOUS SURFACE in ONE COLOR: the slab row touching the water is identical in color, size, and material to every other row — it is not lighter, not whiter, not a separate ring. The innermost slabs run straight to the water and ARE the pool coping; the transition is water, a thin natural waterline shadow, then ${ceramicColorEn} slab. The walkway sits flush with the lawn like a real sunken patio, and its surface is clean and uninterrupted — no drain covers, lids, plates, lights, or any fixtures.`
    : deckColor
    ? `Surround the pool on all four sides with a ${deckColorEn} composite wood deck walkway, about 1.2m wide — six 20cm boards per side, laid parallel to the pool edge, wide enough to comfortably walk on. The deck is SET INTO the lawn like a real sunken terrace: its surface sits at exactly the same level as the grass, the outer boards meet the lawn flush with grass blades touching the wood, and there is no visible board thickness, no raised platform edge, no step, no side face, and no shadow gap anywhere around it. The inner boards reach the water directly and act as the pool coping — no white strip or border between water and boards, and the board row at the water is identical to all the others. The deck surface is clean and uninterrupted — no covers, plates, or fixtures on the boards.`
    : `No surround: the existing ground continues right up to the water's edge. No tiles, no deck, no pavers, no added border of any kind.`;

  // ---- Equipment ----
  const ladderRule = config.hasStairs
    ? `Install exactly one 3-step polished stainless steel entry ladder on the short end OPPOSITE the pool's built-in steps — the ladder and the molded steps are at different ends of the pool, never at the same end, never overlapping. Steps of the ladder go down into the water. One ladder in the whole image — never two.`
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
The pool is ${size} meters — keep those proportions. Keep it modest in scale: roughly a fifth to a quarter of the visible open lawn, clearly smaller than the house, with open grass on every side, and never extending past any lawn edge, fence, or wall. The pool and its walkway also keep a clear distance from every edge of the photo itself — visible lawn remains between the camera and the near side of the pool, and the pool never touches or crowds the image borders.

${orientationRule ? `PRIORITY 4 — PLACEMENT.\n${orientationRule}\n` : ""}
SURROUND.
${surroundRule}

${ladderRule || waterfallRule ? `EQUIPMENT.\n${[ladderRule, waterfallRule].filter(Boolean).join("\n")}\n` : ""}
FINAL CHECK — the image is wrong if any of these appear:
- the pool or its shell raised above the ground in any way
- a shape different from Image 2${isRoma ? " (any rounded rectangle is wrong for the Roma)" : ""}, or an empty basin without the built-in steps
- the pool angled diagonally or turned against the selected placement
- any magenta marking left in the image
- a band, frame, or rim of any color between the water and its surround${hasSurround ? `
- paving or decking beyond the thin outer guide line, or a walkway surface raised above the lawn` : ""}
- anything in the original photo changed besides adding the pool
  `.trim();
}