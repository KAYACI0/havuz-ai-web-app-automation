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

const DECK_MATERIALS: Record<string, { label: string; desc: string }> = {
  ceviz: {
    label: "WARM BROWN",
    desc: `WARM BROWN composite deck — like walnut wood. NOT white. NOT grey. NOT beige.
    Panel size: 4cm wide x 3cm high x 300cm long.
    Panels laid parallel to pool edge, uniform tight spacing.
    Warm chestnut brown tone with subtle wood grain texture.
    THE DECK MUST BE WARM BROWN. WHITE OR GREY OUTPUT = INVALID.`,
  },
  antrasit04: {
    label: "DARK GREY",
    desc: `DARK GREY composite deck — charcoal, almost black. NOT white. NOT brown.
    Panel size: 4cm wide x 3cm high x 300cm long.
    Panels laid parallel to pool edge, uniform tight spacing.
    Very dark anthracite charcoal tone, matte surface.
    THE DECK MUST BE DARK GREY. WHITE OR BEIGE OUTPUT = INVALID.`,
  },
  "koyu-kahve": {
    label: "DARK BROWN",
    desc: `DARK BROWN composite deck — deep espresso brown. NOT white. NOT grey. NOT light brown.
    Panel size: 4cm wide x 3cm high x 300cm long.
    Panels laid parallel to pool edge, uniform tight spacing.
    Deep dark espresso brown tone.
    THE DECK MUST BE DARK BROWN. WHITE OR GREY OUTPUT = INVALID.`,
  },
  yesil: {
    label: "GREEN",
    desc: `GREEN composite deck — forest green, saturated. NOT white. NOT grey. NOT brown.
    Panel size: 4cm wide x 3cm high x 300cm long.
    Panels laid parallel to pool edge, uniform tight spacing.
    Vivid forest green matte surface.
    THE DECK MUST BE GREEN. WHITE OR GREY OUTPUT = INVALID.`,
  },
  kirmizi: {
    label: "RED",
    desc: `RED composite deck — deep burgundy red / terracotta. NOT white. NOT grey. NOT brown.
    Panel size: 4cm wide x 3cm high x 300cm long.
    Panels laid parallel to pool edge, uniform tight spacing.
    Deep burgundy red / terracotta tone, matte surface.
    THE DECK MUST BE RED / BURGUNDY. WHITE OR GREY OUTPUT = INVALID.`,
  },
  "gunes-sarisi": {
    label: "GOLDEN YELLOW",
    desc: `GOLDEN YELLOW composite deck — warm sandy yellow. NOT white. NOT grey. NOT orange.
    Panel size: 4cm wide x 3cm high x 300cm long.
    Panels laid parallel to pool edge, uniform tight spacing.
    Warm golden sandy yellow matte surface.
    THE DECK MUST BE GOLDEN YELLOW. WHITE OR GREY OUTPUT = INVALID.`,
  },
  bej: {
    label: "BEIGE",
    desc: `BEIGE composite deck — warm sandy beige / light cream. NOT pure white. NOT grey.
    Panel size: 4cm wide x 3cm high x 300cm long.
    Panels laid parallel to pool edge, uniform tight spacing.
    Warm sandy beige cream tone.
    THE DECK MUST BE BEIGE / CREAM. PURE WHITE OR GREY OUTPUT = INVALID.`,
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
GOAL: Seamlessly integrate the selected swimming pool model into the uploaded garden, villa, or land photo. The result must be a photorealistic visualization showing the completed pool installation — NOT a render, NOT a cartoon, NOT an illustration. Must look like a real photograph.

---

RULE 1 — PRESERVE ALL EXISTING ELEMENTS
The most prominent structure in the photo (house, villa, building) must remain EXACTLY as it is.
Do NOT change the architecture, color, size, or position of any building.
Do NOT remove or alter trees, walls, fences, hedges, or any existing landscaping.
Place the pool ONLY in an available empty open ground area.
The pool must NOT block the view of the main building.
Priority order: 1) Existing building → 2) Surrounding landscape → 3) Pool placement
If multiple open areas exist, choose the most aesthetically logical position near the building.

---

RULE 2 — IN-GROUND INSTALLATION (MOST CRITICAL RULE)
The pool MUST be installed IN-GROUND — dug into the earth.

CORRECT: A hole has been excavated in the ground. The fiberglass pool shell sits inside the hole. The water surface is at the same level as the surrounding lawn or deck surface. Only the thin coping edge (10-15cm) is visible above ground.

WRONG — these make the output invalid:
- Pool sitting ON TOP of the ground like a box or container
- Pool walls rising above the ground surface
- Pool appearing to float above or rest on the lawn without excavation
- Any gap visible between the pool exterior and the surrounding ground

