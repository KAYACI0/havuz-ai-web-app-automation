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
    `${model} fiberglass pool`;

  const deckColor = deck
    ? clientConfig.deck_colors.find((d) => d.id === deck)
    : null;

  const ceramicColor = ceramic
    ? clientConfig.ceramic_colors.find((c) => c.id === ceramic)
    : null;

  const referenceGuide: string[] = [
    `Image ${refs.gardenIndex}: Customer garden photo. Main scene to place the pool.`,
    `Image ${refs.poolPrimaryIndex}: Primary structural reference for ${modelName} pool shape.`,
  ];

  if (refs.poolSecondaryIndex) {
    referenceGuide.push(
      `Image ${refs.poolSecondaryIndex}: Secondary angle/depth reference for ${modelName} pool shell, curves, internal steps, and proportions.`
    );
  }

  if (refs.ceramicIndex && ceramicColor) {
    referenceGuide.push(
      `Image ${refs.ceramicIndex}: Ceramic layout and tile pattern reference. Copy ONLY its tile geometry, rows, and grout layout. DO NOT copy its reference color.`
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

  const surroundRule = ceramicColor
    ? `
RULE 5 - CERAMIC TILE SURROUND - MANDATORY

Install a professional ceramic tile border on all four sides of the pool.

- Tile color MUST BE EXACTLY "${ceramicColor.name}".
- Surround width: exactly 2 rows of ceramic tiles around the pool rim.
- Tile Layout: Match the tile ratio, row placement, and grout grid of Image ${refs.ceramicIndex || refs.poolPrimaryIndex}.
- Surface Level: The ceramic top surface MUST be 100% flush with the surrounding lawn/soil.
- No Elevation: Zero raised edges, zero platform steps, zero visible side thickness, zero shadows under tiles.
- Grass edge connects naturally with the ceramic border at the exact same ground level.
${
  refs.ceramicIndex
    ? `- CRITICAL: Ignore any blue or turquoise color present in Image ${refs.ceramicIndex}. Render tiles strictly in "${ceramicColor.name}".`
    : ""
}
`
    : deckColor
    ? `
RULE 5 - COMPOSITE DECK SURROUND - MANDATORY

Install a composite wood deck surround on all four sides of the pool.

- Deck color MUST BE EXACTLY "${deckColor.name}".
- Use parallel deck boards recessed flush into the ground.
- Deck top surface MUST be at the exact same ground height as the surrounding grass.
- Absolutely NO raised platform, no visible deck thickness, no side fascia, no bottom gap or shadow.
`
    : `
RULE 5 - NO EXTRA SURROUND

- Grass/ground meets the thin pool coping directly.
- No raised walls or elevated deck/pavers.
`;

  const orientationText = config.orientation
    ? config.orientation === "horizontal"
      ? "Align pool long axis perfectly HORIZONTAL (0 degrees)."
      : config.orientation === "vertical"
      ? "Align pool long axis perfectly VERTICAL (90 degrees)."
      : "Align pool long axis at exactly 45 DEGREES."
    : "Align pool length parallel to the house facade or main garden axis. Strictly pick 0, 45, or 90 degrees.";

  return `
You are a professional architectural visualization AI expert in pool construction rendering.

TASK: Place the selected in-ground luxury fiberglass pool into the clear lawn area of the customer garden (Image ${refs.gardenIndex}).

REFERENCE IMAGE MAPPING:
${referenceGuide.map((line) => `- ${line}`).join("\n")}

---

RULE 1 - ORIGINAL SCENE INTEGRATION
- Preserve house, patio, furniture, trees, fences, and walls from Image ${refs.gardenIndex}.
- Embed pool into the largest open, central lawn area without blocking doors or pathways.

RULE 2 - POOL MODEL (${modelName.toUpperCase()})
- ${shapeDesc}
- Match structural shape, shell geometry, corners, and internal steps from Image ${refs.poolPrimaryIndex}${
    refs.poolSecondaryIndex ? ` and Image ${refs.poolSecondaryIndex}` : ""
  }.
- Pool Dimensions: ${size} meters.

RULE 3 - ORIENTATION & ALIGNMENT
- ${orientationText}
- Forbidden: Random or arbitrary diagonal tilts (e.g. 15°, 30°, 60°).
- Pool, deck/tiles, waterfall, and ladder must share the exact same axis.

RULE 4 - IN-GROUND FLUSH CONSTRUCTION (MANDATORY)
- Pool is fully EXCAVATED and embedded INTO the ground.
- Water level and pool coping are flush with the lawn plane.
- ABSOLUTELY NO above-ground pool walls, raised decks, steps up, platform thickness, or floating gaps.

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
- Sharp architectural details, natural soil/grass borders, photo-realistic output.
`.trim();
}