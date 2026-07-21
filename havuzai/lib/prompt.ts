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
    `${model} fiberglass pool`;

  const deckColor = deck
    ? clientConfig.deck_colors.find((d) => d.id === deck)
    : null;

  const ceramicColor = ceramic
    ? clientConfig.ceramic_colors.find((c) => c.id === ceramic)
    : null;

  // Seramik referansı yalnız form, ölçü, derz ve döşeme düzeni içindir.
  const ceramicLayoutRef = clientConfig.ceramic_colors.find(
    (color) => color.reference_image_url
  )?.reference_image_url;

  const hasCeramicReference = Boolean(ceramicColor && ceramicLayoutRef);

  let imageNumber = 3;

  const referenceGuide = [
    "Image 1: Customer garden photo. This is the only scene to edit.",
    `Image 2: ${modelName} pool reference. This is the exact primary pool shape reference.`,
  ];

  if (poolModel?.reference_image_url_2) {
    referenceGuide.push(
      `Image ${imageNumber}: Second ${modelName} pool reference. Use it to confirm the exact silhouette, curves, corners, shell details, internal steps and proportions.`
    );
    imageNumber++;
  }

  if (hasCeramicReference) {
    referenceGuide.push(
      `Image ${imageNumber}: Ceramic installation reference. Use ONLY its rectangular tile format, tile ratio, tile rows and grout pattern. Never copy its turquoise color.`
    );
    imageNumber++;
  }

  if (config.hasWaterfall) {
    referenceGuide.push(
      `Image ${imageNumber}: Waterfall reference. Use this exact waterfall style.`
    );
    imageNumber++;
  }

  if (config.hasStairs && clientConfig.features?.stair_reference_url) {
    referenceGuide.push(
      `Image ${imageNumber}: Ladder reference. Use this stainless-steel ladder style.`
    );
  }

  const surroundRule = ceramicColor
    ? `
RULE 5 - CERAMIC TILE SURROUND - MANDATORY

Install a ceramic tile surround on all four sides of the pool.

- Tile color MUST be ${ceramicColor.name}.
- Use exactly 2 rows of ceramic tiles around every pool side.
- Every tile MUST be a 33cm x 66cm RECTANGLE with an exact 2:1 ratio.
- Never use square tiles, 60x60 tiles, pavers or irregular stones.
- The 66cm long side of every tile runs parallel to the nearest pool edge.
- Total ceramic surround width is exactly 66cm.
- Use thin, realistic 2-3mm grout lines.
- The ceramic surface MUST be perfectly flush with the surrounding grass and soil.
- The ceramic is built into the terrain, not laid on top of the lawn.
- There must be NO raised ceramic edge, vertical side, step, platform, visible thickness, shadow underneath or floating appearance.
- Grass must naturally meet the ceramic edge at the same height.
${
  hasCeramicReference
    ? `