THE POOL MUST BE IN-GROUND. WATER SURFACE = GROUND LEVEL.

---

RULE 3 — POOL MODEL AND SHAPE
Model: ${model.toUpperCase()}
Size: ${size} meters — render proportions accurately matching this exact dimension ratio.
${shapeDesc}

${isRoma
  ? `SHAPE ENFORCEMENT: OVAL / TEARDROP ONLY.
One short end wide and rounded. Other short end narrow and tapered.
Long sides gently curved inward. NO straight sides at all.
NOT rectangular. NOT a perfect circle. OVAL/TEARDROP shape only.`
  : `SHAPE ENFORCEMENT: RECTANGLE ONLY.
Straight parallel long sides. 90-degree corners (very slightly softened only).
NOT oval. NOT curved sides. NOT rounded ends. RECTANGLE only.`
}

---

RULE 4 — POOL INTERIOR COLOR
${ceramicDesc ?? "Standard blue fiberglass interior. Water appears bright blue."}
Water must look realistic: natural depth, light reflections, and color gradients.

---

${mat ? `
RULE 5 — DECK SURROUND COLOR (CRITICAL)
Selected deck color: ${mat.label}
${mat.desc}
Deck width: exactly 1 meter on all sides around the pool.
Panels run parallel to the nearest pool edge.
Composite or wood grain texture must be clearly visible.
THE COLOR ${mat.label} MUST BE CLEARLY VISIBLE. ANY OTHER COLOR = INVALID OUTPUT.
` : ""}

${!mat && ceramicDesc ? `
RULE 5 — CERAMIC TILE SURROUND
1 meter wide ceramic tile walkway around all sides of the pool.
Tile size: 33cm x 66cm rectangular format.
Tiles laid in a regular grid pattern with visible grout lines (2-3mm wide).
Neutral color ceramic (light grey or cream stone look).
Clean, realistic, professional finish. Grout lines must be visible.
` : ""}

---

${hasStairs ? `
RULE 6 — POOL LADDER (MANDATORY — MUST APPEAR IN IMAGE)
A stainless steel pool ladder MUST be clearly visible in the final image.
DO NOT omit this. DO NOT skip this. THE LADDER MUST BE IN THE IMAGE.

Specifications:
- Type: External clip-on stainless steel pool ladder
- Steps: 3 steps hanging over the pool edge into the water
- Material: Polished stainless steel — shiny, chrome-like, reflective surface
- ${stairType === "wide"
    ? "Style: Wide ladder spanning most of one short end of the pool, 3-4 broad steps."
    : "Style: Compact corner ladder mounted at one corner of the pool."}

OMITTING THE LADDER = INVALID OUTPUT.
` : ""}

${hasWaterfall ? `
RULE 7 — WATERFALL BLADE (MANDATORY — MUST APPEAR IN IMAGE)
A stainless steel waterfall blade MUST be clearly visible in the final image.
DO NOT omit this. DO NOT skip this. THE WATERFALL MUST BE IN THE IMAGE.

Specifications:
- Width: EXACTLY 35cm — this is a small compact decorative accent, NOT a large waterfall
- Height: 40cm
- Material: Polished brushed stainless steel, chrome-like reflective finish
- Position: Mounted on the pool coping on one of the LONG sides of the pool
- Water effect: Smooth thin sheet of water flowing continuously over the metal blade into the pool
- This is a small 35cm decorative feature — NOT a rock waterfall, NOT spanning the full wall

OMITTING THE WATERFALL = INVALID OUTPUT.
WATERFALL WIDER THAN 35cm = INVALID OUTPUT.
` : ""}

---

RULE 8 — VISUAL QUALITY
Output must look like a real professional photograph — photorealistic quality.
Pool perspective must exactly match the camera angle of the original photo.
Lighting, shadows, and reflections must naturally match the original photo.
Pool water must have realistic reflections, depth, and color.
Pool must look fully integrated — like it was actually built there, not composited.
Pool characteristic details and product features must be clearly visible.
All selected features (deck/ceramic, ladder, waterfall) must be clearly recognizable.

---

ABSOLUTE PROHIBITIONS:
- Do NOT change existing building architecture
- Do NOT alter the pool shape (${isRoma ? "must stay OVAL/TEARDROP" : "must stay RECTANGLE"})
- Do NOT place the pool above ground level
- Do NOT use wrong deck color${mat ? ` (must be ${mat.label})` : ""}
- Do NOT omit the ladder${hasStairs ? " (MANDATORY)" : ""}
- Do NOT omit the waterfall${hasWaterfall ? " (MANDATORY)" : ""}
- Do NOT make the waterfall wider than 35cm
- Do NOT ignore ceramic or deck panel dimensions
- Do NOT produce cartoon, illustration, or 3D render style output
- Result MUST look like a real photograph
  `.trim();
}