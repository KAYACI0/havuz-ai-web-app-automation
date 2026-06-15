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
  ceviz:        "thin modern composite decking boards 2-3cm thick, tightly spaced, warm medium-brown, contemporary slim-profile design",
  antrasit04:   "thin modern composite decking boards 2-3cm thick, tightly spaced, dark charcoal anthracite, luxury slim-profile design",
  "koyu-kahve": "thin modern composite decking boards 2-3cm thick, tightly spaced, deep dark-brown, contemporary slim-profile design",
  yesil:        "thin modern composite decking boards 2-3cm thick, tightly spaced, earthy green tone, natural slim-profile design",
  kirmizi:      "thin modern composite decking boards 2-3cm thick, tightly spaced, warm terracotta red, bold slim-profile design",
  "gunes-sarisi":"thin modern composite decking boards 2-3cm thick, tightly spaced, warm golden-yellow, vibrant slim-profile design",
  bej:          "thin modern composite decking boards 2-3cm thick, tightly spaced, sandy beige, minimalist slim-profile design",
  kahve:        "thin modern composite decking boards 2-3cm thick, tightly spaced, warm medium-brown, contemporary slim-profile design",
  gri:          "thin modern composite decking boards 2-3cm thick, tightly spaced, cool light-grey, Scandinavian slim-profile design",
  antrasit:     "thin modern composite decking boards 2-3cm thick, tightly spaced, dark charcoal anthracite, luxury slim-profile design",
  teak:         "thin modern teak decking boards 2-3cm thick, tightly spaced, golden-honey natural grain, premium slim-profile design",
  acik_gri:     "thin modern composite decking boards 2-3cm thick, tightly spaced, light silver-grey driftwood, coastal slim-profile design",
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

  return `
Add a prefabricated fiberglass swimming pool to the open ground or grass area visible in this image.

POOL SPECIFICATIONS:
- Shape: ${shapeDesc}
- Size: ${size} meters
${ceramicDesc ? `- Interior: ${ceramicDesc}` : ""}
${deckDesc    ? `- Surrounding deck: ${deckDesc}` : ""}
${stairSection}
${waterfallSection}

CRITICAL RULES:
- The pool must look completely realistic and naturally integrated into the existing outdoor space.
- Keep every existing element in the scene exactly as-is — do not add, remove, or modify any structures, buildings, trees, fences, or landscaping that are already present.
- Only insert the pool into an available open area.
- Professional photography, natural daylight, photorealistic quality.
  `.trim();
}
