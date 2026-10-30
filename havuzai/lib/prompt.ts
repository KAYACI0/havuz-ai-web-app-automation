import type { ClientConfig } from "./config-types";

export interface PoolConfig {
  model:        string;
  size?:        string;   // Süs havuzunda ölçü seçimi yok, boş gelir.
  // Aşağıdaki alanlar ARTIK PROMPT'A GİRMİYOR (yapay zekayı karıştırmasın diye).
  // Çağıran kodlar bozulmasın diye tipte duruyorlar; seçimler sipariş kaydına
  // ve yönetim paneline bilgi olarak gider.
  deck?:         string;
  ceramic?:      string;
  hasWaterfall?: boolean;
  hasStairs?:    boolean;
  stairType?:    "corner" | "wide";
}

export function buildPoolPrompt(config: PoolConfig, clientConfig: ClientConfig): string {
  const { model, size } = config;

  // Firma config'inden model bilgisini bul
  const poolModel = clientConfig.pool_models.find((m) => m.id === model);
  const modelName = poolModel?.name || model;

  // Süs havuzu / şelale ürünleri için ayrı prompt
  if (poolModel?.category === "sus") {
    return buildOrnamentalPrompt(
      modelName,
      poolModel.prompt_description || poolModel.description || modelName
    );
  }

  const shapeDesc = poolModel?.prompt_description || poolModel?.description || `${model} shaped fiberglass pool`;

  const isRoma = model.toUpperCase() === "ROMA";
  const shapeRule = isRoma
    ? "OVAL/TEARDROP shaped — asymmetric, curved sides, one wide rounded end, one narrow tapered end. ABSOLUTELY NOT rectangular."
    : "strictly rectangular — straight sides, 90-degree corners. ABSOLUTELY NOT oval or curved.";

  return `
You are a professional architectural visualization AI. Your task is to place a luxury fiberglass swimming pool into the provided outdoor photo. The result must look exactly like a real photograph taken after the pool was professionally built and installed.

REFERENCE IMAGES GUIDE:
- Image 1: Customer garden/property photo — THIS IS THE IMAGE TO EDIT
- Image 2 (and Image 3 if provided): ${modelName} pool model reference photos — USE THIS EXACT POOL SHAPE

---

MOST IMPORTANT RULE — IN-GROUND POOL INSTALLATION:
This is a PROFESSIONAL IN-GROUND swimming pool, built INTO the ground.

What you MUST show:
- The pool water surface is at the SAME LEVEL as the surrounding grass or ground
- The pool goes DOWN into the earth — only the thin coping/rim (5-10cm) is at ground level
- The pool looks like it has ALWAYS been there — natural, permanent, built-in
- Surrounding grass or ground meets the pool edge naturally

What you must NEVER show:
- The pool sitting ON TOP of the ground like a box or container
- The pool walls or sides visible above the ground
- Any gap between the pool and the surrounding ground
- The pool elevated above the surrounding surface

THIS IS THE MOST CRITICAL RULE. Pool raised above ground = completely wrong output.

---

RULE 1 — PRESERVE THE SCENE
Keep EVERYTHING in the original photo exactly as it is:
- Buildings, houses, villas — do NOT touch them
- Trees, hedges, plants — do NOT remove or change
- Fences, walls, paths — do NOT alter
- Only add the pool to the available open ground/grass area
- Pool must NOT block the main building's view

---

RULE 2 — POOL SHAPE: ${modelName.toUpperCase()}
${shapeDesc}
Shape rule: ${shapeRule}
Size: ${size} meters — maintain exact proportions.
The pool must be SMALL relative to the garden — roughly 20-25% of the visible open garden area.
The pool must be clearly SMALLER than the house/building.
There must be visible grass on ALL sides around the pool — at least 2-3 meters of grass between pool edge and garden boundaries.
DO NOT fill the garden with the pool.

---

RULE 3 — POOL WATER
Clear, bright blue fiberglass pool interior.
Water is realistic — natural depth, light shimmer, and color variation.
The pool interior goes visibly deep into the ground.

---

RULE 4 — POOL SURROUND (KEEP IT PLAIN)
The existing ground (grass, soil, or whatever is in the original photo) meets the pool edge directly.
Add ONLY the pool itself. Do not add any extra accessories or landscaping elements:
- no deck or wooden flooring
- no ceramic tiles, stone, pavers, or walkway around the pool
- no waterfall or water feature
- no external ladder or handrail
The pool shell must be completely hidden below ground — NO visible pool walls or sides outside.
Only the water surface and thin rim are visible — everything else is underground.

---

RULE 5 — PHOTOREALISTIC QUALITY
- Output must look like a real professional photograph
- Match the exact camera angle and perspective of the original photo
- Match the lighting, shadows, and time of day of the original photo
- The pool must look completely natural — like it was always there
- Luxury villa quality — professional, clean, premium finish

---

ABSOLUTE PROHIBITIONS:
❌ Pool above ground level in any way
❌ Pool walls or sides visible above the surrounding surface
❌ Wrong pool shape — must match Image 2 exactly
❌ Changing existing buildings, trees, or landscaping
❌ Adding deck, tiles, waterfall, or ladder — the pool only
❌ Cartoon, render, 3D, or illustration style — PHOTO ONLY
  `.trim();
}

