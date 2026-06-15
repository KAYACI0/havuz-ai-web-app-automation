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
    desc: `WARM BROWN precision-cut composite deck.
    Color: warm chestnut brown, like walnut wood.
    Material: narrow precision-cut composite decking planks,
    1-2cm thin boards with tight gaps, modern and sleek finish,
    warm medium-brown tone, subtle wood grain texture.
    NOT chunky timber. THIN modern precision planks.
    THE DECK COLOR MUST BE WARM BROWN.`,
  },
  antrasit04: {
    label: "DARK GREY",
    desc: `DARK GREY precision-cut composite deck.
    Color: very dark charcoal grey, almost black.
    Material: narrow precision-cut composite decking planks,
    1-2cm thin boards with tight gaps, modern and sleek finish,
    dark anthracite charcoal tone, matte surface.
    NOT chunky timber. THIN modern precision planks.
    THE DECK COLOR MUST BE DARK GREY.`,
  },
  "koyu-kahve": {
    label: "DARK BROWN",
    desc: `DARK BROWN precision-cut composite deck.
    Color: deep espresso dark brown, very dark.
    Material: narrow precision-cut composite decking planks,
    1-2cm thin boards with tight gaps, modern and sleek finish,
    deep dark brown tone, rich texture.
    NOT chunky timber. THIN modern precision planks.
    THE DECK COLOR MUST BE DARK BROWN.`,
  },
  yesil: {
    label: "GREEN",
    desc: `GREEN precision-cut composite deck.
    Color: forest green, saturated medium green.
    Material: narrow precision-cut composite decking planks,
    1-2cm thin boards with tight gaps, modern and sleek finish,
    vivid forest green tone, matte surface.
    NOT chunky timber. THIN modern precision planks.
    THE DECK COLOR MUST BE GREEN, not white, not grey.`,
  },
  kirmizi: {
    label: "RED",
    desc: `RED precision-cut composite deck.
    Color: deep burgundy red, terracotta red.
    Material: narrow precision-cut composite decking planks,
    1-2cm thin boards with tight gaps, modern and sleek finish,
    deep red burgundy tone, matte surface.
    NOT chunky timber. THIN modern precision planks.
    THE DECK COLOR MUST BE RED.`,
  },
  "gunes-sarisi": {
    label: "GOLDEN YELLOW",
    desc: `GOLDEN YELLOW precision-cut composite deck.
    Color: warm golden sandy yellow.
    Material: narrow precision-cut composite decking planks,
    1-2cm thin boards with tight gaps, modern and sleek finish,
    warm sandy golden tone, matte surface.
    NOT chunky timber. THIN modern precision planks.
    THE DECK COLOR MUST BE GOLDEN YELLOW.`,
  },
  bej: {
    label: "BEIGE",
    desc: `BEIGE precision-cut composite deck.
    Color: warm sandy beige, light cream tone.
    Material: narrow precision-cut composite decking planks,
    1-2cm thin boards with tight gaps, modern and sleek finish,
    warm beige cream tone, matte surface.
    NOT chunky timber. THIN modern precision planks.
    THE DECK COLOR MUST BE BEIGE.`,
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
  const { model, size, deck, ceramic, hasWaterfall, hasStairs } = config;

  const shapeDesc      = POOL_SHAPE_DESCRIPTIONS[model.toUpperCase()] || `${model} shaped fiberglass pool`;
  const mat            = deck ? DECK_MATERIALS[deck] : null;
  const deckColorLabel = mat?.label ?? "natural";
  const deckDesc       = mat?.desc  ?? null;
  const ceramicDesc    = ceramic ? CERAMIC_COLOR_DESCRIPTIONS[ceramic] || `${ceramic} colored interior` : null;

  const isRoma = model.toUpperCase() === "ROMA";
  const shapeRule = isRoma
    ? "OVAL/TEARDROP shaped — asymmetric, curved sides, one wide rounded end, one narrow tapered end. ABSOLUTELY NOT rectangular."
    : "strictly rectangular — straight sides, 90-degree corners. ABSOLUTELY NOT oval or curved.";

  const waterfallRule = hasWaterfall ? `
‼️ MANDATORY: POOL WALL WATERFALL
A water blade waterfall mounted ON the pool's short end wall/coping.
Water flows FROM the pool wall edge, falling only 20-30cm into the pool water.
Like a thin sheet of water coming out from a slot in the pool wall.
NOT a natural waterfall. NOT water falling from the sky. NOT a fountain shooting up.
The water source is the pool wall itself, mounted flush with the coping.
` : "";

  const stairRule = hasStairs ? `POOL ENTRY STAIRS:
Stainless steel clip-on pool ladder hanging over the wide end of the pool rim.
3-4 polished stainless steel steps, clearly visible inside the pool.
Ladder hangs from the pool edge, NOT built into the pool walls.` : "";

  return `
${waterfallRule}
CRITICAL RULES - MUST FOLLOW ALL:

1. POOL SHAPE: The pool must be ${shapeRule}

2. POOL INSTALLATION — ‼️ CRITICAL:
   The pool is DUG INTO the ground. The earth has been excavated and the pool sits inside the hole.
   The pool rim/coping is AT GROUND LEVEL — perfectly flush with the surrounding terrain.
   The pool walls are UNDERGROUND — completely hidden below the surface, you cannot see the outside of the pool walls.
   NO gap between the pool edge and the ground. NO visible pool exterior walls above ground.
   NOT above ground. NOT raised on a platform. NOT sitting on top of the soil like a box.
   The ground seamlessly meets the pool coping at the same height.

3. DECK COLOR: ${deckColorLabel}. Use EXACTLY this color for the deck/surround.
   THIN precision-cut composite planks. NOT chunky wood. NOT brick. NOT stone.

4. POOL TYPE: Prefabricated fiberglass pool, smooth interior walls.
   NOT a hot tub. NOT a jacuzzi. NOT an above-ground pool. NOT a container pool.
   The pool exterior is buried underground — invisible. Only the interior and coping are visible.

---

EDIT INSTRUCTION:
Image 1 (main scene): The outdoor space where the pool will be placed.
Image 2 (pool reference): This is EXACTLY what the pool must look like — use this exact shape, profile, and proportions.

Task: Seamlessly integrate the pool shown in Image 2 into the open ground area of Image 1.
Match the pool's shape EXACTLY as shown in Image 2 — do not invent or modify the shape.

POOL SPECIFICATIONS:
- Shape: ${shapeDesc}
- Size: ${size} meters
${ceramicDesc ? `- Interior color: ${ceramicDesc}` : ""}
${deckDesc ? `
DECK/SURROUND — COLOR IS CRITICAL:
${deckDesc}
Width: 1.0-1.5 meters on all sides. Sleek and modern appearance.
IMPORTANT: The deck color must be clearly visible. Do not use white or grey if not specified.
` : ""}
${stairRule}

REALISM RULES:
- The pool must look completely realistic and naturally integrated into the existing outdoor space.
- The pool is excavated INTO the ground — the rim is flush with the surrounding soil/grass/paving. No walls visible above ground.
- The deck/surround transitions smoothly from the existing ground level into the pool coping with no step up or raised edge.
- Keep every existing element in the scene exactly as-is — do not add, remove, or modify any structures, buildings, trees, fences, or landscaping.
- Only insert the pool into an available open area.
- Professional photography, natural daylight, photorealistic quality.
  `.trim();
}