- The ceramic reference image is ONLY for tile geometry, tile rows and grout.
- Ignore turquoise color from the reference completely.
- Apply ${ceramicColor.name} color instead.
`
    : ""
}
`
    : deckColor
      ? `
RULE 5 - COMPOSITE DECK SURROUND - MANDATORY

Install a composite wood deck around all four sides of the pool.

- Deck color MUST be ${deckColor.name}.
- Use exactly 3 deck boards around every pool side.
- Every board is 20cm wide; total deck surround width is 60cm.
- Deck boards run parallel to the nearest pool edge.
- Deck boards and pool must use the exact same orientation.
- The deck top surface MUST be exactly flush with the surrounding grass and soil.
- The deck is recessed into the terrain, never installed above the lawn.
- There must be NO visible deck side, fascia, deck thickness, vertical platform edge, gap, step, shadow below the deck or floating appearance.
- Grass must naturally meet the deck edge at the same height.
- The deck must look permanently built into the ground.
`
      : `
RULE 5 - NO SURROUND MATERIAL

- Existing grass or ground meets the pool edge directly.
- Do not add ceramic, tile, pavers, stone, deck, walkway or border.
- Do not create raised edges, platforms or visible pool exterior walls.
- Only a very thin realistic pool coping may be visible.
`;

  return `
You are a professional architectural visualization AI.

Place the selected luxury fiberglass swimming pool into the customer garden photo. The output must be a realistic professional photograph of a permanently built pool installation.

REFERENCE IMAGES:
${referenceGuide.map((line) => `- ${line}`).join("\n")}

---

RULE 1 - PRESERVE THE ORIGINAL SCENE

Keep the original garden photo unchanged except for the pool installation.

- Do not change, remove, move or redesign the house, roof, windows, patio, doors, trees, hedges, fences, walls, paths, furniture or landscaping.
- Only add the selected pool and its selected deck or ceramic surround.
- Do not block the house facade, patio, garden doors or the main view of the property.
- Do not place the pool on paths, under trees, against fences or over existing objects.

---

RULE 2 - EXACT SELECTED POOL MODEL: ${modelName.toUpperCase()}

${shapeDesc}

- The final pool MUST match the selected ${modelName} reference image or images exactly.
- Do not invent a different pool shape.
- Do not mix Roma and Relax shapes.
- Preserve the exact silhouette, corners, curves, width-to-length ratio, shell shape and integrated step form from the selected model reference.
- The selected model reference has priority over generic pool design assumptions.
- Pool size: ${size} meters.
- Keep the pool realistically scaled and visibly smaller than the house.
- The pool should occupy about 20-25% of the usable visible lawn area.
- Keep clear open space around the pool; do not crowd garden boundaries.

---

RULE 3 - ORIENTATION - ABSOLUTELY MANDATORY

The pool orientation must NEVER be random.

Measure orientation relative to the photo frame:

- Allowed orientation 1: pool long axis perfectly HORIZONTAL, 0 degrees.
- Allowed orientation 2: pool long axis perfectly VERTICAL, 90 degrees.
- Allowed orientation 3: pool long axis exactly 45 degrees.
- Choose only the orientation that best matches the garden composition.
- Prefer HORIZONTAL when the house facade is horizontal.
- Pool shell, deck, ceramic tiles, ladder and waterfall must all follow the exact same pool orientation.

ABSOLUTELY FORBIDDEN:
- Any arbitrary diagonal angle.
- Any angle between 1-44 degrees, 46-89 degrees, or other random rotation.
- A pool rotated differently from its deck or ceramic surround.

---

RULE 4 - BEST GARDEN PLACEMENT - MANDATORY

First identify the largest clear, buildable and unobstructed lawn area.

- Place the geometric center of the pool close to the visual center of that usable lawn area.
- Create a balanced composition: visible open space should remain around the left, right, front and back sides of the pool.
- Keep the pool centered and elegant in the garden, not randomly pushed into a corner.
- Keep a clean sightline between the pool and the house.
- Prefer the lawn area closest to the main patio, terrace or garden-facing side of the house.
- Do not place the pool too close to the camera, fence, tree, path, wall or garden boundary.
- Only move away from the lawn center if the center contains an existing object, path, tree or other obstruction.
- Maintain the original photo's realistic camera perspective, sunlight direction and shadows.

---

RULE 5 - PROFESSIONAL IN-GROUND INSTALLATION - ABSOLUTELY MANDATORY

This is a permanent IN-GROUND swimming pool installation.

- Excavate the ground before installing the pool, deck or ceramic.
- Pool water surface must be at the same level as the surrounding finished ground.
- Pool shell goes down into the earth.
- Only a thin realistic coping or rim may be visible at ground level.
- Surrounding grass, deck or ceramic must connect naturally to the pool.

ABSOLUTELY FORBIDDEN:
- Above-ground pool.
- Raised pool walls.
- Pool sitting on top of the lawn.
- Raised deck or raised ceramic.
- Visible deck side, platform edge, deck thickness or ceramic thickness.
- Gap, step, dark shadow under the deck, floating appearance or container appearance.

---

RULE 6 - REALISTIC WATER

- Clear premium bright-blue fiberglass pool water.
- Realistic water depth, light shimmer, reflections and subtle color variation.
- Pool interior visibly descends below ground.
- Match the garden photo lighting and shadow direction.
- Real photograph quality only.

---

${surroundRule}

${
  config.hasStairs
    ? `
RULE 7 - STAINLESS STEEL LADDER - MANDATORY

- Include one polished stainless-steel 3-step pool ladder.
- Mount it on one short end of the pool.
- Ladder steps descend naturally into the water.
- Ladder must follow the exact selected pool orientation.
`
    : ""
}

${
  config.hasWaterfall
    ? `
RULE 8 - WATERFALL BLADE - MANDATORY

- Include one elegant stainless-steel cobra waterfall blade.
- Approximately 35cm wide and 40cm high.
- Mount it directly on the pool coping edge on one long side.
- Water must flow as a smooth sheet into the pool.
- Waterfall must follow the selected pool orientation.
`
    : ""
}

---

ABSOLUTE PROHIBITIONS

- No wrong Roma or Relax shape.
- No arbitrary pool rotation.
- No pool angle other than exactly 0, 45 or 90 degrees.
- No floating pool, floating deck, floating ceramic or raised platform.
- No visible deck side, ceramic side, pool exterior wall or gap below the installation.
- No square tiles when ceramic is selected.
- No turquoise ceramic unless Turkuaz is the selected ceramic color.
- No placing the pool randomly in a corner when a clear centered lawn area exists.
- No blocked view of the house.
- No altered building, path, tree, fence or landscaping.
- No cartoon, illustration, CGI or generic 3D render style.
- Output must look like a real professional photograph.
`.trim();
}