/**
 * Süs havuzu / dekoratif şelale ürünleri (category: "sus").
 * Bunlar zemine GÖMÜLMEZ; bağımsız bir ürün olarak zeminin ÜSTÜNE yerleştirilir.
 * Ürünün gerçek ölçüsü, firma config'indeki prompt_description alanından okunur
 * (örn. "140 cm wide", "59.5 cm high") — bu yüzden o alana boyut yazılmalı.
 */
function buildOrnamentalPrompt(productName: string, productDesc: string): string {
  return `
You are a professional photo-editing AI. Your task is to place a decorative garden water feature into the provided outdoor photo. The result must look exactly like a real photograph taken after the product was delivered and installed.

REFERENCE IMAGES GUIDE:
- Image 1: Customer garden/property photo — THIS IS THE IMAGE TO EDIT
- Image 2 (and Image 3 if provided): "${productName}" product reference photos — REPRODUCE THIS EXACT PRODUCT

---

THE PRODUCT: ${productName.toUpperCase()}
${productDesc}
Reproduce the product exactly as in the reference: same shape, tiers, material, color, texture and details. Do not redesign, simplify or restyle it.
The water feature is switched ON and running. IMPORTANT: the reference photos may show the product dry or switched off. Do NOT copy the dry look. In your output you must add visible flowing water:
- thin silver-white streams of water pouring from the lip of every upper bowl or spout into the next one below
- small splashes, ripples and light reflections in the basins
- slightly darker, wet stone under each water stream
- water collected in the lowest basins
- if the product has a fountain jet, show the jet spraying and falling back into the basin
The water must be clearly noticeable at normal viewing size, not hidden or barely visible.

---

PLACEMENT — YOU CHOOSE THE BEST SPOT
Analyze the garden photo and place the product in the most suitable open area:
- Flat, open ground (lawn, pavers or gravel) with enough free space around it
- In the mid-ground: roughly one third to one half of the way from the camera to the house, so the product is clearly visible and its details can be seen, but the perspective does not exaggerate its size. Never in the extreme foreground right next to the camera, and never far away beside the house or the background trees
- Prefer a natural spot such as next to the garden path, near the terrace or house entrance, or at the edge of the lawn, rather than alone in the middle of a big empty lawn
- Not blocking doors, windows, entrances, driveways or main walkways
- Not directly under tree branches, not touching walls or fences (leave at least about 1 meter of free space)
- Never on top of furniture, plants, or the building itself

This is a FREESTANDING product. It sits ON the ground surface, it is NOT built into the ground. Its base is in firm, stable contact with the surface, perfectly level, with a soft contact shadow underneath.

---

SCALE — VERY IMPORTANT
The product is SMALL. Its real size is stated in the product description above. Convert that size into the photo using real-world references: an adult is about 170 cm tall, a door about 200 cm, a garden chair about 80-90 cm high, an adult's knee is about 50 cm high.
Example: a product that is 60 cm high only reaches an adult's knee or thigh. It must look clearly much shorter than any door, window, fence or hedge in the photo. A product that is 140 cm wide is about as wide as a small round garden table.
Being closer to the camera must NOT make the product look bigger than its real size. Judge its size against objects at the SAME distance from the camera (grass, path width, steps, shrubs, chairs), not against the distant house.
Before finalizing, check the product's size against nearby objects (house door, windows, steps, hedges). If it looks bigger than its stated size, make it smaller. When unsure, make it slightly smaller rather than larger.
This is a garden decoration, NOT a swimming pool. It must stay small relative to the house and the garden. Do not enlarge it.

---

PRESERVE THE SCENE
Keep EVERYTHING in the original photo exactly as it is: buildings, trees, plants, fences, walls, paths, furniture, sky. Do not remove, move or change anything. Only add the product (and its natural shadow and reflections).

---

PHOTOREALISTIC QUALITY
- Match the exact camera angle, perspective and lens look of the original photo
- Match the lighting direction, shadow softness and time of day, so the product's shadow falls the same way as other shadows in the scene
- Natural color grading, same sharpness and grain as the original photo
- Looks like a real professional photograph, premium and clean

---

ABSOLUTE PROHIBITIONS:
❌ Turning it into a swimming pool or adding any large pool
❌ Product floating, tilted, sunk into the ground, or looking larger than its stated real size
❌ Wrong product design — must match Image 2 exactly
❌ Changing existing buildings, trees or landscaping
❌ Adding pebbles, white stones, gravel, mulch, plants or any decoration around the base — the base sits directly on the existing ground surface (grass stays grass)
❌ Adding extra decorations, lights, furniture, people or text
❌ A dry or static-looking product — water must be visibly flowing
❌ Cartoon, render, 3D or illustration style — PHOTO ONLY
  `.trim();
}