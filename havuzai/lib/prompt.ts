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
    Pool coping and edge must also be #8B6347 — NO white border around the pool.
    NO CERAMIC TILES. ONLY composite deck panels around the pool.`,
  },
  antrasit04: {
    label: "DARK GREY",
    desc: `Composite deck color: #4A4A4A very dark charcoal grey, almost black. NOT white. NOT brown.
    Panel: 4cm wide x 3cm high x 300cm long, parallel to pool edge.
    THE DECK MUST BE HEX COLOR #4A4A4A DARK GREY. WHITE = INVALID.
    Pool coping and edge must also be #4A4A4A — NO white border around the pool.
    NO CERAMIC TILES. ONLY composite deck panels around the pool.`,
  },
  "koyu-kahve": {
    label: "DARK BROWN",
    desc: `Composite deck color: #3D2B1F deep espresso dark brown. NOT white. NOT grey.
    Panel: 4cm wide x 3cm high x 300cm long, parallel to pool edge.
    THE DECK MUST BE HEX COLOR #3D2B1F DARK BROWN. WHITE = INVALID.
    Pool coping and edge must also be #3D2B1F — NO white border around the pool.
    NO CERAMIC TILES. ONLY composite deck panels around the pool.`,
  },
  yesil: {
    label: "GREEN",
    desc: `Composite deck color: #5C7A3E forest green, saturated medium green. NOT white. NOT grey.
    Panel: 4cm wide x 3cm high x 300cm long, parallel to pool edge.
    THE DECK MUST BE HEX COLOR #5C7A3E GREEN. WHITE = INVALID.
    Pool coping and edge must also be #5C7A3E — NO white border around the pool.
    NO CERAMIC TILES. ONLY composite deck panels around the pool.`,
  },
  kirmizi: {
    label: "RED",
    desc: `Composite deck color: #8B3A3A deep dark burgundy red. NOT white. NOT grey. NOT brown.
    Panel: 4cm wide x 3cm high x 300cm long, parallel to pool edge.
    THE DECK MUST BE HEX COLOR #8B3A3A DARK RED / BURGUNDY. WHITE = INVALID.
    Pool coping and edge must also be #8B3A3A — NO white border around the pool.
    NO CERAMIC TILES. ONLY composite deck panels around the pool.`,
  },
  "gunes-sarisi": {
    label: "GOLDEN YELLOW",
    desc: `Composite deck color: #C8A45A warm golden sandy yellow. NOT white. NOT grey.
    Panel: 4cm wide x 3cm high x 300cm long, parallel to pool edge.
    THE DECK MUST BE HEX COLOR #C8A45A GOLDEN YELLOW. WHITE = INVALID.
    Pool coping and edge must also be #C8A45A — NO white border around the pool.
    NO CERAMIC TILES. ONLY composite deck panels around the pool.`,
  },
  bej: {
    label: "BEIGE",
    desc: `Composite deck color: #C4A882 warm sandy beige, light cream. NOT pure white. NOT grey.
    Panel: 4cm wide x 3cm high x 300cm long, parallel to pool edge.
    THE DECK MUST BE HEX COLOR #C4A882 BEIGE. PURE WHITE = INVALID.
    Pool coping and edge must also be #C4A882 — NO white border around the pool.
    NO CERAMIC TILES. ONLY composite deck panels around the pool.`,
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
${hasWaterfall || hasStairs ? `
⚠️ CRITICAL FEATURES THAT MUST APPEAR IN THIS IMAGE:
${hasWaterfall ? `
🚨 #1 PRIORITY: ADD A STAINLESS STEEL COBRA WATERFALL BLADE ON THE POOL EDGE.
THIS IS THE MOST IMPORTANT ELEMENT. DO NOT SKIP THIS.
` : ""}
${hasWaterfall ? "- A stainless steel cobra waterfall blade ON the pool edge (35cm wide) — MANDATORY" : ""}
${hasStairs ? "- A stainless steel 3-step pool ladder ON the pool edge — MANDATORY" : ""}
These features MUST be visible. Missing any of them = completely wrong output.
---` : ""}

You are a professional architectural visualization AI. Your task is to place a luxury villa swimming pool into the provided outdoor photo. The result must look exactly like a real photograph of a completed high-end pool installation — the kind you would see in a luxury villa garden in Turkey or Southern Europe.

Think of this as a real pool that was professionally built and installed. The photo should look like it was taken AFTER the pool was finished and ready to use.

---

MOST IMPORTANT RULE — IN-GROUND POOL INSTALLATION:
This is a PROFESSIONAL IN-GROUND swimming pool. It is built INTO the ground like all real swimming pools.

Imagine: A construction crew came, dug a large hole in the ground, placed the fiberglass pool shell inside the hole, filled in the sides with earth, and finished the surrounding area with deck or ceramic tiles. The pool is now part of the ground.

What you MUST show:
- The pool water surface is at the SAME LEVEL as the surrounding deck or grass
- The pool goes DOWN into the earth — you can see the pool interior going deep
- Only the thin pool coping/rim (5-10cm) sits at ground level
- The pool looks like it has ALWAYS been there — natural, permanent, built-in

What you must NEVER show:
- The pool sitting ON TOP of the ground (like a box or container)
- The pool walls or sides visible above the ground
- ANY gap between the pool and the surrounding ground
- The pool looking like it was placed on the lawn
- The pool elevated above the surrounding surface in any way

This is the MOST CRITICAL rule. A pool raised above ground = completely wrong output.

---

RULE 1 — PRESERVE THE SCENE
Keep EVERYTHING in the original photo exactly as it is:
- Buildings, houses, villas — do NOT touch them
- Trees, hedges, plants — do NOT remove or change
- Fences, walls, paths — do NOT alter
- Only add the pool to the available open ground area
- Pool must not block the main building's view

---

RULE 2 — POOL SHAPE: ${model.toUpperCase()}
${shapeDesc}
Shape: ${shapeRule}
Size: ${size} meters — maintain exact proportions.

---

RULE 3 — POOL WATER COLOR
${ceramicDesc ?? "Standard bright blue fiberglass pool interior. Water is clear, bright blue, with natural light reflections and depth."}
The water must look real — with depth, light shimmer, and natural color variation.

---

${deckDesc ? `
RULE 4 — DECK SURROUND (NO CERAMIC — DECK ONLY)
${deckDesc}
- Deck width: exactly 1 meter on ALL sides of the pool
- Panels run parallel to the nearest pool edge
- The deck sits flush at ground/water level — NOT raised
- NO ceramic tiles anywhere — ONLY the deck described above
- The specified color MUST be clearly visible — no substitutions
` : ""}

${!deckDesc && ceramicDesc ? `
RULE 4 — CERAMIC TILE SURROUND (NO DECK)
- 1 meter wide ceramic tile walkway around ALL sides of the pool
- Tile size: 33cm x 66cm rectangular tiles
- Regular grid layout with clearly visible grout lines (2-3mm)
- Tiles sit flush at ground level — NOT raised
- Neutral stone-look finish (light grey or cream)
- NO composite deck panels — ONLY ceramic tiles
` : ""}

${!deckDesc && !ceramicDesc ? `
RULE 4 — POOL SURROUND
- Natural grass or existing ground material up to the pool edge
- Clean pool coping/rim at ground level
` : ""}

---

${hasStairs ? `
RULE 5 — POOL LADDER (MANDATORY — MUST BE IN THE IMAGE)
A professional stainless steel pool ladder MUST appear in the final image.
- Type: 3-step stainless steel pool entry ladder (muro type)
- Material: highly polished chrome stainless steel — shiny, reflective
- Position: mounted ON THE POOL EDGE at one SHORT END of the pool
- The ladder steps go DOWN INTO the pool water from the edge
- The ladder is flush with the pool rim — part of the pool structure
- Realistic size proportional to the pool
- DO NOT place the ladder on the deck or floating — it must be ON the pool edge
MISSING LADDER = INVALID OUTPUT.
` : ""}

${hasWaterfall ? `
RULE 6 — WATERFALL BLADE (MANDATORY — MUST BE IN THE IMAGE)
A professional stainless steel waterfall blade MUST appear in the final image.
- Type: cobra-style curved stainless steel waterfall blade
- Size: small and elegant — 35cm wide x 40cm tall MAXIMUM
- Material: brushed polished stainless steel with chrome-like finish
- Position: mounted DIRECTLY ON THE POOL COPING on one LONG side of the pool
- The base of the waterfall sits ON the pool edge — NOT on the deck, NOT floating
- Water flows in a smooth, thin, elegant sheet from the blade DOWN INTO the pool
- The waterfall is a small decorative accent — elegant and proportional, NOT dominant
- It must look like a real premium pool accessory, naturally integrated
MISSING WATERFALL = INVALID OUTPUT.
OVERSIZED WATERFALL (wider than 35cm) = INVALID OUTPUT.
` : ""}

---

RULE 7 — PHOTOREALISTIC QUALITY
- The final image must look like a real professional photograph
- Match the exact camera angle and perspective of the original photo
- Match the lighting, shadows, and time of day of the original photo
- The pool must look completely natural in the scene — like it was always there
- Luxury villa quality — professional, clean, premium finish
- No artificial-looking edges or compositing artifacts

---

ABSOLUTE PROHIBITIONS:
❌ Pool above ground level in any way
❌ Pool walls or sides visible above the surrounding surface
❌ Wrong deck color${mat ? ` — must be ${mat.label}` : ""}
❌ Ceramic tiles when deck is selected
❌ Deck panels when ceramic is selected
❌ Wrong pool shape — must stay ${isRoma ? "OVAL/TEARDROP" : "RECTANGLE"}
❌ Missing ladder when selected
❌ Missing waterfall when selected
❌ Waterfall wider than 35cm
❌ Waterfall or ladder not on the pool edge
❌ White border or coping that doesn't match the deck color
❌ Cartoon, render, 3D, or illustration style — PHOTO ONLY
  `.trim();
}