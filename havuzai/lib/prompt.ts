const POOL_SHAPE_DESCRIPTIONS: Record<string, string> = {
  RELAX: `strictly rectangular fiberglass pool,
  perfectly straight parallel long sides,
  90-degree corners slightly softened,
  horizontal ribbing texture on interior walls,
  clean boxy rectangular silhouette from above`,

  ROMA: `Prefabricated fiberglass pool with
  asymmetric leaf/teardrop shape from above.
  One short end is wider and rounded.
  Other short end is narrower and pointed.
  Like a rounded rectangle that tapers toward one end.
  Long sides curve slightly inward.
  NOT circular. NOT symmetric oval.
  NOT torpedo shaped.
  The wide rounded end is the entry side.
  The narrow tapered end is the far end.
  Horizontal ribbing texture on interior walls.`,
};

const DECK_MATERIALS: Record<string, { label: string; desc: string }> = {
  ceviz: {
    label: "WARM BROWN",
    desc: `WARM BROWN colored deck.
    Color: warm chestnut brown, like walnut wood.
    Material: thin modern composite decking boards,
    2-3cm thick planks tightly spaced,
    warm medium-brown tone, natural wood grain texture.
    THE DECK COLOR MUST BE BROWN.`,
  },
  antrasit04: {
    label: "DARK GREY",
    desc: `DARK GREY colored deck.
    Color: very dark charcoal grey, almost black.
    Material: thin modern composite decking boards,
    2-3cm thick planks tightly spaced,
    dark anthracite charcoal tone, matte finish.
    THE DECK COLOR MUST BE DARK GREY.`,
  },
  "koyu-kahve": {
    label: "DARK BROWN",
    desc: `DARK BROWN colored deck.
    Color: deep espresso dark brown, very dark.
    Material: thin modern composite decking boards,
    2-3cm thick planks tightly spaced,
    deep dark brown tone, rich walnut texture.
    THE DECK COLOR MUST BE DARK BROWN.`,
  },
  yesil: {
    label: "GREEN",
    desc: `GREEN colored deck.
    Color: forest green, saturated medium green.
    Material: thin modern composite decking boards,
    2-3cm thick planks tightly spaced,
    vivid forest green tone, matte finish.
    THE DECK COLOR MUST BE GREEN, not white, not grey.`,
  },
  kirmizi: {
    label: "RED",
    desc: `RED colored deck.
    Color: deep burgundy red, terracotta red.
    Material: thin modern composite decking boards,
    2-3cm thick planks tightly spaced,
    deep red burgundy tone, matte finish.
    THE DECK COLOR MUST BE RED.`,
  },
  "gunes-sarisi": {
    label: "GOLDEN YELLOW",
    desc: `GOLDEN YELLOW colored deck.
    Color: warm golden sandy yellow.
    Material: thin modern composite decking boards,
    2-3cm thick planks tightly spaced,
    warm sandy golden tone, matte finish.
    THE DECK COLOR MUST BE GOLDEN YELLOW.`,
  },
  bej: {
    label: "BEIGE",
    desc: `BEIGE colored deck.
    Color: warm sandy beige, light cream tone.
    Material: thin modern composite decking boards,
    2-3cm thick planks tightly spaced,
    warm beige cream tone, matte finish.
    THE DECK COLOR MUST BE BEIGE.`,
  },
};

const CERAMIC_COLOR_DESCRIPTIONS: Record<string, string> = {
  turkuaz: "vivid turquoise blue ceramic tiles",
  mavi:    "deep cobalt blue ceramic tiles",
  beyaz:   "clean bright white ceramic tiles",
  gri:     "cool slate grey ceramic tiles",
  krem:    "warm cream ivory ceramic tiles",
};

export interface PoolConfig {
  model:        string;
  size:         string;
  deck:         string;
  ceramic:      string;
  hasWaterfall: boolean;
  stairType:    "corner" | "wide";
}

export function buildPoolPrompt(config: PoolConfig): string {
  const { model, size, deck, ceramic, hasWaterfall, stairType } = config;

  const shapeDesc      = POOL_SHAPE_DESCRIPTIONS[model.toUpperCase()] || `${model} shaped fiberglass pool`;
  const mat            = deck ? DECK_MATERIALS[deck] : null;
  const deckColorLabel = mat?.label ?? "natural";
  const deckDesc       = mat?.desc  ?? null;
  const ceramicDesc    = ceramic ? CERAMIC_COLOR_DESCRIPTIONS[ceramic] || `${ceramic} colored ceramic` : null;
  const shapeRule = model.toUpperCase() === "ROMA"
    ? "torpedo/oval shaped, elongated oval from above, NO circular/round shape"
    : "strictly rectangular, NO round shape";

  const waterfallRule = hasWaterfall ? `
‼️ MANDATORY: POOL WALL WATERFALL
A water blade waterfall mounted ON the pool's short end wall/coping.
Water flows FROM the pool wall edge, falling only 20-30cm into the pool water.
Like a thin sheet of water coming out from a slot in the pool wall.
NOT a natural waterfall. NOT water falling from the sky. NOT a fountain shooting up.
The water source is the pool wall itself, mounted flush with the coping.
` : "";

  const stairRule = `POOL ENTRY STAIRS:
External clip-on pool ladder/stairs hanging over the pool edge.
NOT built into the pool walls. NOT integrated steps inside the pool.
A removable A-frame or straight ladder with 3-4 steps, hanging on the pool rim,
made of stainless steel or white plastic.`;

  return `
${waterfallRule}
CRITICAL RULES - MUST FOLLOW ALL:

1. POOL SHAPE: The pool must be ${shapeRule}.

2. POOL INSTALLATION: The pool must be IN-GROUND or flush with ground level.
   NOT above ground. NOT raised on a platform.
   NOT sitting on top of the ground like a container.

3. DECK COLOR: The deck/surround color is ${deckColorLabel}. Use EXACTLY this color for
   the wooden boards around the pool.
   NOT brick. NOT tile. NOT stone texture.
   WOODEN BOARDS in ${deckColorLabel} color.

4. POOL TYPE: This is a prefabricated fiberglass pool, smooth walls,
   NOT an above-ground pool,
   NOT a round hot tub,
   NOT a jacuzzi.

---

EDIT INSTRUCTION:
Seamlessly integrate a prefabricated fiberglass swimming pool into the open ground or grass area visible in this image.

POOL SPECIFICATIONS:
- Shape: ${shapeDesc}
- Size: ${size} meters
${ceramicDesc ? `- Interior: ${ceramicDesc}` : ""}
${deckDesc ? `
DECK/SURROUND — COLOR IS CRITICAL:
${deckDesc}
Width: 1.2-1.5 meters on all sides.
IMPORTANT: The deck color described above must be clearly visible in the output.
Do not use white or grey if not specified.
` : ""}
${stairRule}

REALISM RULES:
- The pool must look completely realistic and naturally integrated into the existing outdoor space.
- Keep every existing element in the scene exactly as-is — do not add, remove, or modify any structures, buildings, trees, fences, or landscaping that are already present.
- Only insert the pool into an available open area.
- Professional photography, natural daylight, photorealistic quality.
  `.trim();
}
