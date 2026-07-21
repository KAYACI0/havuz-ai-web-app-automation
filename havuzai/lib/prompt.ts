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

  const modelUpper = model.toUpperCase();
  const isRoma = modelUpper.includes("ROMA");
  const isRelax = modelUpper.includes("RELAX");

  let modelSpecificDesc = poolModel?.prompt_description || poolModel?.description || `${model} fiberglass pool model`;

  if (isRoma) {
    modelSpecificDesc = `
STRICT ROMA MODEL SHAPE & INTEGRATED ENTRY STEPS:
- Stadium / Pill shape with TWO SEMICIRCULAR ROUNDED SHORT ENDS and straight parallel long sides.
- INTEGRATED UNDERWATER STEPS: Replicate the EXACT built-in Roman entry steps from Image ${refs.poolPrimaryIndex}.
- Step Structure: Wide, smooth underwater platforms descending gradually inside the pool shell at one rounded short end.
- IGNORE THE ANGLED PERSPECTIVE OF Image ${refs.poolPrimaryIndex}. Extract ONLY the inner shell geometry, NOT its angle.
`;
  } else if (isRelax) {
    modelSpecificDesc = `
STRICT RELAX GEOMETRY & BUILT-IN BENCH:
- Exact rectangular inner shell structure, internal steps, and relaxation seating bench from Image ${refs.poolPrimaryIndex}.
`;
  }

  const deckColor = deck
    ? clientConfig.deck_colors.find((d) => d.id === deck)
    : null;

  const ceramicColor = ceramic
    ? clientConfig.ceramic_colors.find((c) => c.id === ceramic)
    : null;

  const referenceGuide: string[] = [
    `Image ${refs.gardenIndex}: Customer garden background. Main scene.`,
    `Image ${refs.poolPrimaryIndex}: Structural reference for ${modelName.toUpperCase()} shell interior shape and steps ONLY. DO NOT COPY ITS CAMERA ANGLE.`,
  ];

  if (refs.poolSecondaryIndex) {
    referenceGuide.push(
      `Image ${refs.poolSecondaryIndex}: Secondary angle for internal shell depth.`
    );
  }

  if (refs.ceramicIndex && ceramicColor) {
    referenceGuide.push(
      `Image ${refs.ceramicIndex}: 33x66 CM CERAMIC TILE PATTERN REFERENCE.`
    );
  }

  if (refs.waterfallIndex && config.hasWaterfall) {
    referenceGuide.push(
      `Image ${refs.waterfallIndex}: STAINLESS STEEL WATERFALL REFERENCE.`
    );
  }

  // SURROUND RULE (33x66 CERAMIC OR REAL DECK - 1.2M WIDE & NO BLUE FRAME)
  const surroundRule = ceramicColor
    ? `
RULE 4 - 33x66 CM CERAMIC TILE SURROUND (1.2 METERS WIDE)
- Construct a 1.2-meter wide ceramic tile border around the pool coping.
- EXACT TILE SIZE & PATTERN: Use 33x66 cm rectangular porcelain/ceramic outdoor tiles laid in a modern offset grid pattern with fine grout lines.
- TILE COLOR: STRICTLY "${ceramicColor.name}".
- FLUSH INTEGRATION: Tiles overlap the fiberglass lip completely. Absolutely NO bright blue fiberglass frame visible around the water.
- 100% IN-GROUND FLUSH: Recessed seamlessly into the lawn (0 cm height difference, zero vertical riser walls).
`
    : deckColor
    ? `
RULE 4 - REAL WOODEN COMPOSITE DECK SURROUND (1.2 METERS WIDE)
- Construct a REAL 1.2-meter wide composite wooden deck border around the pool rim.
- DECK COLOR: STRICTLY "${deckColor.name}".
- DECK BOUNDARY: The deck border MUST END EXACTLY 1.2 METERS from the pool edge. Do NOT cover the entire garden with wood.
- NO BLUE LIP / NO PLASTIC FRAME: Wood planks MUST go directly to the water's edge. Absolutely NO bright blue fiberglass frame visible around the water.
- REALISTIC TEXTURE: Realistic wooden deck boards recessed FLUSH into the lawn (0 cm height difference, no fake flat mat look, natural shadows at grass edges).
`
    : `
RULE 4 - NO EXTRA SURROUND
- Grass meets pool edge directly.
`;

  const waterfallRule = (config.hasWaterfall && refs.waterfallIndex)
    ? `
RULE 5 - STAINLESS STEEL COBRA WATERFALL
- Mount a stainless steel cobra waterfall feature on the long side coping edge pouring water into the pool.
`
    : "";

  return `
You are a world-class architectural rendering AI specialized in realistic in-ground pool visualizer outputs.

TASK: Digitally excavate the lawn in Image ${refs.gardenIndex} and embed the selected in-ground pool model (${modelName.toUpperCase()}).

REFERENCE MAPPING:
${referenceGuide.map((line) => `- ${line}`).join("\n")}

---

CRITICAL RULE 1 - STRICT PARALLEL GRID ALIGNMENT (NO SLANTED ANGLE)
- THE POOL AND DECK/TILES MUST BE PLACED PERFECTLY HORIZONTAL (0 DEGREES) PARALLEL TO THE BACK HEDGE/HOUSE IN Image ${refs.gardenIndex}.
- ABSOLUTELY FORBIDDEN: DO NOT TILT OR ROTATE THE POOL AT DIAGONAL ANGLES (No 15°, 30°, 45° angles).
- OVERRIDE PERSPECTIVE: Completely ignore the camera angle/perspective of Image ${refs.poolPrimaryIndex}. Use the camera angle of Image ${refs.gardenIndex} ONLY.

CRITICAL RULE 2 - 100% EXCAVATED IN-GROUND (ZERO ELEVATION & FLUSH WITH LAWN)
- THE POOL AND SURROUND ARE FULLY EXCAVATED AND BURIED INTO THE SOIL.
- ZERO ELEVATION / NO RAISED PLATFORM: The top surface of the deck or tiles sits EXACTLY AT GROUND LEVEL (0 cm height) flush with the lawn.
- ABSOLUTELY FORBIDDEN:
  1. DO NOT draw any vertical wooden box edges, concrete risers, or platform side-walls.
  2. DO NOT make the pool look like an above-ground box sitting on top of the grass.
- LAWN TRANSITION: Grass blades touch the horizontal border surface directly with zero vertical gap or wall height.

CRITICAL RULE 3 - MODEL SHAPE & INTERNAL STEPS (${modelName.toUpperCase()})
- ${modelSpecificDesc}
- COPY ONLY THE INTERNAL SHELL SHAPE AND STEPS FROM Image ${refs.poolPrimaryIndex}.
- FORBIDDEN: Do NOT draw external metal ladders. The entry steps MUST be internal platforms inside the shell.

CRITICAL RULE 4 - NO BLUE FIBERGLASS LIP / PLASTIC RIM
- The surrounding wood deck or tiles overlap the fiberglass lip directly at the water boundary.
- FORBIDDEN: Do NOT draw a light-blue plastic border surrounding the water inside the surround.

${surroundRule}

${waterfallRule}

PHOTOREALISM STANDARDS:
- High-end architectural rendering with natural daylight shadows.
- Realistic water depth transparency revealing internal steps.
- Natural grass-to-border flush edge integration.
`.trim();
}