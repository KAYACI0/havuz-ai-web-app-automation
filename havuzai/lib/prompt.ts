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

  const shapeDesc   = POOL_SHAPE_DESCRIPTIONS[model.toUpperCase()] || `${model} shaped fiberglass pool`;
  const mat         = deck ? DECK_MATERIALS[deck] : null;
  const deckDesc    = mat?.desc ?? null;
  const ceramicDesc = ceramic ? CERAMIC_COLOR_DESCRIPTIONS[ceramic] || `${ceramic} colored interior` : null;
  const isRoma      = model.toUpperCase() === "ROMA";
  const shapeRule   = isRoma
    ? "OVAL/TEARDROP shaped — asymmetric, curved sides, one wide rounded end, one narrow tapered end. ABSOLUTELY NOT rectangular."
    : "strictly rectangular — straight sides, 90-degree corners. ABSOLUTELY NOT oval or curved.";

  return `
GOAL: Seamlessly integrate the selected swimming pool into the uploaded outdoor photo. Result must look like a real professional photograph — NOT a render, NOT a cartoon, NOT an illustration.

---

RULE 1 — PRESERVE ALL EXISTING ELEMENTS
Keep every existing element in the photo EXACTLY as it is.
Do NOT change buildings, trees, fences, walls, or landscaping.
Place the pool ONLY in an available open ground area.
The pool must NOT block the view of the main building.
Priority: 1) Existing building → 2) Surrounding landscape → 3) Pool placement

---

RULE 2 — IN-GROUND INSTALLATION (CRITICAL)
The pool MUST be dug INTO the ground — fully in-ground installation.
CORRECT: Water surface is flush with the surrounding lawn or deck. Only thin coping edge (10-15cm) visible above ground.
WRONG: Pool sitting ON TOP of ground like a box. Pool walls rising above ground. Pool floating on the lawn.
IN-GROUND. BELOW GROUND LEVEL. WATER SURFACE = GROUND LEVEL.

---

RULE 3 — POOL SHAPE
Model: ${model.toUpperCase()}
${shapeDesc}
Shape rule: ${shapeRule}
Size: ${size} meters — render exact proportions.

---

RULE 4 — POOL INTERIOR COLOR
${ceramicDesc ?? "Standard blue fiberglass interior. Water appears bright blue."}
Water must look realistic with natural depth and light reflections.

---

${deckDesc ? `
RULE 5 — DECK COLOR (CRITICAL)
${deckDesc}
Deck width: exactly 1 meter on all sides around the pool.
Panels run parallel to the nearest pool edge.
THE DECK COLOR ABOVE IS MANDATORY. ANY OTHER COLOR = INVALID OUTPUT.
` : ""}

${!deckDesc && ceramicDesc ? `
RULE 5 — CERAMIC TILE SURROUND
1 meter wide ceramic tile walkway around all sides of the pool.
Tile size: 33cm x 66cm rectangular format.
Regular grid pattern with visible grout lines (2-3mm wide).
Neutral color ceramic (light grey or cream stone look).
` : ""}

---

${hasStairs ? `
RULE 6 — POOL LADDER (MANDATORY)
A stainless steel pool ladder MUST be visible in the final image. DO NOT omit this.
- Style: classic 3-step stainless steel pool ladder (muro type)
- Material: polished chrome stainless steel, shiny and realistic
- Position: mounted flush on one SHORT END of the pool edge, steps going DOWN INTO the water
- Size: proportional to the pool — naturally integrated into the pool corner/edge
- The ladder sits ON the pool edge only — NOT on the deck, NOT floating
OMITTING THE LADDER = INVALID OUTPUT.
` : ""}

${hasWaterfall ? `
RULE 7 — WATERFALL BLADE (MANDATORY)
A stainless steel waterfall blade MUST be visible in the final image. DO NOT omit this.
- Style: Cobra/curved stainless steel waterfall blade
- Size: small and proportional — approximately 35cm wide, 40cm tall
- Material: polished brushed stainless steel, chrome reflective finish
- Position: mounted DIRECTLY ON THE POOL COPING EDGE on one LONG side of the pool
- The waterfall must be ON the pool edge ONLY — NOT on the deck, NOT floating, NOT beside the pool
- Water: smooth thin sheet flowing over the curved blade DOWN INTO the pool water
- Must look proportional and elegant — NOT oversized, NOT dominating the scene
OMITTING THE WATERFALL = INVALID OUTPUT.
` : ""}

---

RULE 8 — VISUAL QUALITY
Output must look like a real professional photograph.
Pool perspective must exactly match the camera angle of the original photo.
Lighting and shadows must match the existing photo naturally.
Pool must look fully integrated — like it was actually built there.
Professional architectural visualization quality.

---

ABSOLUTE PROHIBITIONS:
- Do NOT show pool above ground level
- Do NOT use wrong deck color${mat ? ` (must be ${mat.label})` : ""}
- Do NOT change pool shape (${isRoma ? "must stay OVAL/TEARDROP" : "must stay RECTANGLE"})
- Do NOT omit ladder or waterfall if selected
- Do NOT make waterfall larger than 35cm wide
- Do NOT place waterfall or ladder anywhere except ON the pool edge
- Do NOT produce cartoon, render, or illustration style
  `.trim();
}