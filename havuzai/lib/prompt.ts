import type { ClientConfig } from "./config-types";

export interface PoolConfig {
  model: string;
  size: string;
  deck: string;
  ceramic: string;
  hasWaterfall: boolean;
  hasStairs: boolean;
  stairType: "corner" | "wide";
}

// Türkçe renk adlarını İngilizceye çevirir — model Türkçe rengi tanımıyor
// ("Mavi tiles" → kırmızı tuğla vakası daha önce yaşandı).
const COLOR_EN: Record<string, string> = {
  mavi: "blue", beyaz: "white", gri: "gray", "açık gri": "light gray",
  "koyu gri": "dark gray", antrasit: "anthracite gray", bej: "beige",
  krem: "cream", kahverengi: "brown", "açık kahve": "light brown",
  siyah: "black", yeşil: "green", turkuaz: "turquoise", kum: "sand",
  kırmızı: "brick red", bordo: "burgundy",
};
const toEnColor = (name: string) => COLOR_EN[name.trim().toLowerCase()] ?? name;

export function buildPoolPrompt(config: PoolConfig, clientConfig: ClientConfig): string {
  const { model, size, ceramic, deck } = config;

  const poolModel = clientConfig.pool_models.find((m) => m.id === model);
  const modelName = poolModel?.name || model;
  const shapeDesc = poolModel?.prompt_description || poolModel?.description || `${model} shaped fiberglass pool`;
  const isRoma = model.toUpperCase() === "ROMA" || modelName.toUpperCase() === "ROMA";

  const deckColor = deck ? clientConfig.deck_colors.find((d) => d.id === deck) : null;
  const ceramicColor = ceramic ? clientConfig.ceramic_colors.find((c) => c.id === ceramic) : null;
  const ceramicColorEn = ceramicColor ? toEnColor(ceramicColor.name) : "";
  const deckColorEn = deckColor ? toEnColor(deckColor.name) : "";

  const hasSecondRef = !!poolModel?.reference_image_url_2;
  const stairRef = clientConfig.features?.stair_reference_url;
  const hasStairRef = config.hasStairs && !!stairRef;

  let idx = 2;
  const guideLines: string[] = [
    "- Image 1: Customer garden/property photo — EDIT THIS IMAGE",
    `- Image 2: ${modelName} pool model — THIS IS THE EXACT POOL SHAPE REFERENCE`,
  ];

  if (hasSecondRef) {
    idx++;
    guideLines.push(`- Image ${idx}: ${modelName} secondary pool reference — use only to confirm the same model details`);
  }
  if (config.hasWaterfall) {
    idx++;
    guideLines.push(`- Image ${idx}: Waterfall reference — use this waterfall style`);
  }
  if (hasStairRef) {
    idx++;
    guideLines.push(`- Image ${idx}: Ladder reference — use this ladder style`);
  }

  const referenceGuide = guideLines.join("\n");

  return `
You are a professional architectural visualization AI. Edit the customer garden photo and add the selected fiberglass pool so the result looks like a real photograph of a professionally installed pool.

REFERENCE IMAGES
${referenceGuide}

PRIORITY ORDER
1. Preserve the original house, trees, hedges, fences and garden — treat everything except the lawn/pool area as untouchable, pixel-identical to the original.
2. Use Image 2 (and Image 3 if present) as the exact pool-shape reference — match the silhouette precisely, including any asymmetry.
3. Place and orient the pool to best fit the usable open lawn (see ORIENTATION below).
4. Keep the pool modest in size: about 8-10% of the visible frame, never oversized or close to the camera.
5. Install the selected surround as part of the ground, not on top of it.
6. Match the original camera angle, perspective, lighting and shadows.

POOL — ${modelName.toUpperCase()}
${isRoma ? `ROMA IS ASYMMETRIC — NOT AN OVAL, NOT A SYMMETRIC PILL SHAPE.
Copy the exact ROMA silhouette from Image 2: one end is wide and fully rounded, the other end is narrower with a blunt chamfered point (not sharp, not round — like a boat's bow). The two long sides are not parallel; they taper gently between the two different ends. Preserve this exact asymmetric contour and its proportions. Do not turn it into a symmetric ellipse, oval, kidney, teardrop, bean shape, pill/stadium shape, or sharp-corner rectangle. Scale the same shape uniformly; do not redesign its geometry to fit the garden.` : shapeDesc}
Selected size: ${size}. Preserve the model proportions.
The pool must be fully in-ground, with the water surface at ground level and only a thin coping visible. Never make the pool look raised or placed on top of the lawn.

ORIENTATION — CHOOSE AUTOMATICALLY FROM THE PHOTO
Look at the usable open lawn area in Image 1:
- If that open area is WIDER than it is deep (more space left-to-right than front-to-back), orient the pool with its LONG axis running LEFT-TO-RIGHT (horizontal).
- If that open area is DEEPER than it is wide (more space front-to-back than left-to-right), orient the pool with its LONG axis running AWAY FROM THE CAMERA toward the back of the garden (vertical).
- Pick whichever orientation lets the pool sit with generous, even grass margins on all sides — never the orientation that forces the pool close to a fence, hedge, or the edge of the frame.
- Keep the pool's edges level and straight in the image — do not tilt it to a random diagonal angle.

PLACEMENT
- Choose the clearest open lawn area with a natural view toward the house.
- Keep the pool's long axis straight and level (per ORIENTATION above) — do not warp or angle it to chase converging fence/path lines in the photo's perspective.
- Leave visible lawn around the pool on all four sides; do not fill the garden with the pool.
- Do not cover or alter existing buildings, trees, hedges, paths or important landscaping.

SURROUND
${ceramicColor ? `CERAMIC: ${ceramicColorEn}
LARGE matte ${ceramicColorEn} porcelain paving slabs — RECTANGULAR, each slab clearly TWICE as long as it is wide (about 33cm x 66cm), laid long-side parallel to the pool edge in a RUNNING-BOND brick pattern with staggered joints. NOT mosaic, NOT small square tiles, NOT bathroom tiles.
Two slab rows around the pool, about 1.2m total width. HARD MAXIMUM: the paving's outer edge is never more than about 1.3m from the pool's water edge, measured straight out from the pool wall — if it looks wider than that, it is wrong. The ceramic outline follows the exact pool perimeter, including the rounded and chamfered ROMA ends.
One color and material everywhere, including the row touching the water — never a lighter, darker, or white border row. Water meets slab directly with only a thin natural waterline shadow.
The paving is SUNK INTO the lawn like a real in-ground patio: its surface sits at exactly the same level as the grass — zero elevation, no visible slab thickness, no raised platform edge, no step, no shadow gap where paving meets lawn. Grass blades touch the outer edge of the paving directly.
The rest of the garden remains grass. Do not create a large patio, platform, rectangle, or diamond larger than this. Clean surface — no covers, lids, or fixtures on the paving.` : deckColor ? `DECK: ${deckColorEn}
${deckColorEn} composite wood boards, about 20cm wide, laid parallel to the pool edge. About 1.2m total width around the pool. HARD MAXIMUM: the deck's outer edge is never more than about 1.3m from the pool's water edge, measured straight out from the pool wall — if it looks wider than that, it is wrong. The deck outline follows the exact pool perimeter, including the rounded and chamfered ROMA ends.
The deck is SUNK INTO the lawn like a real in-ground terrace: its surface sits at exactly the same level as the grass — zero elevation, no visible board thickness, no raised platform edge, no step, no shadow gap where the deck meets the lawn. Boards reach the water directly and act as the coping — no white strip, and the board row at the water is identical to the others.
The rest of the garden remains grass. Do not create a large patio, platform, rectangle, or diamond larger than this. Clean surface — no covers or fixtures on the deck.` : `NO SURROUND SELECTED
Use only a thin natural pool coping (5-10cm), matte stone-gray or light beige, never bright white or plastic-looking. Grass/soil meets the pool edge directly, flush, with no gap.`}

WATER
Clear realistic blue pool water with natural reflections, depth and subtle light variation.

${hasStairRef || config.hasStairs ? `LADDER
Add exactly ONE selected stainless-steel pool ladder on a short end of the pool, matching the ladder reference when provided. Never two ladders.
` : ""}
${config.hasWaterfall ? `WATERFALL
Add exactly ONE selected stainless-steel waterfall on the pool edge, matching the waterfall reference. Never two waterfalls.
` : ""}
FINAL QUALITY
Photorealistic only. The pool, surround, shadows, reflections and ground contact must look physically real and naturally built into the original garden, as if it had always been there. No pasted overlay, floating surface, Photoshop cutout, 3D render or artificial-looking ground.

DO NOT:
- change the existing property or landscaping in any way
- make the pool oversized or place it close to the camera
- change the selected pool model
- make ROMA a symmetric oval, kidney, teardrop, pill/stadium shape, or sharp rectangle
- make ceramic/deck wider than the stated maximum, or a different shape than the pool's own perimeter
- extend ceramic/deck across the lawn or toward any fence/hedge/boundary
- place ceramic/deck on top of the grass like a raised platform — it must be sunk flush with zero elevation
- create a large patio/platform around the pool
- warp or angle the pool to follow the garden's converging perspective lines instead of sitting level
`.trim();
}