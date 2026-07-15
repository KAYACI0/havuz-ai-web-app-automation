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

  const shapeRule = isRoma
    ? `OVAL/TEARDROP shaped — ASYMMETRIC. The two ends of the pool are DIFFERENT from each other:
- One end is a WIDE, fully rounded semicircle.
- The other end NARROWS and tapers to a smaller rounded tip.
- The two long sides are NOT parallel — they curve and taper from the wide end toward the narrow end.
- Think of a water droplet or egg shape, NOT a running-track shape.
- WRONG: a rectangle with rounded corners (stadium/pill shape) — that is NOT the Roma shape.
- WRONG: a symmetric oval where both ends are identical.
- ABSOLUTELY NOT rectangular, NOT a rounded rectangle, NOT a stadium shape. Copy the exact silhouette from Image 2.`
    : `Strictly rectangular — straight sides, 90-degree corners. ABSOLUTELY NOT oval or curved.`;

  const orientationRule =
  poolOrientation === "horizontal"
    ? `HORIZONTAL POOL PLACEMENT — STRICT IMAGE-FRAME GEOMETRY.

Place the pool as a wide landscape pool across the final image.

REQUIRED:
- The pool's LONG axis runs from LEFT to RIGHT.
- The pool's two SHORT ends are on the LEFT and RIGHT.
- The pool must look wider left-to-right than it is deep from foreground to background.
- The edge nearest the camera must be a LONG edge, never a short end.
- The far edge toward the background must also be a LONG edge.
- The pool must NOT point toward the back fence, house, or background.

GEOMETRY:
- Both visible LONG pool edges must be straight and parallel to the bottom edge of the image frame.
- The left and right ends of the pool must be at the same vertical height.
- Maximum visible long-axis rotation: 3 degrees from horizontal.
- Do NOT align the pool with diagonal fences, walls, paths, grass lines, shadows, terrain, or existing photo perspective.
- If the available garden area is diagonal or narrow, reduce the pool size or reposition it. NEVER rotate the pool diagonally or vertically.

INVALID RESULTS:
- A pool extending mainly from the foreground toward the back fence.
- A short pool end facing the camera.
- A diagonal, tilted, corner-to-corner, or 45-degree pool.
- A pool whose long edges slope visibly upward or downward from left to right.

This rule controls pool placement only. Do NOT crop, rotate, reframe, or change the camera angle of the original photo.
The pool must fit entirely within the visible garden — do NOT let it extend beyond any fence, wall, or lawn boundary.`
    : poolOrientation === "vertical"
    ? `MANDATORY: VERTICAL POOL PLACEMENT ONLY.
The pool LONG axis points STRAIGHT AWAY from the camera toward the background. The pool SHORT axis runs left-to-right.
- The nearest edge to the camera is one of the pool's SHORT ends.
- The pool's LONG sides run from the foreground toward the house/background, like a corridor leading to the building.
- For a ${size} pool: the shorter dimension faces the camera left-to-right; the longer dimension recedes toward the house (foreshortened by perspective).
- WRONG: the pool placed diagonally, tilted, or at any angle. The long axis must aim straight at the background.
- WRONG: the pool's long side spanning left-to-right — that is HORIZONTAL, the opposite of what is required.
- This describes the pool's placement in the garden ONLY. Do NOT change the photo's framing or camera perspective.
- The pool must fit ENTIRELY within the visible garden. Do NOT let the pool extend beyond any garden boundary, fence, or wall.`
    : "";
       poolOrientation === "vertical"
      ? `⚠️ MANDATORY: VERTICAL POOL PLACEMENT ONLY.
The pool LONG axis points STRAIGHT AWAY from the camera toward the background. The pool SHORT axis runs left-to-right.
- The nearest edge to the camera is one of the pool's SHORT ends.
- The pool's LONG sides run from the foreground toward the house/background, like a corridor leading to the building.
- For a ${size} pool: the shorter dimension faces the camera left-to-right; the longer dimension recedes toward the house (foreshortened by perspective).
- WRONG: the pool placed diagonally, tilted, or at any angle. The long axis must aim straight at the background.
- WRONG: the pool's long side spanning left-to-right — that is HORIZONTAL, the opposite of what is required.
- This describes the pool's placement in the garden ONLY. Do NOT change the photo's framing or camera perspective.
- The pool must fit ENTIRELY within the visible garden. Do NOT let the pool extend beyond any garden boundary, fence, or wall.`
      : "";

  return `
You are a professional architectural visualization AI. Your task is to place a luxury fiberglass swimming pool into the provided outdoor photo. The result must look exactly like a real photograph taken after the pool was professionally built and installed.

REFERENCE IMAGES GUIDE:
- Image 1: Customer garden/property photo — THIS IS THE IMAGE TO EDIT
- Image 2: ${modelName} pool model — USE THIS EXACT POOL SHAPE
${config.hasWaterfall ? "- Image 3: Waterfall style reference — ADD THIS WATERFALL TO POOL EDGE" : ""}

---

MOST IMPORTANT RULE — IN-GROUND POOL INSTALLATION:
This is a PROFESSIONAL IN-GROUND swimming pool, built INTO the ground.

What you MUST show:
- The pool water surface is at the SAME LEVEL as the surrounding grass or ground.
- The pool goes DOWN into the earth — only the pool's thin top edge sits at ground level, blending into the surrounding surface.
- The pool looks like it has ALWAYS been there — natural, permanent, built-in.
- Surrounding grass or ground meets the pool edge naturally.

What you must NEVER show:
- The pool sitting ON TOP of the ground like a box or container.
- The pool walls or sides visible above the ground.
- Any gap between the pool and the surrounding ground.
- The pool elevated above the surrounding surface.

THIS IS THE MOST CRITICAL RULE. Pool raised above ground = completely wrong output.

---

RULE 1 — PRESERVE THE SCENE
Keep EVERYTHING in the original photo exactly as it is:
- Buildings, houses, villas — do NOT touch them.
- Trees, hedges, plants — do NOT remove or change.
- Fences, walls, paths — do NOT alter.
- Only add the pool to the available open ground/grass area.
- Pool must NOT block the main building's view.

---

RULE 2 — POOL SHAPE: ${modelName.toUpperCase()}
${shapeDesc}
Shape rule: ${shapeRule}
Size: ${size} meters — maintain exact proportions.
The pool must be SMALL relative to the garden — roughly 20–25% of the visible open garden area.
The pool must be clearly SMALLER than the house/building.
There must be visible grass on ALL sides around the pool — at least 2–3 meters of grass between pool edge and garden boundaries.
The pool must fit ENTIRELY within the visible garden boundaries — do NOT let the pool or its surround extend beyond any lawn edge, fence, wall, or garden boundary.
DO NOT fill the garden with the pool.

${
  orientationRule
    ? `
