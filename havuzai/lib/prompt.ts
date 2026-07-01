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
  const { size } = config;

  // Seçilen modeli firma config'inden bul; şekil açıklaması modele göre gelir.
  const model = clientConfig.pool_models.find((m) => m.id === config.model);
  const modelName = model?.name || config.model;
  const shapeDesc =
    model?.prompt_description || model?.description || `${config.model} shaped fiberglass pool`;

  // Seçilen deck / seramik rengini firma config'inden bul (deck ↔ seramik dışlamalı).
  const deck = clientConfig.deck_colors.find((d) => d.id === config.deck);
  const ceramic = clientConfig.ceramic_colors.find((c) => c.id === config.ceramic);

  // Merdiven seçildiğinde fal.ai'ye bir ladder stil referansı da gönderilir (varsa).
  const stairRef = clientConfig.features?.stair_reference_url;

  const imageRoleDescription = `
REFERENCE IMAGES GUIDE:
- Image 1: Customer garden/property photo — THIS IS THE IMAGE TO EDIT
- Image 2: ${modelName} pool model — USE THIS EXACT POOL SHAPE
${config.hasWaterfall
  ? "- Image 3: Waterfall style reference — ADD THIS WATERFALL TO POOL EDGE"
  : ""}

Your task:
Edit Image 1 ONLY by adding the pool from Image 2.
Match pool shape exactly from Image 2.
${config.hasWaterfall
  ? "Add waterfall exactly as shown in Image 3."
  : ""}
Do NOT change anything else in Image 1.
`;

  return `
${imageRoleDescription}
You are a professional architectural visualization AI. Your task is to place a luxury fiberglass swimming pool into the provided outdoor photo. The result must look exactly like a real photograph taken after the pool was professionally built and installed.

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
${config.hasStairs ? `
‼️ MANDATORY — POOL LADDER MUST BE VISIBLE:
An external clip-on pool ladder is
REQUIRED in this image.
${config.stairType === "wide"
  ? "Wide ladder spanning the full short end, 3-4 steps visible above water."
  : "Compact A-frame ladder hooked over pool edge, stainless steel, 3-4 steps."}
${stairRef
  ? "Use the reference image provided for the exact ladder style and design. External clip-on ladder hooked over the pool edge, exactly as shown in the reference."
  : ""}
This ladder MUST be clearly visible
in the final image.
Do NOT omit the ladder.
If ladder is missing the output is WRONG.
` : ""}
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
Size: ${size} meters — maintain exact proportions.
The pool must be SMALL relative to the garden — roughly 20-25% of the visible open garden area.
The pool must be clearly SMALLER than the house/building.
There must be visible grass on ALL sides around the pool — at least 2-3 meters of grass between pool edge and garden boundaries.
DO NOT fill the garden with the pool.

---

RULE 3 — POOL WATER
${ceramic
  ? `Pool interior: ${ceramic.name} ceramic tiles — the water appears ${ceramic.name}.`
  : "Clear, bright blue fiberglass pool interior."}
Water is realistic — natural depth, light shimmer, and color variation.
The pool interior goes visibly deep into the ground.

---

RULE 4 — POOL SURROUND
${deck
  ? `DECK SURROUND — EXACT SPECIFICATIONS:
${deck.name} colored composite wood decking.
Surrounds ALL 4 sides of the pool.
Each deck board is exactly 20cm wide.
3 boards placed side by side on each edge.
Total deck width: 60cm on all sides.
Boards run PARALLEL to the pool edge.
Thin modern profile, tight spacing between boards.
Color: ${deck.name}.
DO NOT add stone, pavers, tiles, or any other surround material — only the ${deck.name} composite wood deck.`
  : `The existing ground (grass, soil, or whatever is in the original photo) meets the pool edge directly.
DO NOT add any deck, ceramic tiles, stone, pavers, or any surround material.
DO NOT add any walkway or border around the pool.
The original ground material continues right up to the pool water edge.
DO NOT add any white border, coping, or rim around the pool.`}
The pool shell must be completely hidden below ground — NO visible pool walls or sides outside.
The fiberglass pool body must NOT be visible above ground level.
${config.hasWaterfall
  ? `\nRULE 4B — WATERFALL\nAdd a stainless steel curved blade waterfall on the pool edge, with a thin sheet of water flowing into the pool. Match the style shown in Image 3.`
  : ""}
---

RULE 5 — PHOTOREALISTIC QUALITY
- Output must look like a real professional photograph
- Match the exact camera angle and perspective of the original photo
- Match the lighting, shadows, and time of day of the original photo
- The pool must look completely natural — like it was always there
- Luxury villa quality — professional, clean, premium finish

---

ABSOLUTE PROHIBITIONS:
❌ Pool above ground level in any way
❌ Pool walls or sides visible above the surrounding surface
❌ Wrong pool shape — the shape MUST match Image 2 and RULE 2 exactly
${deck ? "" : "❌ Adding any deck, wood boards, stone, pavers, or surround material\n"}${config.hasWaterfall ? "" : "❌ Adding any waterfall or water feature\n"}${config.hasStairs ? "" : "❌ Adding a ladder or external stairs to the pool\n"}❌ Changing existing buildings, trees, or landscaping
❌ Cartoon, render, 3D, or illustration style — PHOTO ONLY
  `.trim();
}