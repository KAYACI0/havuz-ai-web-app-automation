const POOL_SHAPE_DESCRIPTIONS: Record<string, string> = {
  RELAX: `strictly rectangular fiberglass pool.
  Perfectly straight parallel long sides.
  Sharp 90-degree corners (slightly softened radius).
  Clean boxy rectangular silhouette from above.
  Horizontal ribbing texture on interior walls.
  DO NOT make it oval. DO NOT curve the sides. MUST be rectangular.`,

  ROMA: `‼️ OVAL / TEARDROP shaped fiberglass pool — NOT rectangular, NOT square.
  Asymmetric teardrop/leaf shape when viewed from above.
  One short end is WIDER and fully rounded like a half-circle.
  The other short end is NARROWER and gently tapered/pointed.
  Both long sides curve smoothly inward toward the narrow end.
  The pool is clearly oval/organic — NO straight sides at all.
  Width at widest point is about half the total length.
  The wide rounded end is the entry side (where the ladder is).
  The narrow pointed end is the far end.
  Horizontal ribbing texture on interior walls.
  THIS POOL IS OVAL. CURVED SIDES. NOT RECTANGULAR. NOT ROUND CIRCLE.`,
};

const DECK_MATERIALS: Record<string, { label: string; desc: string }> = {
  ceviz: {
    label: "WARM BROWN",
    desc: `Composite deck color: #8B6347 warm chestnut brown like walnut wood. NOT white. NOT grey.
    Panel: 4cm wide x 3cm high x 300cm long, parallel to pool edge.
    THE DECK MUST BE HEX COLOR #8B6347 WARM BROWN. WHITE = INVALID.
    Pool coping and edge must also be #8B6347 — NO white border around the pool.`,
  },
  antrasit04: {
    label: "DARK GREY",
    desc: `Composite deck color: #4A4A4A very dark charcoal grey, almost black. NOT white. NOT brown.
    Panel: 4cm wide x 3cm high x 300cm long, parallel to pool edge.
    THE DECK MUST BE HEX COLOR #4A4A4A DARK GREY. WHITE = INVALID.
    Pool coping and edge must also be #4A4A4A — NO white border around the pool.`,
  },
  "koyu-kahve": {
    label: "DARK BROWN",
    desc: `Composite deck color: #3D2B1F deep espresso dark brown. NOT white. NOT grey.
    Panel: 4cm wide x 3cm high x 300cm long, parallel to pool edge.
    THE DECK MUST BE HEX COLOR #3D2B1F DARK BROWN. WHITE = INVALID.
    Pool coping and edge must also be #3D2B1F — NO white border around the pool.`,
  },
  yesil: {
    label: "GREEN",
    desc: `Composite deck color: #5C7A3E forest green, saturated medium green. NOT white. NOT grey.
    Panel: 4cm wide x 3cm high x 300cm long, parallel to pool edge.
    THE DECK MUST BE HEX COLOR #5C7A3E GREEN. WHITE = INVALID.
    Pool coping and edge must also be #5C7A3E — NO white border around the pool.`,
  },
  kirmizi: {
    label: "RED",
    desc: `Composite deck color: #8B3A3A deep dark burgundy red. NOT white. NOT grey. NOT brown.
    Panel: 4cm wide x 3cm high x 300cm long, parallel to pool edge.
    THE DECK MUST BE HEX COLOR #8B3A3A DARK RED / BURGUNDY. WHITE = INVALID.
    Pool coping and edge must also be #8B3A3A — NO white border around the pool.`,
  },
  "gunes-sarisi": {
    label: "GOLDEN YELLOW",
    desc: `Composite deck color: #C8A45A warm golden sandy yellow. NOT white. NOT grey.
    Panel: 4cm wide x 3cm high x 300cm long, parallel to pool edge.
    THE DECK MUST BE HEX COLOR #C8A45A GOLDEN YELLOW. WHITE = INVALID.
    Pool coping and edge must also be #C8A45A — NO white border around the pool.`,
  },
  bej: {
    label: "BEIGE",
    desc: `Composite deck color: #C4A882 warm sandy beige, light cream. NOT pure white. NOT grey.
    Panel: 4cm wide x 3cm high x 300cm long, parallel to pool edge.
    THE DECK MUST BE HEX COLOR #C4A882 BEIGE. PURE WHITE = INVALID.
    Pool coping and edge must also be #C4A882 — NO white border around the pool.`,
  },
};

const CERAMIC_COLOR_DESCRIPTIONS: Record<string, string> = {
  turkuaz: "vivid turquoise blue smooth fiberglass interior, water appears bright cyan/turquoise",
  mavi:    "deep cobalt blue smooth fiberglass interior, water appears rich deep blue",
  beyaz:   "clean bright white smooth fiberglass interior, water appears light blue and crystal clear",
  gri:     "cool slate grey smooth fiberglass interior, water appears dark blue-grey",
  krem:    "warm cream ivory smooth fiberglass interior, water appears warm light blue",
};