RULE 2B — POOL ORIENTATION (MANDATORY — FAILURE = INVALID OUTPUT)
${orientationRule}
`
    : ""
}

---

RULE 3 — POOL WATER
Clear, bright blue fiberglass pool interior.
Water is realistic — natural depth, light shimmer, and color variation.
The pool interior goes visibly deep into the ground.

---

${
  ceramicColor
    ? `
RULE 4 — CERAMIC TILE SURROUND (MANDATORY)
Add a ceramic tile walkway around ALL 4 sides of the pool.
- Exactly 2 rows of ceramic tiles on each side — total width 120cm (60cm per row).
- Tile size: RECTANGULAR tiles, 33cm wide x 66cm long — NOT square.
- Each tile is TWICE as long as it is wide — like a brick shape.
- Tiles laid in straight rows, with the LONG side (66cm) running parallel to the pool edge.
- Visible grout lines between all tiles (2–3mm wide).
- Tile color: ${ceramicColor.name} colored ceramic tiles.
- Tiles sit flush at ground level — NOT raised.
- The OUTER edge of the tile area meets the grass at EXACTLY the same level — grass blades touch the tile edge directly.
- NO visible slab thickness, NO raised platform edge, NO step, NO side face, NO shadow gap where the tiles meet the grass.
- The tile walkway is set INTO the ground like a patio, NOT placed ON TOP of the grass like a platform.
- The walkway is NARROW — about 1.2m wide. Do NOT create a large patio or wide platform around the pool.
- The FIRST row of tiles meets the pool water edge DIRECTLY — the tiles themselves act as the pool coping.
- ALL tiles are the SAME ${ceramicColor.name} color. Every single tile, including the row touching the water.
- NO inner frame, NO border row, NO edge strip, NO wide rim around the water — in ANY color.
- The pool's fiberglass lip/edge must be completely HIDDEN under the tiles — the fiberglass shell is never visible from outside.
- The visible edge where water meets tile is a THIN line only — a few centimeters at most.
- The transition is: blue water → thin dark shadow line at the waterline → ${ceramicColor.name} ceramic tile. Nothing else in between.
- Clean, professional, realistic tile finish.
- The ceramic surround replaces the grass directly around the pool.
DO NOT skip the ceramic tiles — they are MANDATORY when selected.
`
    : deckColor
    ? `
