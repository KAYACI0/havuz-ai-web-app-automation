const POOL_SHAPE_DESCRIPTIONS: Record<string, string> = {
  RELAX: `strictly rectangular fiberglass pool,
  perfectly straight parallel long sides,
  90-degree corners slightly softened,
  integrated corner staircase entry
  with 3 visible steps in one corner,
  horizontal ribbing texture on interior walls,
  clean boxy rectangular silhouette from above`,

  ROMA: `torpedo-shaped oval fiberglass pool,
  both short ends fully rounded and curved,
  no straight edges anywhere,
  elongated oval/stadium silhouette from above,
  integrated curved staircase entry blending
  into one rounded end with 3 visible steps,
  horizontal ribbing texture on interior walls`,
};

const DECK_MATERIAL_DESCRIPTIONS: Record<string, string> = {
  ceviz: `WARM BROWN colored deck.
    Color: warm chestnut brown, like walnut wood.
    Material: thin modern composite decking boards,
    2-3cm thick planks tightly spaced,
    warm medium-brown tone, natural wood grain texture.
    THE DECK COLOR MUST BE BROWN.`,

  antrasit04: `DARK GREY colored deck.
    Color: very dark charcoal grey, almost black.
    Material: thin modern composite decking boards,
    2-3cm thick planks tightly spaced,
    dark anthracite charcoal tone, matte finish.
    THE DECK COLOR MUST BE DARK GREY.`,

  "koyu-kahve": `DARK BROWN colored deck.
    Color: deep espresso dark brown, very dark.
    Material: thin modern composite decking boards,
    2-3cm thick planks tightly spaced,
    deep dark brown tone, rich walnut texture.
    THE DECK COLOR MUST BE DARK BROWN.`,

  yesil: `GREEN colored deck.
    Color: forest green, saturated medium green.
    Material: thin modern composite decking boards,
    2-3cm thick planks tightly spaced,
    vivid forest green tone, matte finish.
    THE DECK COLOR MUST BE GREEN, not white, not grey.`,

  kirmizi: `RED colored deck.
    Color: deep burgundy red, terracotta red.
    Material: thin modern composite decking boards,
    2-3cm thick planks tightly spaced,
    deep red burgundy tone, matte finish.
    THE DECK COLOR MUST BE RED.`,

  "gunes-sarisi": `GOLDEN YELLOW colored deck.
    Color: warm golden sandy yellow.
    Material: thin modern composite decking boards,
    2-3cm thick planks tightly spaced,
    warm sandy golden tone, matte finish.
    THE DECK COLOR MUST BE GOLDEN YELLOW.`,

  bej: `BEIGE colored deck.
    Color: warm sandy beige, light cream tone.
    Material: thin modern composite decking boards,
    2-3cm thick planks tightly spaced,
    warm beige cream tone, matte finish.
    THE DECK COLOR MUST BE BEIGE.`,
};

const CERAMIC_COLOR_DESCRIPTIONS: Record<string, string> = {
  turkuaz: "vivid turquoise blue ceramic tiles",
  mavi:    "deep cobalt blue ceramic tiles",
  beyaz:   "clean bright white ceramic tiles",
  gri:     "cool slate grey ceramic tiles",
  krem:    "warm cream ivory ceramic tiles",
};

export function buildPoolPrompt(
  model: string,
  size: string,
  deck: string,
  ceramic: string,
  hasWaterfall = false,
  stairType: "corner" | "wide" = "corner"
): string {
  const shapeDesc  = POOL_SHAPE_DESCRIPTIONS[model.toUpperCase()] || `${model} shaped fiberglass pool`;
  const deckDesc   = deck   ? DECK_MATERIAL_DESCRIPTIONS[deck]   || `${deck} colored deck` : null;
  const ceramicDesc = ceramic ? CERAMIC_COLOR_DESCRIPTIONS[ceramic] || `${ceramic} colored ceramic` : null;

  const waterfallSection = hasWaterfall
    ? `- Water feature: elegant pool waterfall/cascade on one short end wall, water flowing smoothly into pool, natural stone or matching coping material`
    : "";

  const stairSection = stairType === "wide"
    ? `- Entry stairs: full-width integrated stairs spanning entire short end, 3 wide steps`
    : `- Entry stairs: corner integrated staircase, 3 steps in one corner, handrail optional`;

  const deckColorLabel = deckDesc
    ? deckDesc.split("\n")[0].trim()
    : "natural";

  const shapeRule = model.toUpperCase() === "ROMA"
    ? "torpedo/oval shaped, elongated oval from above, NO circular/round shape"
    : "strictly rectangular, NO round shape";

  return `
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

Add a prefabricated fiberglass swimming pool to the open ground or grass area visible in this image.

POOL SPECIFICATIONS:
- Shape: ${shapeDesc}
- Size: ${size} meters
${ceramicDesc ? `- Interior: ${ceramicDesc}` : ""}
${deckDesc ? `
DECK/SURROUND — COLOR IS CRITICAL:
${deckDesc}
Width: 1.2-1.5 meters on all sides.
IMPORTANT: The deck color described above
must be clearly visible in the output.
Do not use white or grey if not specified.
` : ""}
${stairSection}
${waterfallSection}

CRITICAL RULES:
- The pool must look completely realistic and naturally integrated into the existing outdoor space.
- Keep every existing element in the scene exactly as-is — do not add, remove, or modify any structures, buildings, trees, fences, or landscaping that are already present.
- Only insert the pool into an available open area.
- Professional photography, natural daylight, photorealistic quality.
  `.trim();
}
