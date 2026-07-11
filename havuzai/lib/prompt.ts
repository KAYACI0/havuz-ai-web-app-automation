import type { ClientConfig } from "./config-types";

export interface PoolConfig {
  model:           string;
  size:            string;
  deck:            string;
  ceramic:         string;
  hasWaterfall:    boolean;
  hasStairs:       boolean;
  stairType:       "corner" | "wide";
  poolOrientation: "horizontal" | "vertical" | "";
}

export function buildPoolPrompt(config: PoolConfig, clientConfig: ClientConfig): string {
  const { model, size, ceramic, deck, poolOrientation } = config;

  const poolModel    = clientConfig.pool_models.find((m) => m.id === model);
  const modelName    = poolModel?.name || model;
  const shapeDesc    = poolModel?.prompt_description || poolModel?.description || `${model} shaped fiberglass pool`;
  const deckColor    = deck    ? clientConfig.deck_colors.find((d)    => d.id === deck)    : null;
  const ceramicColor = ceramic ? clientConfig.ceramic_colors.find((c) => c.id === ceramic) : null;

  const isRoma = model.toUpperCase() === "ROMA";
  const shapeRule = isRoma
    ? "OVAL/TEARDROP shaped — asymmetric, curved sides, one wide rounded end, one narrow tapered end. ABSOLUTELY NOT rectangular."
    : "strictly rectangular — straight sides, 90-degree corners. ABSOLUTELY NOT oval or curved.";

  const orientationRule = poolOrientation === "horizontal"
    ? `POOL ORIENTATION — CRITICAL: The pool MUST be placed HORIZONTALLY in the scene.
The LONG side of the pool runs LEFT to RIGHT across the image.
The pool appears WIDER than it is tall when viewed in the photograph.
If the pool size is 3x7, the 7-meter side goes left-to-right, the 3-meter side goes top-to-bottom.
DO NOT place the pool vertically. HORIZONTAL ONLY.`
    : poolOrientation === "vertical"
    ? `POOL ORIENTATION — CRITICAL: The pool MUST be placed VERTICALLY in the scene.
The LONG side of the pool runs TOP to BOTTOM in the image.
The pool appears TALLER than it is wide when viewed in the photograph.
If the pool size is 3x7, the 7-meter side goes top-to-bottom, the 3-meter side goes left-to-right.
DO NOT place the pool horizontally. VERTICAL ONLY.`
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
- The pool water surface is at the SAME LEVEL as the surrounding grass or ground
- The pool goes DOWN into the earth — only the thin coping/rim (5-10cm) is at ground level
- The pool looks like it has ALWAYS been there — natural, permanent, built-in
- Surrounding grass or ground meets the pool edge naturally

What you must NEVER show:
- The pool sitting ON TOP of the ground like a box or container
- The pool walls or sides visible above the ground
- Any gap between the pool and the surrounding ground
- The pool elevated above the surrounding surface

THIS IS THE MOST CRITICAL RULE. Pool raised above ground = completely wrong output.

---

RULE 1 — PRESERVE THE SCENE
Keep EVERYTHING in the original photo exactly as it is:
- Buildings, houses, villas — do NOT touch them
- Trees, hedges, plants — do NOT remove or change
- Fences, walls, paths — do NOT alter
- Only add the pool to the available open ground/grass area
- Pool must NOT block the main building's view

---

RULE 2 — POOL SHAPE: ${modelName.toUpperCase()}
${shapeDesc}
Shape rule: ${shapeRule}
Size: ${size} meters — maintain exact proportions.
The pool must be SMALL relative to the garden — roughly 20-25% of the visible open garden area.
The pool must be clearly SMALLER than the house/building.
There must be visible grass on ALL sides around the pool — at least 2-3 meters of grass between pool edge and garden boundaries.
DO NOT fill the garden with the pool.

${orientationRule ? `
RULE 2B — POOL ORIENTATION (CRITICAL)
${orientationRule}
THIS ORIENTATION IS MANDATORY. Do NOT rotate the pool in any other direction.
` : ""}

---

RULE 3 — POOL WATER
Clear, bright blue fiberglass pool interior.
Water is realistic — natural depth, light shimmer, and color variation.
The pool interior goes visibly deep into the ground.

---

${ceramicColor ? `
RULE 4 — CERAMIC TILE SURROUND (MANDATORY)
Add a ceramic tile walkway around ALL 4 sides of the pool.
- Exactly 2 rows of ceramic tiles on each side — total width 120cm (60cm per row)
- Tile size: RECTANGULAR tiles, 33cm wide x 66cm long — NOT square
- Each tile is TWICE as long as it is wide — like a brick shape
- Tiles laid in straight rows, with the LONG side (66cm) running parallel to the pool edge
- Visible grout lines between all tiles (2-3mm wide)
- Tile color: ${ceramicColor.name} colored ceramic tiles
- Tiles sit flush at ground level — NOT raised
- Clean, professional, realistic tile finish
- The ceramic surround replaces the grass directly around the pool
DO NOT skip the ceramic tiles — they are MANDATORY when selected.
` : deckColor ? `
RULE 4 — DECK SURROUND (MANDATORY)
Add a composite wood deck around ALL 4 sides of the pool.
- Exactly 3 deck boards on each side — total width 60cm
- Each board is 20cm wide, laid parallel to the nearest pool edge
- Deck color: ${deckColor.name} colored composite wood deck
- Deck sits flush at ground level — NOT raised
- Clean modern finish with tight gaps between boards
- The deck surround replaces the grass directly around the pool
DO NOT skip the deck — it is MANDATORY when selected.
` : `
RULE 4 — POOL SURROUND
The existing ground (grass, soil, or whatever is in the original photo) meets the pool edge directly.
DO NOT add any deck, ceramic tiles, stone, pavers, or any surround material.
DO NOT add any walkway or border around the pool.
The original ground material continues right up to the pool water edge.
DO NOT add any white border, coping, or rim around the pool.
The pool shell must be completely hidden below ground — NO visible pool walls or sides outside.
Only the water surface and thin rim are visible — everything else is underground.
`}

---

${config.hasStairs ? `
RULE 5 — POOL LADDER (MANDATORY)
A stainless steel pool ladder MUST be visible in the final image.
- Type: 3-step stainless steel pool entry ladder
- Material: polished chrome stainless steel, shiny and realistic
- Position: mounted on one SHORT END of the pool edge, steps going DOWN INTO the water
OMITTING THE LADDER = INVALID OUTPUT.
` : ""}

${config.hasWaterfall ? `
RULE 6 — WATERFALL BLADE (MANDATORY)
A stainless steel cobra waterfall blade MUST be visible in the final image.
- Size: small and elegant — approximately 35cm wide, 40cm tall
- Material: polished brushed stainless steel, chrome finish
- Position: mounted DIRECTLY ON THE POOL COPING EDGE on one LONG side
- Water flows in a smooth sheet from the blade DOWN INTO the pool
OMITTING THE WATERFALL = INVALID OUTPUT.
` : ""}

---

RULE 7 — PHOTOREALISTIC QUALITY
- Output must look like a real professional photograph
- Match the exact camera angle and perspective of the original photo
- Match the lighting, shadows, and time of day of the original photo
- The pool must look completely natural — like it was always there
- Luxury villa quality — professional, clean, premium finish

---

ABSOLUTE PROHIBITIONS:
❌ Pool above ground level in any way
❌ Pool walls or sides visible above the surrounding surface
❌ Wrong pool shape — must match Image 2 exactly
${orientationRule ? "❌ Wrong pool orientation — MUST follow the specified direction" : ""}
❌ Changing existing buildings, trees, or landscaping
❌ Cartoon, render, 3D, or illustration style — PHOTO ONLY
${ceramicColor ? "❌ Missing ceramic tile surround — MANDATORY when selected" : ""}
${deckColor ? "❌ Missing deck surround — MANDATORY when selected" : ""}
${config.hasStairs ? "❌ Missing pool ladder — MANDATORY when selected" : ""}
${config.hasWaterfall ? "❌ Missing waterfall — MANDATORY when selected" : ""}
  `.trim();
}