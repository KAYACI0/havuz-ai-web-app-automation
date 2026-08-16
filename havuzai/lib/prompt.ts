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
    ? "OVAL/TEARDROP shaped — asymmetric, curved sides, one wide rounded end, one narrow tapered end. ABSOLUTELY NOT rectangular."
    : "strictly rectangular — straight sides, 90-degree corners. ABSOLUTELY NOT oval or curved.";

  return `
You are a professional architectural visualization AI. Your task is to place a luxury fiberglass swimming pool into the provided outdoor photo. The result must look exactly like a real photograph taken after the pool was professionally built and installed.

===================================================
🚫 CRITICAL — READ THIS FIRST — MOST COMMON MISTAKE
===================================================
POOL TOO LARGE / TOO CLOSE TO CAMERA — this is by far the most common error.
- The pool must occupy NO MORE than 10-12% of the total photo frame area.
- The pool's long side must NOT be wider than the visible width of the house/building — it should look noticeably SMALLER, never equal or larger.
- Do NOT place the pool in the extreme foreground closest to the camera. There must be clearly visible open lawn BETWEEN the near edge of the frame and the near edge of the pool — the pool sits at a comfortable middle-distance in the garden, not filling the front of the shot.
- If unsure whether the pool looks too big or too close — make it smaller and move it further back. Small and correctly placed beats big and dominant.
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
The pool must be SMALL relative to the garden — roughly 10-12% of the total photo frame area (see CRITICAL section above).
The pool must be clearly SMALLER than the house/building.
The pool must sit at a middle-distance in the garden, NOT in the extreme foreground — leave visible open lawn between the near edge of the frame and the near edge of the pool.
There must be visible grass on ALL sides around the pool — at least 2-3 meters of grass between pool edge and garden boundaries.
DO NOT fill the garden with the pool. DO NOT let the pool loom large due to close camera perspective.

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
- Tile size: RECTANGULAR — width 33cm, length 66cm (2:1 ratio, twice as long as wide)
- DO NOT use square tiles. Tiles MUST be rectangular with 2:1 ratio.
- Tile size: RECTANGULAR tiles, 33cm wide x 66cm long — NOT square, NOT 60x60
- Each tile is TWICE as long as it is wide — like a brick shape
- Tiles laid in straight rows, with the LONG side (66cm) running parallel to the pool edge
- Visible grout lines between all tiles
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
RULE 4 — POOL SURROUND (NO DECK OR CERAMIC SELECTED)
No deck or ceramic walkway was selected — do NOT add any tiles, wood boards, stone pavers, or walkway material around the pool.
The existing ground (grass, soil, or whatever is in the original photo) comes right up to the pool's coping edge — no wide border, no walkway strip.

The pool DOES have a normal, thin, in-ground pool coping (5-10cm wide) — this is a real physical necessity for a real pool and must look natural:
- Coping material: matte natural stone-grey or light beige concrete coping — NEVER bright white, NEVER plastic-looking, NEVER a thick raised lip
- The coping sits FLUSH with the surrounding ground — grass touches the outer edge of the coping directly, no gap, no visible pool wall above ground
- Keep the coping subtle and realistic — it should look like a normal residential in-ground pool edge, not a decorative border and not an above-ground pool rim
DO NOT add a decorative walkway, deck, or tile border — only the narrow, natural-toned structural coping described above.
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
❌ Pool larger than 12% of the frame, wider than the house, or placed too close to the camera
❌ Pool above ground level in any way
❌ Pool walls or sides visible above the surrounding surface
❌ Wrong pool shape — must match Image 2 exactly
❌ Changing existing buildings, trees, or landscaping
❌ Cartoon, render, 3D, or illustration style — PHOTO ONLY
${ceramicColor ? "❌ Missing ceramic tile surround — MANDATORY when selected" : ""}
${deckColor ? "❌ Missing deck surround — MANDATORY when selected" : ""}
${!ceramicColor && !deckColor ? "❌ Bright white or plastic-looking coping, thick raised rim, or decorative walkway when no deck/ceramic was selected — coping must be thin, natural-toned, and flush with the ground" : ""}
${config.hasStairs ? "❌ Missing pool ladder — MANDATORY when selected" : ""}
${config.hasWaterfall ? "❌ Missing waterfall — MANDATORY when selected" : ""}
  `.trim();
}