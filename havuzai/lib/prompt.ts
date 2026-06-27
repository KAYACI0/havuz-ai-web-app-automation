const POOL_SHAPE_DESCRIPTIONS: Record<string, string> = {
  RELAX: `STRICTLY RECTANGULAR fiberglass pool.
  Perfectly straight parallel long sides.
  Sharp 90-degree corners (very slightly softened radius only).
  Clean boxy rectangular silhouette from above.
  Horizontal ribbing texture on interior walls.
  DO NOT make it oval. DO NOT curve the sides. MUST be rectangular.
  THIS IS A RECTANGLE. NOT OVAL. NOT ROUND. NOT CURVED.`,

  ROMA: `OVAL / TEARDROP shaped fiberglass pool — NOT rectangular, NOT square.
  Asymmetric teardrop/leaf shape when viewed from above.
  One short end is WIDER and fully rounded like a half-circle.
  The other short end is NARROWER and gently tapered/pointed.
  Both long sides curve smoothly inward toward the narrow end.
  The pool is clearly oval/organic — NO straight sides at all.
  Width at widest point is about half the total length.
  The wide rounded end is the entry side (where the ladder is).
  The narrow pointed end is the far end.
  Horizontal ribbing texture on interior walls.
  THIS POOL IS OVAL. CURVED SIDES. NOT RECTANGULAR. NOT A ROUND CIRCLE.`,
};

