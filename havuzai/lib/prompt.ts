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

  const isRoma = model.toUpperCase().includes("ROMA");

  // ROMA MODELİ İÇİN ULTRA KATI ŞEKİL VE MERDİVEN TANIMI
  const romaShapeDesc = `
STRICT ROMA POOL GEOMETRY & INTERNAL STEPS (NON-NEGOTIABLE):
- OVERALL SHAPE: CLASSIC ROMAN / CAPSULE / STADIUM SHAPE.
  * Two long sides MUST be straight and parallel.
  * BOTH SHORT ENDS MUST BE LARGE, PERFECT SEMICIRCLES (FULLY ROUNDED OVAL ENDS).
  * STRICTLY FORBIDDEN: ABSOLUTELY NO RECTANGULAR CORNERS, NO BOX SHAPES, NO SQUARE ENDS.
- INTEGRATED INTERNAL STEPS:
  * Inside ONE of the rounded semicircle ends, render the broad, built-in curved/wide Roman entry steps descending directly into the water matching Image ${refs.poolPrimaryIndex}.
  * These steps are PERMANENTLY MOLDED INSIDE the pool shell, NOT external, NOT stainless steel ladders.
- SHELL COLOR & BODY:
  * Render ONLY the clean blue interior shell and top rim submerged into the soil.
  * IGNORE completely the outer black fiberglass structural casing shown in reference photos.
`;

  const shapeDesc = isRoma
    ? romaShapeDesc
    : poolModel?.prompt_description || poolModel?.description || `${model} fiberglass pool model`;

  const deckColor = deck
    ? clientConfig.deck_colors.find((d) => d.id === deck)
    : null;

  const ceramicColor = ceramic
    ? clientConfig.ceramic_colors.find((c) => c.id === ceramic)
    : null;

  const referenceGuide: string[] = [
    `Image ${refs.gardenIndex}: Customer garden background scene.`,
    `Image ${refs.poolPrimaryIndex}: EXACT ROMA POOL MODEL REFERENCE. Copy its exact oval/capsule outline, rounded ends, and internal steps.`,
  ];

  if (refs.poolSecondaryIndex) {
    referenceGuide.push(
      `Image ${refs.poolSecondaryIndex}: Secondary structural angle for internal Roma steps and curved wall depth.`
    );
  }

  if (refs.ceramicIndex && ceramicColor) {
    referenceGuide.push(
      `Image ${refs.ceramicIndex}: CERAMIC TILE PATTERN REFERENCE. Copy ONLY its tile grid pattern and grout lines.`
    );
  }

  if (refs.waterfallIndex && config.hasWaterfall) {
    referenceGuide.push(
      `Image ${refs.waterfallIndex}: MANDATORY WATERFALL BLADE REFERENCE.`
    );
  }

  if (refs.stairIndex && config.hasStairs && !isRoma) {
    referenceGuide.push(
      `Image ${refs.stairIndex}: External ladder reference.`
    );
  }

  // 1.2 METRELİK SERAMİK ALANI (KATI YASAKLARLA)
  const surroundRule = ceramicColor
    ? `
RULE 4 - CERAMIC TILE SURROUND (EXACTLY 1.2 METERS WIDE) - MANDATORY

Construct a paved ceramic tile walkway surrounding the entire Roman pool edge.
- SURROUND WIDTH: EXACTLY 1.2 METERS WIDE (approx 4 feet wide flat walking deck around all edges).
- MATERIAL & TEXTURE: Real glazed ceramic tiles with clearly defined square tile grout lines matching Image ${refs.ceramicIndex || refs.poolPrimaryIndex}.
- TILE COLOR: MUST BE STRICTLY "${ceramicColor.name}".
- FORBIDDEN: Do NOT render plain gray granite/concrete slabs. It MUST be a visible grid of ceramic tiles.
- GROUND LEVEL: 100% flush with the lawn plane. Zero elevation, zero raised steps, zero floating platform.
`
    : deckColor
    ? `
RULE 4 - COMPOSITE DECK SURROUND (EXACTLY 1.2 METERS WIDE)

Construct a 1.2 meters wide composite wood deck walkway around all pool edges.
- COLOR: STRICTLY "${deckColor.name}".
- WIDTH: EXACTLY 1.2 METERS WIDE.
- Ground level flush.
`
    : `
RULE 4 - NO EXTRA SURROUND
- Grass meets the Roman pool rim directly.
`;

  // ŞELALE ZORUNLULUĞU
  const waterfallRule = (config.hasWaterfall && refs.waterfallIndex)
    ? `
RULE 5 - MANDATORY STAINLESS STEEL COBRA WATERFALL
- YOU MUST ADD A STAINLESS STEEL COBRA WATERFALL BLADE feature.
- LOCATION: Mount it on one of the LONG STRAIGHT SIDE EDGES of the Roman pool (NOT on top of the internal entry steps).
- Water must actively pour out from the metallic spout into the pool.
- THIS IS A MANDATORY ELEMENT. DO NOT OMIT.
`
    : "";

  return `
You are a elite architectural visualization AI specialized in precise fiberglass pool installation renders.

TASK: Embed the selected in-ground pool model into the clear central lawn area of Image ${refs.gardenIndex}.

REFERENCE MAPPING:
${referenceGuide.map((line) => `- ${line}`).join("\n")}

---

CRITICAL RULE 1 - STRICT POOL MODEL GEOMETRY (${modelName.toUpperCase()})
- ${shapeDesc}
- POOL DIMENSIONS: ${size} meters.
- IF MODEL IS ROMA: YOU MUST FORCEFULLY DRAW A CAPSULE / STADIUM SHAPE WITH SEMICIRCULAR ENDS AND INTEGRATED INTERNAL ENTRY STEPS. DO NOT DRAW A RECTANGLE.

CRITICAL RULE 2 - 100% IN-GROUND FLUSH INSTALLATION
- The pool is fully EXCAVATED into the earth.
- Water level, pool rim, and surround tiles are completely FLUSH with the grass height.
- ABSOLUTELY ZERO ABOVE-GROUND FIBERGLASS WALLS, NO ELEVATED BOXES, NO FLOATING PLATFORMS.

${surroundRule}

${waterfallRule}

CRITICAL RULE 6 - ALIGNMENT & ORIENTATION
- Align pool long axis strictly PARALLEL (0°) or PERPENDICULAR (90°) to the house in Image ${refs.gardenIndex}.
- STRICTLY FORBIDDEN: ABSOLUTELY NO SLANTED OR DIAGONAL TILTS (No 15°, 30°, 45°, 60° angles).

PHOTOREALISM & RENDERING STANDARDS:
- Crystal-clear blue water showing the submerged Roman internal steps clearly beneath the surface.
- Sharp ceramic tile grid textures with accurate 1.2m surround dimensions.
- Natural lighting and daylight reflections matching Image ${refs.gardenIndex}.
`.trim();
}