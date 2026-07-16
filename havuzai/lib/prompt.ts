import type { ClientConfig } from "./config-types";

export interface PoolConfig {
  model: string;
  size: string;
  deck: string;
  ceramic: string;
  hasWaterfall: boolean;
  hasStairs: boolean;
  stairType: "corner" | "wide";
  poolOrientation: "horizontal" | "vertical" | "";
}

export function buildPoolPrompt(
  config: PoolConfig,
  clientConfig: ClientConfig
): string {
  const { model, size, ceramic, deck, poolOrientation } = config;

  const poolModel = clientConfig.pool_models.find((item) => item.id === model);
  const modelName = poolModel?.name || model;
  const shapeDesc =
    poolModel?.prompt_description ||
    poolModel?.description ||
    `${model} shaped fiberglass pool`;
  const deckColor = deck
    ? clientConfig.deck_colors.find((item) => item.id === deck)
    : null;
  const ceramicColor = ceramic
    ? clientConfig.ceramic_colors.find((item) => item.id === ceramic)
    : null;
  const isRoma = model.toUpperCase() === "ROMA";

  const shapeRule = isRoma
    ? `OVAL/TEARDROP shaped - ASYMMETRIC. The two ends of the pool are DIFFERENT:
- One end is a WIDE, fully rounded semicircle.
- The other end NARROWS and tapers to a smaller rounded tip.
- The two long sides are NOT parallel - they curve and taper from the wide end toward the narrow end.
- Think of a water droplet or egg shape, NOT a running-track shape.
- WRONG: a rectangle with rounded corners (stadium/pill shape).
- WRONG: a symmetric oval where both ends are identical.
- ABSOLUTELY NOT rectangular, NOT a rounded rectangle, NOT a stadium shape.`
    : `Strictly rectangular - straight sides and 90-degree corners. ABSOLUTELY NOT oval or curved.`;

  const guideRule = `
PLACEMENT GUIDE - MANDATORY:
Image 1 contains a temporary bright magenta rectangular placement guide.
Replace the guide completely with the pool; the magenta guide must not remain visible in the final image.
The entire pool must stay inside the guide.
Match the guide's position, width, length, and orientation exactly.
Do not move, rotate, resize beyond, or reinterpret the guide.
If any other instruction conflicts with the guide, the guide has priority for pool position and orientation.`;

  const orientationRule =
    poolOrientation === "horizontal"
      ? `HORIZONTAL POOL ORIENTATION - MANDATORY.${guideRule}

HORIZONTAL means horizontal relative to the IMAGE FRAME, not relative to fences, paths, lawns, buildings, terrain, shadows, or camera perspective.
- The pool LONG axis runs LEFT-TO-RIGHT across the final image.
- The pool SHORT ends are on the LEFT and RIGHT.
- The near edge and far edge are both LONG pool edges.
- The pool must appear wider left-to-right than it is deep from foreground to background.
- Both visible LONG edges must be parallel to the bottom image border.
- The left and right ends must be at the same vertical height.
- Never let the pool point toward the back fence or background.
- Never create a diagonal, tilted, corner-to-corner, or vertical pool.
- If the horizontal guide does not fit the open area, reduce pool scale inside the guide. Never rotate it.`
      : poolOrientation === "vertical"
      ? `VERTICAL POOL ORIENTATION - MANDATORY.${guideRule}

VERTICAL means the pool LONG axis points STRAIGHT AWAY from the camera toward the background.
- The pool SHORT axis runs LEFT-TO-RIGHT.
- The nearest edge to the camera is a SHORT end.
- The LONG sides run from foreground toward the house/background.
- Never create a diagonal or left-to-right horizontal pool.
- If the vertical guide does not fit the open area, reduce pool scale inside the guide. Never rotate it.`
      : "";

  return `
You are a professional architectural visualization AI. Place a luxury fiberglass swimming pool into the provided outdoor photo. The result must be a real professional photograph of a completed installation.

REFERENCE IMAGES:
- Image 1: Customer garden/property photo. This is the only scene to edit.
- Image 2: ${modelName} multi-view pool model reference board. This is the exact pool blueprint.

MOST IMPORTANT RULE - IN-GROUND INSTALLATION:
This is a professional IN-GROUND swimming pool built into the earth.
- The water surface is at the SAME LEVEL as surrounding grass/ground.
- The shell goes down into the earth; only a thin top edge is at ground level.
- Surrounding grass or ground meets the pool edge naturally.
- NEVER show an above-ground box, exposed exterior pool walls, raised platform, gap, or visible shell sides above ground.

RULE 1 - PRESERVE THE SCENE:
- Keep buildings, trees, hedges, plants, fences, walls, and paths exactly as in Image 1.
- Only add the pool and its selected surround to open garden ground.
- Do not block the main building view.
- Do not alter crop, framing, aspect ratio, or camera angle.

RULE 2 - EXACT POOL MODEL: ${modelName.toUpperCase()}
${shapeDesc}
Shape rule: ${shapeRule}
Size: ${size} meters. Maintain exact proportions.

MODEL IDENTITY LOCK - MANDATORY:
Image 2 is the exact fiberglass pool model blueprint, not a general style reference.
- Copy the exact outer silhouette from Image 2.
- Copy every visible built-in molded interior feature from Image 2: entry steps, benches, curves, ledges, shelves, and internal contours.
- Built-in fiberglass steps are mandatory when shown in Image 2, even if an external stainless-steel ladder is also selected.
- Do NOT simplify the model into an empty generic rectangular basin.
- Do NOT replace molded internal steps with only an external ladder.

The pool must be small relative to the garden, roughly 20-25% of visible open garden area, unless the placement guide requires a smaller size.
The pool must be clearly smaller than the house/building.
The pool and surround must fit entirely inside visible garden boundaries.

${orientationRule ? `RULE 2B - POOL ORIENTATION\n${orientationRule}` : ""}

RULE 3 - POOL WATER:
Clear, bright blue fiberglass pool interior. Realistic water depth, light shimmer, and color variation. The pool interior visibly goes deep into the ground.

${
  ceramicColor
    ? `RULE 4 - CERAMIC TILE SURROUND (MANDATORY)
Add a ceramic tile walkway around all four pool sides.
- Exactly 2 rows of ceramic tiles on each side, total width 120cm (60cm per row).
- Tiles are rectangular: 33cm wide x 66cm long, never square.
- Each tile is twice as long as it is wide, like a brick shape.
- Tile long side runs parallel to the nearest pool edge; visible 2-3mm grout lines.
- Use ONLY ${ceramicColor.name} colored ceramic tiles on every side.
- Tiles sit flush at ground level, not raised.
- The outer tile edge meets grass at exactly the same level, with no slab thickness, step, side face, shadow gap, platform, or patio.
- The first tile row meets the water edge directly and acts as coping.
- No inner frame, border row, edge strip, white rim, cream rim, blue rim, or visible fiberglass lip between water and tile.
- The transition is: blue water -> thin dark waterline -> ${ceramicColor.name} ceramic tile. Nothing else.
- The ceramic surround replaces only the grass directly around the pool.
DO NOT skip the ceramic tiles.`
    : deckColor
    ? `RULE 4 - DECK SURROUND (MANDATORY)
Add a composite wood deck around all four pool sides.
- Exactly 3 deck boards per side, total width 60cm.
- Each board is 20cm wide and parallel to the nearest pool edge.
- Deck color: ${deckColor.name}.
- Deck sits flush at ground level, never raised.
- The first deck board meets the pool water directly and acts as coping.
- No white coping, rim, plastic, or fiberglass border between water and deck boards.
- The deck replaces only grass directly around the pool.
DO NOT skip the deck.`
    : `RULE 4 - POOL SURROUND
Existing grass, soil, or original ground meets the pool edge directly.
Do NOT add deck, ceramic tile, stone, pavers, walkway, border, white coping, or rim.
The shell is hidden below ground. Only water surface and a thin rim are visible.`
}

${
  config.hasStairs
    ? `RULE 5 - EXTERNAL POOL LADDER (MANDATORY - EXACTLY ONE)
Show exactly ONE 3-step polished stainless-steel pool entry ladder.
Mount it on one SHORT end, with its steps going down into the water.
This is separate from, and must not replace, any built-in molded steps from Image 2.`
    : ""
}

${
  config.hasWaterfall
    ? `RULE 6 - WATERFALL BLADE (MANDATORY - EXACTLY ONE)
Show exactly ONE small elegant stainless-steel cobra waterfall blade, approximately 35cm wide and 40cm tall.
Mount it directly on the pool coping edge at the middle of one LONG side.
Water flows in a smooth sheet down into the pool. Never add a second waterfall.`
    : ""
}

RULE 7 - PHOTOREALISTIC QUALITY:
- Output must look like a real professional photograph, never a cartoon, 3D render, or illustration.
- Match original lighting, shadows, and time of day.
- Preserve original camera angle and scene framing.
- Luxury villa quality: professional, clean, premium, natural finish.

ABSOLUTE PROHIBITIONS:
- Pool above ground in any way.
- Visible exterior pool walls or shell sides above ground.
- Wrong pool model, missing molded interior geometry, or generic empty pool basin.
- Pool or surround beyond a garden boundary, fence, or wall.
- Changing existing buildings, trees, or landscaping.
- Changing photo crop, framing, aspect ratio, or camera perspective.
${
  orientationRule
    ? `- Wrong pool orientation. The pool must follow the Image 1 magenta placement guide exactly.`
    : ""
}
${ceramicColor ? "- Missing ceramic surround or any visible water-to-tile border/rim." : ""}
${deckColor ? "- Missing deck surround or white border between water and deck." : ""}
${config.hasStairs ? "- Missing ladder or more than one ladder." : ""}
${config.hasWaterfall ? "- Missing waterfall or more than one waterfall." : ""}
  `.trim();
}
