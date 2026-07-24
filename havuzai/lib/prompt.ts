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

  const poolModel     = clientConfig.pool_models.find((m) => m.id === model);
  const modelName     = poolModel?.name || model;
  const shapeDesc      = poolModel?.prompt_description || poolModel?.description || `${model} shaped fiberglass pool`;

  const deckColor     = deck    ? clientConfig.deck_colors.find((d)    => d.id === deck)    : null;
  const ceramicColor  = ceramic ? clientConfig.ceramic_colors.find((c) => c.id === ceramic) : null;

  // Renk ismi + hex birlikte — sadece isimle model yanlış tona kayabiliyordu.
  const colorLabel = (c: { name: string; hex: string } | null | undefined) =>
    c ? `${c.name} (exact hex color code: ${c.hex})` : "";

  return `
You are a professional architectural visualization AI. Your task is to place a luxury fiberglass swimming pool into the provided outdoor photo. The result must look exactly like a real photograph taken after the pool was professionally built and installed.

===================================================
🚫 CRITICAL — READ THIS FIRST — MOST COMMON MISTAKES
===================================================
These are the errors that make an output INVALID. Check every one before finishing:

1. POOL TOO LARGE — This is the #1 mistake. The pool is almost always drawn too big.
   HARD LIMIT: the pool must occupy NO MORE than 12-15% of the total photo frame area.
   ANCHOR RULE: the pool's long side must NOT be wider than the visible width of the house/building in the photo. If anything, it should look noticeably SMALLER than the house's width — never equal to it, never larger.
   If you are unsure whether the pool looks too big — make it smaller. Small and correct beats big and wrong.

2. WRONG SHAPE — the pool must match the silhouette of Image 2 exactly (see RULE 2 below). No freelancing the shape.

3. POOL ABOVE GROUND — the pool must be sunk into the ground, water level flush with the surrounding grass. Never a box sitting on top of the lawn.

4. WRONG SURROUND MATERIAL/COLOR — if a ceramic or deck color is specified below, match its exact hex tone. Do not substitute a different color or material.

5. BLOCKING OR OVERLAPPING EXISTING OBJECTS — never place the pool on top of or crowding existing furniture, swing sets, trees, or paths already in the photo.

6. CROOKED / MISALIGNED PLACEMENT — the pool's edges must run parallel to the existing straight lines in the scene (fences, house walls, patio edges) — never dropped in at a random diagonal angle.

===================================================

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

---

RULE 1 — PRESERVE THE SCENE
Keep EVERYTHING in the original photo exactly as it is:
- Buildings, houses, villas — do NOT touch them
- Trees, hedges, plants — do NOT remove or change
- Fences, walls, paths — do NOT alter
- Only add the pool to the available open ground/grass area
- Pool must NOT block the main building's view

---

RULE 2 — POOL SHAPE & SIZE: ${modelName.toUpperCase()}
${shapeDesc}
Size label: ${size} meters — this defines proportions between the pool's own length/width, NOT how big it should look in the photo.

SIZE IN THE PHOTO (see CRITICAL section above for the hard limit):
- The pool must occupy roughly 10-15% of the total photo frame — small and modest, never dominant
- The pool must be clearly and obviously SMALLER than the house/building — its long side shorter than the house's visible width
- Leave generous grass on ALL sides — at least 3-4 meters of visible grass/ground between the pool edge and any garden boundary, fence, or hedge
- DO NOT fill the garden with the pool. DO NOT let the pool be the dominant object in the frame. The house/building should remain the dominant structure in the photo.

---

RULE 2b — OPTIMAL PLACEMENT (MANDATORY)
Choose the placement a professional real-estate photographer would choose for the most flattering composition:
- Place the pool in the clearest, most unobstructed open lawn area with a good sightline to the house
- Do NOT overlap, block, or crowd existing objects — swing sets, furniture, hot tubs, trees, paths
- Align the pool's edges with the perspective lines already in the photo (fence lines, house walls, patio edges) — do not rotate it to a random diagonal angle
- Prefer the spot closest to the house's main outdoor-facing side (patio, terrace, garden doors)

---

RULE 3 — POOL WATER
Clear, bright blue fiberglass pool interior.
Water is realistic — natural depth, light shimmer, and color variation.
The pool interior goes visibly deep into the ground.

---

${ceramicColor ? `
RULE 4 — CERAMIC TILE SURROUND (MANDATORY)
Add a ceramic tile walkway around ALL 4 sides of the pool.
- Exactly 2 rows of rectangular ceramic tiles on each side
- Each tile: 33cm (short side) x 66cm (long side) — a 2:1 ratio, twice as long as wide
- DO NOT use square tiles or 60x60 tiles.
- Long side (66cm) runs parallel to the pool edge — each row extends 33cm outward
- Total surround width across both rows: 66cm
- Visible grout lines between all tiles (2-3mm wide)
- Tile color: ${colorLabel(ceramicColor)} — MATCH THIS EXACT HEX SHADE, not a generic interpretation of the color name
- Tiles sit flush at ground level — NOT raised
- The ceramic surround replaces the grass directly around the pool
DO NOT skip the ceramic tiles — they are MANDATORY when selected.
` : deckColor ? `
RULE 4 — DECK SURROUND (MANDATORY)
Add a composite wood deck around ALL 4 sides of the pool.
- Exactly 3 deck boards on each side — total width 60cm
- Each board is 20cm wide, laid parallel to the nearest pool edge
- Deck color: ${colorLabel(deckColor)} — MATCH THIS EXACT HEX SHADE, not a generic interpretation of the color name
- Deck sits flush at ground level — NOT raised
- Clean modern finish with tight gaps between boards
- The deck surround replaces the grass directly around the pool
DO NOT skip the deck — it is MANDATORY when selected.
` : `
RULE 4 — POOL SURROUND
The existing ground (grass, soil, or whatever is in the original photo) meets the pool edge directly.
DO NOT add any deck, ceramic tiles, stone, pavers, or any surround material.
DO NOT add any white border, coping, or rim around the pool.
The pool shell must be completely hidden below ground — only the water surface and thin rim are visible.
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
- Luxury villa quality — professional, clean, premium finish

---

FINAL CHECK — ABSOLUTE PROHIBITIONS:
❌ Pool larger than 15% of the frame, or wider than the house — TOO BIG IS THE MOST COMMON FAILURE
❌ Pool above ground level in any way
❌ Wrong pool shape — must match Image 2 exactly
❌ Crooked/diagonal placement not aligned with the scene
❌ Blocking or overlapping existing objects
❌ Changing existing buildings, trees, or landscaping
❌ Cartoon, render, 3D, or illustration style — PHOTO ONLY
${ceramicColor ? "❌ Missing ceramic tile surround, or wrong tile color — MANDATORY when selected" : ""}
${deckColor ? "❌ Missing deck surround, or wrong deck color — MANDATORY when selected" : ""}
${config.hasStairs ? "❌ Missing pool ladder — MANDATORY when selected" : ""}
${config.hasWaterfall ? "❌ Missing waterfall — MANDATORY when selected" : ""}
  `.trim();
}