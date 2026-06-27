const POOL_SHAPE_DESCRIPTIONS: Record<string, string> = {
  RELAX: `STRICTLY RECTANGULAR fiberglass pool.
  Perfectly straight parallel long sides.
  Sharp 90-degree corners (very slightly softened radius only).
  Clean boxy rectangular silhouette from above.
  Horizontal ribbing texture on interior walls.
  ⚠️ DO NOT make it oval. DO NOT curve the sides. MUST be rectangular.
  ⚠️ THIS IS A RECTANGLE. NOT OVAL. NOT ROUND. NOT CURVED.`,

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
  ⚠️ THIS POOL IS OVAL. CURVED SIDES. NOT RECTANGULAR. NOT A ROUND CIRCLE.`,
};

const DECK_MATERIALS: Record<string, { label: string; desc: string }> = {
  ceviz: {
    label: "WARM BROWN",
    desc: `WARM BROWN composite deck surround.
    Color: warm chestnut brown, like walnut wood. NOT white. NOT grey. NOT beige.
    Material: narrow precision-cut composite decking planks, 4cm wide × 3cm high × 300cm long.
    Planks laid parallel to pool edge, tight uniform gaps between planks.
    Subtle wood grain texture, modern and sleek finish.
    THE DECK COLOR MUST BE CLEARLY WARM BROWN.`,
  },
  antrasit04: {
    label: "DARK GREY",
    desc: `DARK GREY composite deck surround.
    Color: very dark charcoal grey, almost black. NOT white. NOT brown. NOT beige.
    Material: narrow precision-cut composite decking planks, 4cm wide × 3cm high × 300cm long.
    Planks laid parallel to pool edge, tight uniform gaps between planks.
    Matte dark anthracite surface.
    THE DECK COLOR MUST BE CLEARLY DARK GREY / CHARCOAL.`,
  },
  "koyu-kahve": {
    label: "DARK BROWN",
    desc: `DARK BROWN composite deck surround.
    Color: deep espresso dark brown, very dark. NOT white. NOT grey. NOT light brown.
    Material: narrow precision-cut composite decking planks, 4cm wide × 3cm high × 300cm long.
    Planks laid parallel to pool edge, tight uniform gaps between planks.
    Rich dark brown texture.
    THE DECK COLOR MUST BE CLEARLY DEEP DARK BROWN.`,
  },
  yesil: {
    label: "GREEN",
    desc: `GREEN composite deck surround.
    Color: forest green, saturated medium green. NOT white. NOT grey. NOT brown.
    Material: narrow precision-cut composite decking planks, 4cm wide × 3cm high × 300cm long.
    Planks laid parallel to pool edge, tight uniform gaps between planks.
    Vivid forest green matte surface.
    THE DECK COLOR MUST BE CLEARLY GREEN.`,
  },
  kirmizi: {
    label: "RED",
    desc: `RED composite deck surround.
    Color: deep burgundy red / terracotta red. NOT white. NOT grey. NOT brown.
    Material: narrow precision-cut composite decking planks, 4cm wide × 3cm high × 300cm long.
    Planks laid parallel to pool edge, tight uniform gaps between planks.
    Deep red burgundy matte surface.
    THE DECK COLOR MUST BE CLEARLY RED / BURGUNDY.`,
  },
  "gunes-sarisi": {
    label: "GOLDEN YELLOW",
    desc: `GOLDEN YELLOW composite deck surround.
    Color: warm golden sandy yellow. NOT white. NOT grey. NOT orange.
    Material: narrow precision-cut composite decking planks, 4cm wide × 3cm high × 300cm long.
    Planks laid parallel to pool edge, tight uniform gaps between planks.
    Warm sandy golden matte surface.
    THE DECK COLOR MUST BE CLEARLY GOLDEN YELLOW.`,
  },
  bej: {
    label: "BEIGE",
    desc: `BEIGE composite deck surround.
    Color: warm sandy beige, light cream tone. NOT white. NOT grey. NOT brown.
    Material: narrow precision-cut composite decking planks, 4cm wide × 3cm high × 300cm long.
    Planks laid parallel to pool edge, tight uniform gaps between planks.
    Warm beige cream matte surface.
    THE DECK COLOR MUST BE CLEARLY BEIGE / CREAM.`,
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

  const shapeDesc  = POOL_SHAPE_DESCRIPTIONS[model.toUpperCase()] || `${model} shaped fiberglass pool`;
  const mat        = deck ? DECK_MATERIALS[deck] : null;
  const deckDesc   = mat?.desc ?? null;
  const ceramicDesc = ceramic ? CERAMIC_COLOR_DESCRIPTIONS[ceramic] || `${ceramic} colored interior` : null;

  const isRoma = model.toUpperCase() === "ROMA";

  return `
TASK: Seamlessly integrate a prefabricated fiberglass swimming pool into the outdoor area visible in this photo. The result must look like a real professional architectural visualization photo — NOT a render, NOT a cartoon, NOT a drawing.

════════════════════════════════════════════
PRIORITY 1 — PRESERVE EXISTING STRUCTURES
════════════════════════════════════════════
- The most prominent structure (house, villa, building) in the photo MUST remain EXACTLY as-is.
- Do NOT change the architecture, color, size, or position of any building.
- Do NOT remove or alter trees, fences, walls, or any existing landscaping.
- Place the pool ONLY in an available open/empty ground area.
- The pool must NOT block the view of the main building.
- Priority order: 1) Existing building → 2) Surrounding area → 3) Pool placement

