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

  let imageNumber = 3;

  const referenceGuide = [
    "Image 1: Customer garden/property photo — THIS IS THE IMAGE TO EDIT.",
    `Image 2: ${modelName} pool model — USE THIS AS THE PRIMARY EXACT POOL SHAPE REFERENCE.`,
  ];

  if (poolModel?.reference_image_url_2) {
    referenceGuide.push(
      `Image ${imageNumber}: Second ${modelName} pool angle — USE THIS TO CONFIRM THE EXACT SHAPE, CURVES, STEPS, AND PROPORTIONS.`
    );
    imageNumber++;
  }

  if (ceramicColor) {
    referenceGuide.push(
      `Image ${imageNumber}: Ceramic tile layout reference — USE ONLY the rectangular tile shape, 2:1 proportions, grout lines, and installation pattern. DO NOT copy the turquoise color from this reference. The tile color MUST be ${ceramicColor.name}.`
    );
    imageNumber++;
  }

  if (config.hasWaterfall) {
    referenceGuide.push(
      `Image ${imageNumber}: Waterfall style reference — ADD THIS WATERFALL TO THE POOL EDGE.`
    );
    imageNumber++;
  }

  if (config.hasStairs && clientConfig.features?.stair_reference_url) {
    referenceGuide.push(
      `Image ${imageNumber}: Pool ladder reference — USE THIS STYLE FOR THE STAINLESS STEEL LADDER.`
    );
  }

  return `
You are a professional architectural visualization AI. Your task is to place a luxury fiberglass swimming pool into the provided outdoor photo.

The final result must look exactly like a real professional photograph taken after the pool was built and installed.

REFERENCE IMAGES GUIDE:
${referenceGuide.map((line) => `- ${line}`).join("\n")}

---

MOST IMPORTANT RULE — PROFESSIONAL IN-GROUND INSTALLATION:

This is a professionally built IN-GROUND swimming pool.

You MUST show:
- Pool water surface at the SAME LEVEL as the surrounding grass or ground
- The pool built down INTO the earth
- Only a thin coping/rim at ground level
- Natural grass, soil, ceramic, or deck meeting the pool edge cleanly
- A permanent, realistic installation that looks like it has always been there

You must NEVER show:
- A pool sitting on top of the ground
- Raised visible outer pool walls
- A container, box, platform, or above-ground pool
- Gaps between the pool and surrounding ground

---

RULE 1 — PRESERVE THE ORIGINAL SCENE:

Keep everything in the original garden photo unchanged:
- Do not change buildings, houses, windows, roofs, trees, fences, paths, furniture, or landscaping
- Only add the pool and its selected surround material to an available open ground area
- Do not block the main house, patio, terrace, garden doors, or best view of the property

---

RULE 2 — EXACT POOL MODEL: ${modelName.toUpperCase()}

${shapeDesc}

- The pool shape must match the pool reference image or images exactly
- Do not invent a different pool shape
- Preserve exact proportions, rounded corners, shell details, and integrated steps visible in the pool references
- Size: ${size} meters
- The pool must be realistically scaled and clearly smaller than the house
- The pool must occupy roughly 20–25% of the visible open garden area
- Leave at least 2–3 meters of visible space from garden boundaries, trees, fences, paths, and buildings

---

RULE 3 — BEST GARDEN PLACEMENT:

Choose the most attractive and realistic placement automatically, as a professional landscape architect and real-estate photographer would.

- Find the clearest, largest, least obstructed open lawn area
- Keep the best sightline between the pool and the house
- Do not overlap swings, furniture, hot tubs, trees, paths, hedges, walls, or other existing objects
- Prefer a location close to the main patio, terrace, or garden-facing side of the house
- Angle the pool naturally with the camera perspective and ground perspective
- Frame both the house and pool beautifully in the same photograph
- Avoid placing the pool too close to the camera unless that is the only realistic open area
- Match the original photo’s perspective, scale, lighting, shadows, and time of day

---

RULE 4 — POOL WATER:

- Clear, realistic bright-blue fiberglass pool water
- Natural water depth, reflections, light shimmer, and tonal variation
- The interior must visibly descend into the ground
- Photorealistic premium installation only

---

${
  ceramicColor
    ? `
RULE 5 — CERAMIC TILE SURROUND (MANDATORY):

Add a ceramic tile walkway around all four sides of the pool.

- Tile color MUST be: ${ceramicColor.name}
- Ignore the turquoise color of the ceramic reference image completely
- The reference image is ONLY for tile geometry, rectangular format, layout, and grout
- Each tile MUST be rectangular: 33cm x 66cm, exact 2:1 ratio
- NEVER use square 60x60 tiles
- Exactly 2 rows of tiles around all sides
- Long side of each tile runs parallel to the nearest pool edge
- Total surround width: 66cm
- Straight installation rows with realistic 2–3mm grout lines
- Tiles sit flush with the surrounding ground, never elevated
- The ceramic surround replaces grass directly around the pool
- Use a clean, premium, professional installation

MANDATORY: Rectangular 33x66 ceramic tiles in ${ceramicColor.name} color.
`
    : deckColor
      ? `
RULE 5 — COMPOSITE DECK SURROUND (MANDATORY):

Add a composite wood deck around all four sides of the pool.

- Deck color: ${deckColor.name}
- Exactly 3 deck boards on each side
- Each board is 20cm wide; total surround width is 60cm
- Boards run parallel to the nearest pool edge
- Deck sits flush with ground level, never raised
- Tight realistic board gaps
- The deck replaces grass directly around the pool
`
      : `
RULE 5 — NO SURROUND MATERIAL:

The existing ground must meet the pool edge directly.

- Do not add ceramic, tile, pavers, stone, deck, walkway, or border
- Do not add a wide white coping
- Only a very thin realistic pool rim may be visible
`
}

${
  config.hasStairs
    ? `
RULE 6 — STAINLESS STEEL LADDER (MANDATORY):

- Include one realistic polished stainless-steel 3-step pool ladder
- Place it on one short end of the pool
- Steps descend naturally into the pool water
`
    : ""
}

${
  config.hasWaterfall
    ? `
RULE 7 — WATERFALL BLADE (MANDATORY):

- Include one small, elegant stainless-steel cobra waterfall blade
- Approximately 35cm wide and 40cm high
- Mount directly on the pool coping edge on one long side
- Water flows as a smooth sheet into the pool
`
    : ""
}

---

ABSOLUTE PROHIBITIONS:

- No above-ground pool
- No visible pool walls above ground
- No wrong pool shape
- No square tiles when ceramic is selected
- No turquoise ceramic color unless Turkuaz is the selected ceramic color
- No blocking the house or important garden elements
- No changes to buildings, trees, paths, fences, or landscaping
- No illustration, cartoon, CGI, or 3D-render style
- Output must be a realistic photograph only
`.trim();
}