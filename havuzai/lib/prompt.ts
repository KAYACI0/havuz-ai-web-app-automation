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
  const shapeDesc     = poolModel?.prompt_description || poolModel?.description || `${model} shaped fiberglass pool`;

  const deckColor     = deck    ? clientConfig.deck_colors.find((d)    => d.id === deck)    : null;
  const ceramicColor  = ceramic ? clientConfig.ceramic_colors.find((c) => c.id === ceramic) : null;

  const isRoma = model.toUpperCase() === "ROMA";
  const shapeRule = isRoma
    ? "OVAL/TEARDROP shaped — asymmetric, curved sides, one wide rounded end, one narrow tapered end. ABSOLUTELY NOT rectangular."
    : "strictly rectangular — straight sides, 90-degree corners. ABSOLUTELY NOT oval or curved.";

  return `
You are a professional architectural visualization AI. Your task is to place a luxury fiberglass swimming pool into the provided outdoor photo. The result must look exactly like a real photograph taken after the pool was professionally built and installed.

===================================================
🚫 CRITICAL — READ THIS FIRST — MOST COMMON MISTAKES
===================================================
1. POOL TOO LARGE / TOO CLOSE TO CAMERA
   - The pool must occupy NO MORE than 10-12% of the total photo frame area.
   - The pool's long side must NOT be wider than the visible width of the house/building.
   - Do NOT place the pool in the extreme foreground. Leave visible open lawn between the near edge of the frame and the near edge of the pool.

2. CROOKED / MISALIGNED PLACEMENT
   - The pool's edges MUST align with the perspective lines already present in the photo (fence lines, house walls, patio edges, path lines).
   - The pool's long sides must run parallel to the dominant straight lines of the scene.
   - Do NOT rotate the pool at a random diagonal angle relative to the camera or the house.
   - The pool should look like it was laid out by a surveyor using the property's existing lines as reference.

If unsure — make the pool smaller, move it further back, and align it with the scene's existing lines.
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
The pool must sit at a middle-distance in the garden, NOT in the extreme foreground.
There must be visible grass on ALL sides around the pool — at least 2-3 meters of grass between pool edge and garden boundaries.
DO NOT fill the garden with the pool.

---

RULE 2b — OPTIMAL PLACEMENT & ALIGNMENT (MANDATORY)
Choose the placement a professional real-estate photographer would choose:
- Place the pool in the clearest, most unobstructed open lawn area with a good sightline to the house
- Do NOT overlap, block, or crowd existing objects — swing sets, furniture, hot tubs, trees, paths
- CRITICAL: Align the pool's edges with the perspective lines already in the photo (fence lines, house walls, patio edges) — do NOT rotate it to a random diagonal angle
- Prefer the spot closest to the house's main outdoor-facing side (patio, terrace, garden doors)

---

RULE 3 — POOL WATER
Clear, bright blue fiberglass pool interior.
Water is realistic — natural depth, light shimmer, and color variation.
The pool interior goes visibly deep into the ground.

---

${ceramicColor ? `
RULE 4 — CERAMIC TILE SURROUND (MANDATORY, VERY NARROW)
Add a ceramic tile walkway around the pool — this must look like a single narrow footpath, NOT a patio or terrace.
- Visual size reference: the tiled strip should be roughly as wide as ONE of the pool's own entry steps — thin enough that a person could stand on it with both feet together and nothing more
- The tiles must stop well short of the lawn edges, fence, or hedge — there must be a LARGE, OBVIOUS band of plain grass visible between the tiled strip and any garden boundary on all sides
- If the tiled area touches, nears, or extends toward the fence/hedge/property line, that is WRONG — it must look like a small ring hugging only the pool itself
- Tile color: ${ceramicColor.name} colored ceramic tiles, rectangular (not square), with visible grout lines
- Tiles sit flush at ground level — NOT raised
DO NOT let the tiled area cover a large portion of the lawn. DO NOT let it look like a patio, terrace, or deck area. It is a thin trim around the pool only.
` : deckColor ? `
RULE 4 — DECK SURROUND (MANDATORY, VERY NARROW)
Add a composite wood deck around the pool — this must look like a single narrow walking strip, NOT a patio or terrace.
- Visual size reference: the deck strip should be roughly as wide as ONE of the pool's own entry steps — thin enough that a person could stand on it with both feet together and nothing more
- The deck must stop well short of the lawn edges, fence, or hedge — there must be a LARGE, OBVIOUS band of plain grass visible between the deck and any garden boundary on all sides
- If the deck touches, nears, or extends toward the fence/hedge/property line, that is WRONG — it must look like a small ring hugging only the pool itself
- Deck color: ${deckColor.name} colored composite wood deck, clean modern finish with tight gaps between boards
- Deck sits flush at ground level — NOT raised
DO NOT let the deck cover a large portion of the lawn. DO NOT let it look like a patio, terrace, or large deck area. It is a thin trim around the pool only.
` : `
RULE 4 — POOL SURROUND (NO DECK OR CERAMIC SELECTED)
No deck or ceramic walkway was selected — do NOT add any tiles, wood boards, stone pavers, or walkway material.
The existing ground (grass, soil) comes right up to the pool's coping edge — no wide border.

The pool DOES have a normal, thin, in-ground pool coping (5-10cm wide):
- Coping material: matte natural stone-grey or light beige concrete — NEVER bright white, NEVER plastic-looking
- The coping sits FLUSH with the surrounding ground — grass touches the outer edge directly
- Keep the coping subtle and realistic — a normal residential in-ground pool edge
DO NOT add a decorative walkway, deck, or tile border — only the narrow, natural-toned coping.
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
❌ Crooked/diagonal placement not aligned with the scene
❌ Wrong pool shape — must match Image 2 exactly
❌ Changing existing buildings, trees, or landscaping
❌ Cartoon, render, 3D, or illustration style — PHOTO ONLY
${ceramicColor ? "❌ Missing ceramic tile surround, or oversized ceramic area — MANDATORY size limit applies" : ""}
${deckColor ? "❌ Missing deck surround — MANDATORY when selected" : ""}
${!ceramicColor && !deckColor ? "❌ Bright white or plastic-looking coping, thick raised rim, or decorative walkway" : ""}
${ceramicColor ? "❌ Ceramic area covering a large portion of the lawn, touching the fence/hedge, or looking like a patio instead of a thin trim" : ""}
${deckColor ? "❌ Deck area covering a large portion of the lawn, touching the fence/hedge, or looking like a patio instead of a thin trim" : ""}
${config.hasStairs ? "❌ Missing pool ladder — MANDATORY when selected" : ""}
${config.hasWaterfall ? "❌ Missing waterfall — MANDATORY when selected" : ""}
  `.trim();
}