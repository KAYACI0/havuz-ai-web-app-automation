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

export function buildPoolPrompt(config: PoolConfig, clientConfig: ClientConfig): string {
  const { model, size, ceramic, deck } = config;

  const poolModel = clientConfig.pool_models.find((m) => m.id === model);
  const modelName = poolModel?.name || model;
  const shapeDesc = poolModel?.prompt_description || poolModel?.description || `${model} shaped fiberglass pool`;
  const isRoma = model.toUpperCase() === "ROMA" || modelName.toUpperCase() === "ROMA";

  const deckColor = deck ? clientConfig.deck_colors.find((d) => d.id === deck) : null;
  const ceramicColor = ceramic ? clientConfig.ceramic_colors.find((c) => c.id === ceramic) : null;

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
1. Preserve the original house, trees, hedges, fences and garden.
2. Use Image 2 as the exact pool-shape reference.
3. Place the pool naturally in the best open area near the house.
4. Keep the pool modest in size: about 8-10% of the visible frame, never oversized or close to the camera.
5. Install the selected surround as part of the ground, not on top of it.
6. Match the original camera angle, perspective, lighting and shadows.

POOL — ${modelName.toUpperCase()}
${isRoma ? `ROMA IS NOT AN OVAL.
Copy the exact ROMA silhouette from Image 2. Keep its long straight parallel sides and its controlled rounded corners. Preserve the same length/width ratio and overall contour. Do not turn it into an ellipse, oval, kidney, teardrop, bean shape or sharp-corner rectangle. Scale the same ROMA shape uniformly; do not redesign its geometry to fit the garden.` : shapeDesc}
Selected size: ${size}. Preserve the model proportions.
The pool must be fully in-ground, with the water surface at ground level and only a thin coping visible. Never make the pool look raised or placed on top of the lawn.

PLACEMENT
- Choose the clearest open lawn area with a natural view toward the house.
- Align the pool with the existing perspective lines of the garden and house.
- Leave visible lawn around the pool; do not fill the garden with the pool.
- Do not cover or alter existing buildings, trees, hedges, paths or important landscaping.

SURROUND
${ceramicColor ? `CERAMIC: ${ceramicColor.name}
Create ONLY a narrow 40-50 cm ceramic border immediately around the pool.
The ceramic outline must follow the exact pool perimeter, including the rounded ROMA corners.
It replaces a narrow strip of grass; it is physically installed into the ground at the same level as the lawn.
The rest of the garden remains grass. Do not create a large patio, platform, rectangle or diamond.
Use realistic grout lines, perspective, contact shadows and natural grass/soil contact at the outer edge.
The ceramic must look built into the landscape, never pasted over the grass or floating above it.` : deckColor ? `DECK: ${deckColor.name}
Create ONLY a narrow 40-50 cm composite deck border immediately around the pool.
The deck outline must follow the exact pool perimeter, including the rounded ROMA corners.
It replaces a narrow strip of grass and sits flush with the surrounding ground.
The rest of the garden remains grass. Do not create a large patio, platform, rectangle or diamond.
Use realistic board perspective, contact shadows and natural grass/soil contact at the outer edge.
The deck must look built into the landscape, never pasted over the grass or floating above it.` : `NO SURROUND SELECTED
Use only a thin natural pool coping. Grass/soil meets the pool edge directly.`}

WATER
Clear realistic blue pool water with natural reflections, depth and subtle light variation.

${hasStairRef || config.hasStairs ? `LADDER
Add the selected stainless-steel pool ladder on a short end of the pool, matching the ladder reference when provided.
` : ""}
${config.hasWaterfall ? `WATERFALL
Add the selected stainless-steel waterfall on the pool edge, matching the waterfall reference.
` : ""}
FINAL QUALITY
Photorealistic only. The pool, surround, shadows, reflections and ground contact must look physically real and naturally built into the original garden. No pasted overlay, floating surface, Photoshop cutout, 3D render or artificial-looking ground.

DO NOT:
- change the existing property or landscaping
- make the pool oversized
- change the selected pool model
- make ROMA oval, kidney, teardrop or sharp rectangular
- make ceramic/deck wider than necessary
- extend ceramic/deck across the lawn
- place ceramic/deck on top of the grass
- create a large patio/platform around the pool
`.trim();
}