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

  const deckColor = deck
    ? clientConfig.deck_colors.find((d) => d.id === deck)
    : null;

  const ceramicColor = ceramic
    ? clientConfig.ceramic_colors.find((c) => c.id === ceramic)
    : null;

  const referenceGuide: string[] = [
    `Image ${refs.gardenIndex}: Background garden. Place the pool in the OPEN CENTRAL LAWN area in the middle of the garden.`,
    `Image ${refs.poolPrimaryIndex}: EXACT POOL MODEL (${modelName}). COPY ITS EXACT SILHOUETTE, SHELL CONTOURS, CURVES, AND INTERNAL BUILT-IN STEPS.`,
  ];

  if (refs.poolSecondaryIndex) {
    referenceGuide.push(
      `Image ${refs.poolSecondaryIndex}: Secondary angle for internal steps and pool depth.`
    );
  }

  if (refs.ceramicIndex && ceramicColor) {
    referenceGuide.push(
      `Image ${refs.ceramicIndex}: Ceramic border texture and mosaic pattern reference.`
    );
  }

  if (refs.waterfallIndex && config.hasWaterfall) {
    referenceGuide.push(
      `Image ${refs.waterfallIndex}: Cobra waterfall feature to install on the side coping.`
    );
  }

  const surroundRule = ceramicColor
    ? `
BORDER & SURROUND:
- Add a 1.2-meter wide ceramic border flush with the lawn around the pool edge.
- Tile color MUST BE "${ceramicColor.name}".
- Natural mosaic/ceramic texture matching Image ${refs.ceramicIndex || refs.poolPrimaryIndex}. No huge unnatural bathroom floor tiles.
`
    : deckColor
    ? `
BORDER & SURROUND:
- Add a 1.2-meter wide composite deck border flush with the lawn.
- Deck color MUST BE "${deckColor.name}".
`
    : `
BORDER & SURROUND:
- Grass directly touches the thin pool edge coping.
`;

  const waterfallRule = (config.hasWaterfall && refs.waterfallIndex)
    ? `
WATERFALL FEATURE:
- Place a stainless steel cobra waterfall feature (from Image ${refs.waterfallIndex}) on one of the side edges pouring water into the pool.
`
    : "";

  return `
Photorealistic architectural edit: Install an in-ground fiberglass pool into the garden of Image ${refs.gardenIndex}.

INPUT REFERENCES:
${referenceGuide.map((line) => `- ${line}`).join("\n")}

STRICT INSTRUCTIONS:

1. POOL MODEL & SHAPE (${modelName.toUpperCase()}):
- MUST EXACTLY COPY the pool shell shape, outer curves, and internal built-in entry steps from Image ${refs.poolPrimaryIndex}.
- DO NOT draw a generic rectangle! Render the exact ${modelName} model design, including all internal seating/steps beneath the water surface.
- Ignore outer black fiberglass casings; render only the submerged blue pool shell.
- Dimensions: ${size} meters.

2. GARDEN POSITIONING & PERSPECTIVE:
- Embed the pool naturally into the CENTER/MIDDLE OF THE LAWN area in Image ${refs.gardenIndex}.
- DO NOT place the pool right at the bottom edge or foreground of the frame.
- Align the pool parallel/perpendicular to the main garden landscape (no weird diagonal skews).

3. IN-GROUND INTEGRATION:
- 100% in-ground installation. Water and top rim are completely flush with the grass plane. Zero raised walls or platforms.

${surroundRule}
${waterfallRule}

OUTPUT QUALITY:
- Ultra-realistic lighting, natural water transparency showing the built-in steps clearly, seamless grass-to-tile blending.
`.trim();
}