════════════════════════════════════════════
PRIORITY 2 — POOL SHAPE (CRITICAL)
════════════════════════════════════════════
Pool model: ${model.toUpperCase()}
${shapeDesc}

${isRoma ? `
⚠️ SHAPE RULE: This pool is OVAL/TEARDROP.
Asymmetric — one end wide and rounded, other end narrow and tapered.
Long sides curve smoothly. NO straight sides whatsoever.
ABSOLUTELY NOT rectangular. ABSOLUTELY NOT a perfect circle.
` : `
⚠️ SHAPE RULE: This pool is STRICTLY RECTANGULAR.
Straight parallel sides. 90-degree corners (very slightly softened only).
NO oval. NO curves on the sides. NO tapering.
ABSOLUTELY NOT oval or rounded.
`}

════════════════════════════════════════════
PRIORITY 3 — IN-GROUND INSTALLATION (CRITICAL)
════════════════════════════════════════════
- The pool MUST be dug INTO the ground — fully in-ground installation.
- The water surface must be at approximately ground/deck level.
- Only the coping edge (10-20cm) should be visible above the surrounding surface.
- NEVER show the pool raised above ground level.
- NEVER show the pool sitting on top of the ground like a container.
- This is a permanent in-ground swimming pool, like a real built pool.

════════════════════════════════════════════
POOL SPECIFICATIONS
════════════════════════════════════════════
- Size: ${size} meters — render proportions accurately matching this exact dimension ratio.
- Interior: ${ceramicDesc ? ceramicDesc : "standard blue fiberglass interior"}
- Water: clear, realistic pool water with natural reflections and depth.

${deckDesc ? `
════════════════════════════════════════════
DECK / SURROUND SURFACE
════════════════════════════════════════════
${deckDesc}
- Width: exactly 1 meter on all sides around the pool.
- Planks run parallel to the nearest pool edge.
- Clean, modern, professional finish.
- ⚠️ THE DECK COLOR DESCRIBED ABOVE IS MANDATORY. Do not substitute with white or grey.
` : ""}

${ceramicDesc && !deckDesc ? `
════════════════════════════════════════════
POOL SURROUND — CERAMIC TILES
════════════════════════════════════════════
- Ceramic tile walkway, 1 meter wide around all sides of the pool.
- Tile size: 33cm × 66cm rectangular format.
- Tiles laid in a regular grid pattern with visible grout lines (2-3mm joints).
- Natural stone-look or plain ceramic finish, neutral color (light grey or cream).
- Clean, professional, realistic tile joints clearly visible.
` : ""}

${hasStairs ? `
════════════════════════════════════════════
POOL STAIRCASE / LADDER (MANDATORY)
════════════════════════════════════════════
- A pool entry staircase MUST be clearly visible in the image.
- Style: clip-on external stainless steel pool ladder, polished chrome finish.
- 3 steps, hanging over the pool edge into the water.
${stairType === "wide"
  ? "- Wide ladder type: spans most of one short end of the pool, 3-4 broad steps."
  : "- Corner ladder type: compact, mounted at one corner of the pool."}
- The stainless steel surface must be shiny and realistic.
- ⚠️ This staircase is MANDATORY — do NOT omit it.
` : ""}

${hasWaterfall ? `
════════════════════════════════════════════
POOL WATERFALL FEATURE (MANDATORY)
════════════════════════════════════════════
- A stainless steel waterfall blade MUST be added to the pool.
- Dimensions: approximately 35cm wide × 40cm tall.
- Mounted on the pool coping on one of the LONG sides of the pool.
- Material: polished brushed stainless steel, chrome-like reflective finish.
- Water flows in a smooth thin sheet over the curved metal surface into the pool.
- The waterfall is a small decorative accent feature — NOT a large rock waterfall.
- NOT spanning the full pool wall — just a compact 35cm wide accent piece.
- ⚠️ This waterfall is MANDATORY — do NOT omit it.
` : ""}

════════════════════════════════════════════
REALISM & QUALITY RULES
════════════════════════════════════════════
- Photorealistic quality — must look like a real professional photograph.
- Correct perspective: the pool perspective MUST match the photo's camera angle exactly.
- Natural lighting: match the existing light direction, shadows, and time of day in the photo.
- Pool water must have realistic reflections, depth, and color.
- The pool must look naturally integrated — not pasted on top.
- Professional architectural visualization quality.

════════════════════════════════════════════
ABSOLUTE PROHIBITIONS
════════════════════════════════════════════
❌ Do NOT change the pool shape from what is specified above.
❌ Do NOT raise the pool above ground level.
❌ Do NOT alter any existing building or structure.
❌ Do NOT use the wrong deck/surround color.
❌ Do NOT make the waterfall larger than 35cm wide.
❌ Do NOT omit the staircase or waterfall if they are requested.
❌ Do NOT produce a cartoon, render, or illustration style — PHOTO ONLY.
❌ Do NOT randomly scale the pool — maintain the ${size} meter proportions.
  `.trim();
}