export interface PoolConfig {
  model:        string;
  size:         string;
  deck:         string;
  ceramic:      string;
  hasWaterfall: boolean;
  hasStairs:    boolean;
  stairType:    "corner" | "wide";
}

export function buildPoolPrompt(config: PoolConfig): string {
  const { model, size, deck, ceramic, hasWaterfall, hasStairs, stairType } = config;

  const shapeDesc      = POOL_SHAPE_DESCRIPTIONS[model.toUpperCase()] || `${model} shaped fiberglass pool`;
  const mat            = deck ? DECK_MATERIALS[deck] : null;
  const deckColorLabel = mat?.label ?? "natural";
  const deckDesc       = mat?.desc  ?? null;
  const ceramicDesc    = ceramic ? CERAMIC_COLOR_DESCRIPTIONS[ceramic] || `${ceramic} colored interior` : null;

  const isRoma = model.toUpperCase() === "ROMA";
  const shapeRule = isRoma
    ? "OVAL/TEARDROP shaped — asymmetric, curved sides, one wide rounded end, one narrow tapered end. ABSOLUTELY NOT rectangular."
    : "strictly rectangular — straight sides, 90-degree corners. ABSOLUTELY NOT oval or curved.";

  const criticalRules = `
═══════════════════════════════════════
NON-NEGOTIABLE RULES — VIOLATING ANY OF
THESE MAKES THE OUTPUT INVALID:
═══════════════════════════════════════

RULE 1 — IN-GROUND INSTALLATION ONLY
The pool MUST be installed flush with or
below the surrounding ground level.
NEVER show the pool raised above ground.
NEVER show it sitting on top of a platform
like a container or above-ground pool.
The water surface should be at approximately
ground level, with only the coping/edge
(15-20cm) visible above grass/deck level.
This is a permanent in-ground installation,
like a real swimming pool, NOT a portable
above-ground pool.

RULE 2 — EXACT POOL SHAPE PRESERVATION
${isRoma ? `
The pool shape is an ASYMMETRIC LEAF/TEARDROP.
One short end is wider and rounded (entry side).
The other short end is narrower, more pointed.
Long sides curve gently inward toward the
narrow end. NOT a circle. NOT a symmetric oval.
NOT a torpedo. This is a one-directional
tapering organic shape.
` : `
The pool shape is STRICTLY RECTANGULAR.
Straight parallel long sides. Straight short
ends with only slightly softened corners.
NO oval, NO curves on the long sides,
NO tapering. A clean geometric rectangle
viewed from above.
`}
Fixed size: ${size} meters. This is the
ONLY available size for this model — render
proportions accurately matching this exact ratio.
${hasStairs ? `
RULE 3 — VISIBLE STAIRCASE (MANDATORY)
A clip-on external pool ladder/staircase MUST
be clearly visible in the final image, hanging
over the pool edge into the water.
${stairType === "wide"
  ? "Wide ladder spanning most of one short end, 3-4 steps."
  : "Compact corner ladder, stainless steel or white plastic, 3-4 steps, mounted at one corner of the pool."}
This ladder must be visibly present — do not
omit it under any circumstance when this
feature is requested.
` : ""}
${hasWaterfall ? `
RULE 4 — POOL WATERFALL FEATURE (MANDATORY)
Add a stainless steel curved waterfall blade
mounted on the pool's edge/coping, exactly like
this reference description:
- A polished stainless steel curved panel,
  shaped like a smooth "C" curve or gentle arc
- Mounted directly on the pool coping/edge,
  extending from just below the water surface
  up to about 40-50cm above the water line
- Water flows over the curved metal surface
  in a smooth continuous sheet, cascading down
  into the pool with visible splashing texture
- The metal surface has a brushed/polished
  chrome-like reflective finish
- Positioned on one side of the pool (not the
  short ends, on a long side), as a freestanding
  accent feature, not spanning the full width
- This is a small-to-medium decorative water
  feature, NOT a natural rock waterfall, NOT
  spanning the entire pool wall
This feature must be visibly present — do not
omit it under any circumstance when requested.
` : ""}
═══════════════════════════════════════
`;

  return `
${criticalRules}

EDIT INSTRUCTION:
Seamlessly integrate a prefabricated fiberglass swimming pool into the open ground or grass area visible in this image.

POOL SPECIFICATIONS:
- Shape: ${shapeDesc}
- Size: ${size} meters
- Pool type: ${shapeRule}
- Installation: IN-GROUND, flush with or below ground level
${ceramicDesc ? `- Interior color: ${ceramicDesc}` : ""}
${deckDesc ? `
DECK/SURROUND — COLOR IS CRITICAL:
${deckDesc}
Width: 1.0-1.5 meters on all sides. Sleek and modern appearance.
IMPORTANT: The deck color must be clearly visible. Do not use white or grey if not specified.
` : ""}

REALISM RULES:
- The pool must look completely realistic and naturally integrated into the existing outdoor space.
- Keep every existing element in the scene exactly as-is — do not add, remove, or modify any structures, buildings, trees, fences, or landscaping.
- Only insert the pool into an available open area.
- Professional photography, natural daylight, photorealistic quality.
  `.trim();
}