RULE 4 — DECK SURROUND (MANDATORY)
Add a composite wood deck around ALL 4 sides of the pool.
- Exactly 3 deck boards on each side — total width 60cm.
- Each board is 20cm wide, laid parallel to the nearest pool edge.
- Deck color: ${deckColor.name} colored composite wood deck.
- Deck sits flush at ground level — NOT raised.
- The FIRST deck board meets the pool water edge DIRECTLY — the deck itself acts as the pool coping.
- NO white coping, NO white rim, NO white plastic or fiberglass border between the water and the deck boards.
- Clean modern finish with tight gaps between boards.
- The deck surround replaces the grass directly around the pool.
DO NOT skip the deck — it is MANDATORY when selected.
`
    : `
RULE 4 — POOL SURROUND
The existing ground (grass, soil, or whatever is in the original photo) meets the pool edge directly.
DO NOT add any deck, ceramic tiles, stone, pavers, or any surround material.
DO NOT add any walkway or border around the pool.
The original ground material continues right up to the pool water edge.
DO NOT add any white border, coping, or rim around the pool.
The pool shell must be completely hidden below ground — NO visible pool walls or sides outside.
Only the water surface and thin rim are visible — everything else is underground.
`
}

---

${
  config.hasStairs
    ? `
RULE 5 — POOL LADDER (MANDATORY — EXACTLY ONE)
EXACTLY ONE stainless steel pool ladder MUST be visible in the final image.
- COUNT: ONE single ladder. NOT two. NOT one on each end. ONE only.
- Type: 3-step stainless steel pool entry ladder.
- Material: polished chrome stainless steel, shiny and realistic.
- Position: mounted on one SHORT END of the pool edge, steps going DOWN INTO the water.
OMITTING THE LADDER = INVALID OUTPUT.
`
    : ""
}

${
  config.hasWaterfall
    ? `
RULE 6 — WATERFALL BLADE (MANDATORY — EXACTLY ONE)
EXACTLY ONE stainless steel cobra waterfall blade MUST be visible in the final image.
- COUNT: ONE single waterfall. NOT two. NOT one on each side. ONE only.
- Size: small and elegant — approximately 35cm wide, 40cm tall.
- Material: polished brushed stainless steel, chrome finish.
- Position: mounted DIRECTLY ON THE POOL COPING EDGE on one LONG side, roughly at the middle of that side.
- Water flows in a smooth sheet from the blade DOWN INTO the pool.
OMITTING THE WATERFALL = INVALID OUTPUT. ADDING A SECOND WATERFALL = INVALID OUTPUT.
`
    : ""
}

---

RULE 7 — PHOTOREALISTIC QUALITY
- Output must look like a real professional photograph.
- Match the exact lighting, shadows, and time of day of the original photo.
- Preserve the original photo's crop, framing, aspect ratio, and camera angle.
- The pool must look completely natural — like it was always there.
- Luxury villa quality — professional, clean, premium finish.

---

ABSOLUTE PROHIBITIONS:
❌ Pool above ground level in any way.
❌ Pool walls or sides visible above the surrounding surface.
❌ Wrong pool shape — must match Image 2 exactly${
    isRoma
      ? " (NOT a rounded rectangle / stadium shape — the Roma is an asymmetric teardrop)."
      : ""
  }
${
  orientationRule
    ? `❌ Wrong pool orientation — long axis must ${
        poolOrientation === "horizontal"
          ? "run LEFT-TO-RIGHT and remain horizontal relative to the image frame."
          : "point STRAIGHT AWAY from camera toward background."
      }
❌ Diagonal, tilted, or angled pool placement.`
    : ""
}
❌ Pool or surround extending beyond garden boundaries, fences, or walls.
❌ Changing existing buildings, trees, or landscaping.
❌ Changing the photo's framing, crop, aspect ratio, or camera perspective.
❌ Cartoon, render, 3D, or illustration style — PHOTO ONLY.
${
  ceramicColor
    ? `❌ Missing ceramic tile surround — MANDATORY when selected.
❌ Any visible frame, band, rim, or lip around the water in ANY color.
❌ Tile area raised above the grass like a platform.`
    : ""
}
${
  deckColor
    ? `❌ Missing deck surround — MANDATORY when selected.
❌ White coping, white rim, or any white border between the water and the deck.`
    : ""
}
${config.hasStairs ? "❌ Missing pool ladder — MANDATORY when selected.\n❌ More than ONE ladder." : ""}
${
  config.hasWaterfall
    ? "❌ Missing waterfall — MANDATORY when selected.\n❌ More than ONE waterfall — exactly one, never two."
    : ""
}
  `.trim();
}