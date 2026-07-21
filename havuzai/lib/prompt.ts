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

  // MODEL GEOMETRİSİ VE DAHİLİ BASAMAK/OTURMA ALANI KURALI
  let modelSpecificDesc = poolModel?.prompt_description || poolModel?.description || `${model} fiberglass pool model`;

  if (isRoma) {
    modelSpecificDesc = `
STRICT ROMA MODEL GEOMETRY & BUILT-IN STEPS:
- Capsule/stadium shape with TWO FULLY SEMICIRCLE ROUNDED SHORT ENDS.
- Broad Roman entry steps PERMANENTLY MOLDED INSIDE one of the rounded ends under the water.
- FORBIDDEN: Do NOT draw sharp rectangular corners.
`;
  } else if (isRelax) {
    modelSpecificDesc = `
STRICT RELAX MODEL GEOMETRY & INTEGRATED STEPS/BENCH:
- Exact shell structure from Image ${refs.poolPrimaryIndex}.
- MUST INCLUDE THE INTEGRATED UNDERWATER ENTRY STEPS AND RELAXATION SEATING BENCH inside the blue pool shell as shown in Image ${refs.poolPrimaryIndex}.
- Clean submerged fiberglass lines, no generic deep box without steps.
`;
  }

  const deckColor = deck
    ? clientConfig.deck_colors.find((d) => d.id === deck)
    : null;

  const ceramicColor = ceramic
    ? clientConfig.ceramic_colors.find((c) => c.id === ceramic)
    : null;

  const referenceGuide: string[] = [
    `Image ${refs.gardenIndex}: Customer garden background. Place pool naturally into the deep central area of this lawn.`,
    `Image ${refs.poolPrimaryIndex}: EXACT ${modelName.toUpperCase()} POOL MODEL STRUCTURE. Copy its exact internal steps, curves, and seating benches.`,
  ];

  if (refs.poolSecondaryIndex) {
    referenceGuide.push(
      `Image ${refs.poolSecondaryIndex}: Secondary angle for internal pool shell depth and step details.`
    );
  }

  if (refs.ceramicIndex && ceramicColor) {
    referenceGuide.push(
      `Image ${refs.ceramicIndex}: CERAMIC TILE PATTERN REFERENCE. Copy its rectangular/grid ceramic tile texture and fine grout lines.`
    );
  }

  if (refs.waterfallIndex && config.hasWaterfall) {
    referenceGuide.push(
      `Image ${refs.waterfallIndex}: STAINLESS STEEL WATERFALL REFERENCE.`
    );
  }

  // SERAMİK & YÜRÜYÜŞ ALANI (RECTANGULAR TILE LAYOUT)
  const surroundRule = ceramicColor
    ? `
RULE 4 - RECTANGULAR CERAMIC TILE SURROUND (1.2 METERS WIDE) - MANDATORY

Install a 1.2-meter wide ceramic tile walkway surrounding all sides of the pool.
- MATERIAL & PATTERN: Professional outdoor ceramic tiles with realistic fine grout lines matching Image ${refs.ceramicIndex || refs.poolPrimaryIndex}.
- FORBIDDEN: Do NOT draw large chunky square bathroom/concrete slabs. Use elegant rectangular tile layout.
- TILE COLOR: STRICTLY "${ceramicColor.name}".
- ELEVATION: 100% flush with the lawn level (zero raised step-ups, zero height difference).
`
    : deckColor
    ? `
RULE 4 - COMPOSITE DECK SURROUND (1.2 METERS WIDE)

Install a 1.2-meter wide composite wood deck walkway around all sides of the pool.
- COLOR: STRICTLY "${deckColor.name}".
- Flush with the ground level.
`
    : `
RULE 4 - NO EXTRA SURROUND
- Grass meets the pool edge directly.
`;

  // ŞELALE
  const waterfallRule = (config.hasWaterfall && refs.waterfallIndex)
    ? `
RULE 5 - STAINLESS STEEL COBRA WATERFALL
- Install a stainless steel cobra waterfall feature mounted on the long side edge of the pool.
- Water pouring smoothly into the pool.
`
    : "";

  return `
You are an expert architectural visualization AI specializing in residential pool placement renders.

TASK: Integrate the selected in-ground pool model (${modelName.toUpperCase()}) perfectly into the garden of Image ${refs.gardenIndex}.

REFERENCE MAPPING:
${referenceGuide.map((line) => `- ${line}`).join("\n")}

---

CRITICAL RULE 1 - PERFECT GARDEN PLACEMENT & PERSPECTIVE
- Position the pool in the MAIN CENTRAL OPEN LAWN AREA of Image ${refs.gardenIndex} with realistic spatial perspective.
- Do NOT slam the pool in the extreme foreground camera angle. Set it naturally in the middle of the garden.
- Keep the house, background trees, hedges, and lawn in perfect proportion.

CRITICAL RULE 2 - MODEL SHAPE & INTERNAL STEPS (${modelName.toUpperCase()})
- ${modelSpecificDesc}
- COPY THE EXACT SILHOUETTE, INTERNAL CORNERS, ENTRY STEPS, AND SHELL GEOMETRY FROM Image ${refs.poolPrimaryIndex}.
- IGNORE the outer black structural box from references. Render ONLY the submerged blue shell.
- Dimensions: ${size} meters.

CRITICAL RULE 3 - 100% IN-GROUND FLUSH MOUNT
- Pool rim and surround tiles are completely buried and FLUSH with the grass plane. Zero above-ground height.

${surroundRule}

${waterfallRule}

CRITICAL RULE 6 - STRICT ALIGNMENT
- Align pool long axis strictly PARALLEL (0°) or PERPENDICULAR (90°) to the background hedges/house in Image ${refs.gardenIndex}.
- NO SLANTED OR DIAGONAL TILTS.

PHOTOREALISM STANDARDS:
- Realistic pool water transparency showing the internal submerged entry steps and seating benches clearly.
- Seamless blend between the grass lawn and the 1.2m ceramic tile border.
`.trim();
}