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

  // Firma config'inden model bilgisini bul
  const poolModel     = clientConfig.pool_models.find((m) => m.id === model);
  const modelName     = poolModel?.name || model;
  const shapeDesc     = poolModel?.prompt_description || poolModel?.description || `${model} shaped fiberglass pool`;

  // Deck ve seramik renk bilgilerini bul
  const deckColor     = deck    ? clientConfig.deck_colors.find((d)    => d.id === deck)    : null;
  const ceramicColor  = ceramic ? clientConfig.ceramic_colors.find((c) => c.id === ceramic) : null;

  const isRoma = model.toUpperCase() === "ROMA";

const shapeRule = isRoma
  ? `SHAPE: PERFECT CAPSULE / STADIUM / RACETRACK SHAPE.

GEOMETRY (STRICT):
- Two long sides: perfectly straight, parallel, flat, equal length. Zero curvature.
- Two short ends: large, clean, full semicircles (perfect 180° arcs).
- The OUTER silhouette of the pool must be a pure capsule (stadium shape). No irregularities, no extra curves, no bulges.
- Proportions: length roughly 2× width.

INTEGRATED STEPS RULE (CRITICAL):
- Wide built-in steps exist only at ONE short end.
- These steps are 100% INSIDE the semicircle.
- The outer edge of the stepped end must still form a perfect smooth semicircle.
- From the outside looking at the pool outline, both ends look identical clean semicircles.
- Steps do not change or push the outer wall. They are submerged platforms inside the blue water area.
- 3-4 wide horizontal step ledges clearly visible under the water.

Additional details:
- Single continuous fiberglass shell
- Subtle horizontal ribbing on the vertical walls
- Strictly in-ground`
  : "SHAPE: STRICTLY RECTANGULAR. Straight sides, 90-degree sharp corners. Perfect geometric rectangle.";
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
If the shape description above mentions built-in/integrated entry steps, they MUST be clearly visible in the output — correct step count, correct position, not smoothed over or omitted.
Size: ${size} meters — maintain exact proportions.
The pool must be SMALL relative to the garden — roughly 20-25% of the visible open garden area.
The pool must be clearly SMALLER than the house/building.
There must be visible grass on ALL sides around the pool — at least 2-3 meters of grass between pool edge and garden boundaries.
DO NOT fill the garden with the pool.

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
- Tile size: RECTANGULAR — width 33cm, length 66cm (2:1 ratio)
- DO NOT use square tiles
- Tiles laid in straight rows, LONG side parallel to the pool edge
- Visible grout lines (2-3mm)
- Tile color: ${ceramicColor.name} — exact color, realistic ceramic texture
- Tiles sit flush at ground level — NOT raised
- Clean, professional finish
- The ceramic surround replaces the grass directly around the pool
DO NOT skip the ceramic tiles — they are MANDATORY.
` : deckColor ? `
RULE 4 — DECK SURROUND (MANDATORY)
Add a composite wood deck around ALL 4 sides of the pool.
- Exactly 3 deck boards on each side — total width 60cm
- Each board is 20cm wide, laid parallel to the nearest pool edge
- Deck color: ${deckColor.name} — exact color, realistic composite wood texture with natural grain
- Deck sits flush at ground level — NOT raised
- Clean modern finish with tight gaps between boards
- The deck surround replaces the grass directly around the pool
DO NOT skip the deck — it is MANDATORY.
` : `
RULE 4 — POOL SURROUND
The existing ground meets the pool edge directly.
DO NOT add any deck, ceramic tiles, stone, pavers or border.
Only the thin pool rim and water surface are visible.
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
❌ Changing existing buildings, trees, or landscaping
❌ Cartoon, render, 3D, or illustration style — PHOTO ONLY
${ceramicColor ? "❌ Missing ceramic tile surround — MANDATORY when selected" : ""}
${deckColor ? "❌ Missing deck surround — MANDATORY when selected" : ""}
${config.hasStairs ? "❌ Missing pool ladder — MANDATORY when selected" : ""}
${config.hasWaterfall ? "❌ Missing waterfall — MANDATORY when selected" : ""}
  `.trim(); 
}