const DECK_MATERIALS: Record<string, { label: string; desc: string; colorRepeat: string }> = {
  ceviz: {
    label: "WARM BROWN",
    colorRepeat: "WARM BROWN — like walnut wood. NOT white. NOT grey. NOT beige. NOT cream. BROWN.",
    desc: `Composite deck planks, 4cm wide x 3cm high x 300cm long, laid parallel to pool edge.
    COLOR: WARM CHESTNUT BROWN like walnut wood.
    THE DECK MUST BE WARM BROWN. IF IT IS WHITE OR GREY, THE OUTPUT IS WRONG.`,
  },
  antrasit04: {
    label: "DARK GREY",
    colorRepeat: "DARK GREY — charcoal, almost black. NOT white. NOT brown. NOT beige. DARK GREY.",
    desc: `Composite deck planks, 4cm wide x 3cm high x 300cm long, laid parallel to pool edge.
    COLOR: VERY DARK CHARCOAL GREY, almost black.
    THE DECK MUST BE DARK GREY / CHARCOAL. IF IT IS WHITE OR BEIGE, THE OUTPUT IS WRONG.`,
  },
  "koyu-kahve": {
    label: "DARK BROWN",
    colorRepeat: "DARK BROWN — deep espresso. NOT white. NOT grey. NOT light brown. DARK BROWN.",
    desc: `Composite deck planks, 4cm wide x 3cm high x 300cm long, laid parallel to pool edge.
    COLOR: DEEP ESPRESSO DARK BROWN.
    THE DECK MUST BE DARK BROWN. IF IT IS WHITE OR GREY, THE OUTPUT IS WRONG.`,
  },
  yesil: {
    label: "GREEN",
    colorRepeat: "GREEN — forest green, saturated. NOT white. NOT grey. NOT brown. GREEN.",
    desc: `Composite deck planks, 4cm wide x 3cm high x 300cm long, laid parallel to pool edge.
    COLOR: FOREST GREEN, saturated medium green.
    THE DECK MUST BE GREEN. IF IT IS WHITE OR GREY, THE OUTPUT IS WRONG.`,
  },
  kirmizi: {
    label: "RED",
    colorRepeat: "RED — deep burgundy red / terracotta. NOT white. NOT grey. NOT brown. RED.",
    desc: `Composite deck planks, 4cm wide x 3cm high x 300cm long, laid parallel to pool edge.
    COLOR: DEEP BURGUNDY RED / TERRACOTTA RED.
    THE DECK MUST BE RED / BURGUNDY. IF IT IS WHITE OR GREY, THE OUTPUT IS WRONG.`,
  },
  "gunes-sarisi": {
    label: "GOLDEN YELLOW",
    colorRepeat: "GOLDEN YELLOW — warm sandy yellow. NOT white. NOT grey. NOT orange. GOLDEN YELLOW.",
    desc: `Composite deck planks, 4cm wide x 3cm high x 300cm long, laid parallel to pool edge.
    COLOR: WARM GOLDEN SANDY YELLOW.
    THE DECK MUST BE GOLDEN YELLOW. IF IT IS WHITE OR GREY, THE OUTPUT IS WRONG.`,
  },
  bej: {
    label: "BEIGE",
    colorRepeat: "BEIGE — warm sandy beige, light cream. NOT white. NOT grey. NOT brown. BEIGE.",
    desc: `Composite deck planks, 4cm wide x 3cm high x 300cm long, laid parallel to pool edge.
    COLOR: WARM SANDY BEIGE / LIGHT CREAM.
    THE DECK MUST BE BEIGE / CREAM. IF IT IS PURE WHITE OR GREY, THE OUTPUT IS WRONG.`,
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

  const shapeDesc   = POOL_SHAPE_DESCRIPTIONS[model.toUpperCase()] || `${model} shaped fiberglass pool`;
  const mat         = deck ? DECK_MATERIALS[deck] : null;
  const ceramicDesc = ceramic ? CERAMIC_COLOR_DESCRIPTIONS[ceramic] || `${ceramic} colored interior` : null;
  const isRoma      = model.toUpperCase() === "ROMA";

  return `
You are generating a photorealistic architectural visualization. A swimming pool must be seamlessly integrated into the provided outdoor photo. The final image must look like a real photograph taken after the pool was built — NOT a render, NOT a 3D model, NOT a cartoon or illustration.

RULE 1: PRESERVE ALL EXISTING ELEMENTS
Keep every existing element in the photo EXACTLY as it is:
- Buildings, houses, villas: DO NOT change architecture, color, size, or position
- Trees, bushes, hedges: DO NOT remove or alter
- Fences, walls, paths: DO NOT remove or alter
- Place the pool ONLY in the available open ground/grass area
- The pool must NOT block the view of the main building

RULE 2: IN-GROUND POOL — THIS IS THE MOST CRITICAL RULE
THE POOL MUST BE DUG INTO THE GROUND. THIS IS AN IN-GROUND SWIMMING POOL.

CORRECT: The pool sits below ground level. The water surface is flush with the surrounding lawn or deck. You can see the pool going DOWN into the earth. Only the thin coping rim (10-15cm) is at ground level.

WRONG — THESE WILL MAKE THE OUTPUT INVALID:
- Pool sitting ON TOP of the ground like a box
- Pool walls visible above the ground
- Pool elevated above the surrounding grass
- Pool looking like it was placed on the lawn without any excavation

Picture this: A hole was dug in the ground. The fiberglass pool shell was lowered in. The water surface is now at the same level as the surrounding grass or deck. Only the thin coping edge is visible above.

IN-GROUND. BELOW GROUND LEVEL. DUG INTO THE EARTH. NOT ON TOP OF THE GROUND.

RULE 3: POOL SHAPE
Model: ${model.toUpperCase()}
${shapeDesc}
${isRoma
  ? `SHAPE RULE: OVAL/TEARDROP ONLY. One end wide/rounded, other end narrow/tapered. Curved sides. NOT rectangular. NOT a circle.`
  : `SHAPE RULE: RECTANGLE ONLY. Straight parallel sides. 90-degree corners. NOT oval. NOT curved sides.`
}
Size: ${size} meters. Render exact proportions.

RULE 4: POOL INTERIOR
${ceramicDesc ?? "Standard blue fiberglass interior. Water appears bright blue."}
Water must look realistic with natural depth and light reflections.

${mat ? `
RULE 5: DECK COLOR — CRITICAL — READ THIS CAREFULLY
THE DECK COLOR IS: ${mat.colorRepeat}

${mat.desc}

Deck width: exactly 1 meter around all sides of the pool.
Planks run parallel to the nearest pool edge.

REPEAT: THE DECK COLOR IS ${mat.label}.
DO NOT USE WHITE. DO NOT USE GREY UNLESS SPECIFIED.
THE COLOR ${mat.label} MUST BE CLEARLY VISIBLE IN THE OUTPUT.
A WHITE OR GREY DECK WHEN ${mat.label} WAS SPECIFIED = INVALID OUTPUT.
` : ""}

${!mat && ceramicDesc ? `
RULE 5: CERAMIC TILE SURROUND
- 1 meter wide ceramic tile walkway around all pool sides
- Tile size: 33cm x 66cm rectangular
- Regular grid pattern with visible grout lines (2-3mm)
- Neutral color ceramic (light grey or cream)
- Clean professional finish
` : ""}

${hasStairs ? `
RULE 6: POOL LADDER — MANDATORY
A POOL LADDER MUST BE VISIBLE IN THE FINAL IMAGE. DO NOT OMIT THIS.

- Type: External clip-on stainless steel pool ladder
- Steps: 3 steps hanging over the pool edge into the water
- Material: Polished stainless steel, shiny chrome-like finish
- ${stairType === "wide"
    ? "Wide ladder type: spans most of one short end of the pool, 3-4 broad steps."
    : "Corner ladder type: compact, mounted at one corner of the pool."}

THE LADDER MUST BE IN THE IMAGE. OMITTING THE LADDER = INVALID OUTPUT.
` : ""}

${hasWaterfall ? `
RULE 7: WATERFALL BLADE — MANDATORY
A STAINLESS STEEL WATERFALL BLADE MUST BE VISIBLE IN THE FINAL IMAGE. DO NOT OMIT THIS.

- Width: 35cm only — this is a SMALL compact accent feature
- Height: 40cm
- Material: Polished brushed stainless steel with chrome-like finish
- Position: Mounted on pool coping on one of the LONG sides
- Effect: Smooth thin sheet of water flowing over the metal surface into pool
- This is NOT a large waterfall. It is a small 35cm decorative blade only.

THE WATERFALL BLADE MUST BE IN THE IMAGE. OMITTING IT = INVALID OUTPUT.
A WATERFALL LARGER THAN 35cm WIDE = INVALID OUTPUT.
` : ""}

FINAL QUALITY RULES:
- Output must look like a real professional photograph — not a render or illustration
- Pool perspective must exactly match the camera angle of the original photo
- Lighting and shadows must match the existing photo naturally
- Pool must look fully integrated, like it was actually built there
- Professional architectural visualization quality

DO NOT:
- Show the pool above ground level
- Use the wrong deck color
- Change the pool shape
- Omit mandatory features (ladder/waterfall)
- Make the waterfall wider than 35cm
- Alter existing buildings or structures
- Produce cartoon or illustration style
  `.trim();
}