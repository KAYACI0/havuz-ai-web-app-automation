import type { ClientConfig } from "./config-types";

export interface PoolConfig {
  model: string;
  size: string;
  deck?: string;
  ceramic?: string;
  hasWaterfall?: boolean;
  hasStairs?: boolean;
  stairType?: "corner" | "wide";
  orientation?: "horizontal" | "vertical" | "diagonal";
}

export interface PromptImageReferences {
  gardenIndex: number;
  poolPrimaryIndex: number;
  poolSecondaryIndex?: number;
  ceramicIndex?: number;
  waterfallIndex?: number;
  stairIndex?: number;
}

export function buildPoolPrompt(
  config: PoolConfig,
  clientConfig: ClientConfig,
  refs: PromptImageReferences
): string {
  const { model, size, ceramic, deck } = config;

  const poolModel = clientConfig.pool_models.find((m) => m.id === model);
  const modelName = poolModel?.name || model;

  const shapeDesc =
    poolModel?.prompt_description ||
    poolModel?.description ||
    `${model} fiberglass pool model`;

  const deckColor = deck
    ? clientConfig.deck_colors.find((d) => d.id === deck)
    : null;

  const ceramicColor = ceramic
    ? clientConfig.ceramic_colors.find((c) => c.id === ceramic)
    : null;

  const referenceGuide: string[] = [
    `Image ${refs.gardenIndex}: Customer garden photo. Main scene to place the pool.`,
    `Image ${refs.poolPrimaryIndex}: Primary reference for internal shell shape, inner steps, and curves of ${modelName}.`,
  ];

  if (refs.poolSecondaryIndex) {
    referenceGuide.push(
      `Image ${refs.poolSecondaryIndex}: Secondary angle reference for inner pool shell geometry and step placement.`
    );
  }

  if (refs.ceramicIndex && ceramicColor) {
    referenceGuide.push(
      `Image ${refs.ceramicIndex}: Ceramic layout reference. Copy ONLY its tile grid/geometry. DO NOT copy its reference color.`
    );
  }

  if (refs.waterfallIndex && config.hasWaterfall) {
    referenceGuide.push(
      `Image ${refs.waterfallIndex}: Waterfall reference. Replicate this exact waterfall design on the pool edge.`
    );
  }

  if (refs.stairIndex && config.hasStairs) {
    referenceGuide.push(
      `Image ${refs.stairIndex}: Ladder/stair reference. Install this exact style.`
    );
  }

  // CERAMIC & SURROUND RULES (MAX 1-2 ROWS / SLIM BORDER)
  const surroundRule = ceramicColor
    ? `
RULE 5 - NARROW CERAMIC TILE BORDER (STRICT LIMIT)

Install a SLIM ceramic tile border around the pool rim.
- Tile color MUST BE EXACTLY "${ceramicColor.name}".
- BORDER WIDTH: EXACTLY 1 OR 2 ROWS OF TILES MAXIMUM (approx 15-30 cm total width).
- DO NOT COVER THE GARDEN. Do NOT create a large tiled patio or wide floor platform.
- Surface Level: Tile top surface MUST be 100% flush with the surrounding grass/lawn plane. Zero height difference.
- Grass edge connects directly and naturally to this narrow tile border at the exact same ground level.
${
  refs.ceramicIndex
    ? `- CRITICAL: Ignore any blue or turquoise color present in Image ${refs.ceramicIndex}. Render tiles strictly in "${ceramicColor.name}".`
    : ""
}
`
    : deckColor
    ? `
RULE 5 - NARROW COMPOSITE DECK BORDER - MANDATORY

Install a slim composite wood deck border around the pool rim.
- Deck color MUST BE EXACTLY "${deckColor.name}".
- Use parallel deck boards recessed flush into the ground.
- Deck top surface MUST be at the exact same ground height as the surrounding grass.
- Absolutely NO raised platform, no visible deck thickness, no bottom gap or shadow.
`
    : `
RULE 5 - NO EXTRA SURROUND

- Grass/ground meets the thin pool coping directly.
- No raised walls, pavers, or elevated platforms.
`;

  // ORIENTATION RULES (NO DIAGONALS)
  const orientationText = config.orientation
    ? config.orientation === "horizontal"
      ? "Align pool long axis strictly HORIZONTAL (0 degrees) parallel to the main house or garden axis."
      : config.orientation === "vertical"
      ? "Align pool long axis strictly VERTICAL (90 degrees) perpendicular to the house facade."
      : "Align pool long axis strictly parallel or perpendicular to the dominant garden lines. NO SLANTED TILTS."
    : "Align pool length strictly parallel (0°) or perpendicular (90°) to the house facade or main garden axis.";

  return `
You are a professional architectural visualization AI expert in pool construction rendering.

TASK: Place the selected in-ground luxury fiberglass pool into the clear lawn area of the customer garden (Image ${refs.gardenIndex}).

REFERENCE IMAGE MAPPING:
${referenceGuide.map((line) => `- ${line}`).join("\n")}

---

RULE 1 - ORIGINAL SCENE INTEGRATION
- Preserve house, patio, furniture, trees, fences, and walls from Image ${refs.gardenIndex}.
- Embed pool seamlessly into the largest open lawn area without blocking doors or pathways.

RULE 2 - POOL MODEL REPRODUCTION (${modelName.toUpperCase()})
- Model Details: ${shapeDesc}.
- IGNORE THE EXTERNAL BLACK FIBERGLASS SHELL / OUTER BOX visible in Image ${refs.poolPrimaryIndex}${refs.poolSecondaryIndex ? ` and Image ${refs.poolSecondaryIndex}` : ""}.
- Replicate ONLY the inner blue pool contours, internal entry steps, and top lip/rim shape.
- Pool Dimensions: ${size} meters.

RULE 3 - STRICT PERPENDICULAR ALIGNMENT (ABSOLUTELY NO DIAGONALS)
- ${orientationText}
- STRICTLY FORBIDDEN: NEVER place the pool at random or arbitrary diagonal tilts (e.g., 15°, 30°, 45°, 60°).
- Pool, border tiles, waterfall, and ladder MUST share the exact same 0° or 90° axis.

RULE 4 - 100% IN-GROUND FLUSH CONSTRUCTION (MANDATORY)
- Pool is fully EXCAVATED and embedded INTO the ground.
- Water level and top coping rim MUST be completely FLUSH with the surrounding lawn plane.
- ZERO ABOVE-GROUND WALLS: Absolute zero visible fiberglass height above grass.
- No raised platforms, no step-up boxes, no floating gaps or bottom shadows.

${surroundRule}

${
  config.hasWaterfall && refs.waterfallIndex
    ? `
RULE 6 - WATERFALL BLADE
- Install a stainless steel cobra waterfall blade matching Image ${refs.waterfallIndex} on the main pool coping edge.
- Water flows smoothly into the pool.
`
    : ""
}

${
  config.hasStairs && refs.stairIndex
    ? `
RULE 7 - STAINLESS STEEL LADDER / STEPS
- Install a stainless steel pool ladder / step entry matching Image ${refs.stairIndex}.
- Steps descend smoothly into the water inside the shell.
`
    : ""
}

PHOTOREALISM REQUIREMENTS:
- Crystal-clear blue water reflections matching garden sunlight.
- Clean soil/grass borders meeting the pool edge with zero gap.
- High-end architectural rendering quality.
`.trim();
}