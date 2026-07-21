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

export function buildPoolPrompt(
  config: PoolConfig,
  clientConfig: ClientConfig
): string {
  const { model, size, ceramic, deck } = config;

  const poolModel = clientConfig.pool_models.find((m) => m.id === model);
  const modelName = poolModel?.name || model;

  const shapeDesc =
    poolModel?.prompt_description ||
    poolModel?.description ||
    `${model} shaped fiberglass pool`;

  const deckColor = deck
    ? clientConfig.deck_colors.find((d) => d.id === deck)
    : null;

  const ceramicColor = ceramic
    ? clientConfig.ceramic_colors.find((c) => c.id === ceramic)
    : null;

  // Turkuaz referans görseli gibi, reference_image_url içeren ilk seramik
  // yalnızca karo formu ve döşeme düzeni için kullanılır.
  const ceramicLayoutRef = clientConfig.ceramic_colors.find(
    (color) => color.reference_image_url
  )?.reference_image_url;

  const hasCeramicReference = Boolean(ceramicColor && ceramicLayoutRef);

  let imageNumber = 3;

  const referenceGuide = [
    "Image 1: Customer garden photo. This is the image to edit.",
    `Image 2: ${modelName} pool reference. Use this as the exact primary pool shape reference.`,
  ];

  if (poolModel?.reference_image_url_2) {
    referenceGuide.push(
      `Image ${imageNumber}: Second ${modelName} pool reference. Use this to confirm the exact shape, curves, steps, proportions and shell details.`
    );
    imageNumber++;
  }

  if (hasCeramicReference) {
    referenceGuide.push(
      `Image ${imageNumber}: Ceramic tile installation reference. Use ONLY its 33x66 rectangular tile form, laying pattern and grout lines. Never copy its turquoise color.`
    );
    imageNumber++;
  }

  if (config.hasWaterfall) {
    referenceGuide.push(
      `Image ${imageNumber}: Waterfall reference. Use this waterfall style on the pool edge.`
    );
    imageNumber++;
  }

  if (config.hasStairs && clientConfig.features?.stair_reference_url) {
    referenceGuide.push(
      `Image ${imageNumber}: Pool ladder reference. Use this stainless-steel ladder style.`
    );
  }

  const surroundRule = ceramicColor
    ? `
RULE 5 — CERAMIC TILE SURROUND (MANDATORY)

Install ceramic tiles around all four sides of the pool.

- Tile color MUST be ${ceramicColor.name}.
- Use exactly 2 rows of tiles around every side.
- Every tile MUST be a 33cm x 66cm rectangle with an exact 2:1 ratio.
- Never use square tiles or 60x60 tiles.
- The 66cm long side runs parallel to the nearest pool edge.
- Total tile surround width is 66cm.
- Use thin, realistic 2–3mm grout lines.
- Ceramic tiles sit flush with ground level, never raised.
- The ceramic replaces grass directly around the pool.
${
  hasCeramicReference
    ? `- The ceramic reference image is ONLY for tile shape, installation pattern and grout.
- Ignore its turquoise color completely. Apply ${ceramicColor.name} color instead.`
    : ""
}
- Clean, premium, photorealistic ceramic finish.
`
    : deckColor
      ? `
RULE 5 — COMPOSITE DECK SURROUND (MANDATORY)

Install a composite wood deck around all four sides of the pool.

- Deck color MUST be ${deckColor.name}.
- Use exactly 3 deck boards on every side.
- Every board is 20cm wide; total deck width is 60cm.
- Boards run parallel to the nearest pool edge.
- Deck sits flush with the ground and is never elevated.
- Use tight, realistic board gaps.
- The deck replaces grass directly around the pool.
- Clean, modern, premium finish.
`
      : `
RULE 5 — NO SURROUND MATERIAL

- Existing grass or ground meets the pool edge directly.
- Do not add ceramic, pavers, stone, deck, walkway or border.
- Only a thin realistic pool rim may be visible.
`;

  return `
You are a professional architectural visualization AI.

Your task is to place a luxury fiberglass swimming pool into the provided customer garden photo. The final image must look like a real professional photograph taken after the pool was permanently installed.

REFERENCE IMAGES:
${referenceGuide.map((line) => `- ${line}`).join("\n")}

---

MOST IMPORTANT RULE — IN-GROUND POOL

This is a professional IN-GROUND swimming pool.

You MUST show:
- Water surface at the same level as the surrounding ground.
- Pool shell built down into the earth.
- Only a thin coping or rim at ground level.
- Natural contact between the pool surround and the grass, deck or ceramic.
- A permanent built-in pool that looks like it has always existed there.

You must NEVER show:
- An above-ground pool.
- Raised exterior pool walls.
- A container, box, platform or elevated pool.
- Gaps between the pool and the surrounding ground.

---

RULE 1 — PRESERVE THE ORIGINAL GARDEN

Keep the original photo unchanged except for the new pool installation.

- Do not change the house, roof, windows, patio, doors, trees, fences, paths, walls, furniture or landscaping.
- Do not remove existing objects.
- Do not block the house, patio, garden doors or the best property view.
- Only add the pool and its selected surround to a suitable open ground area.

---

RULE 2 — EXACT POOL MODEL: ${modelName.toUpperCase()}

${shapeDesc}

- The final pool MUST match the selected ${modelName} reference image or images.
- Do not invent another pool shape.
- Preserve the exact silhouette, curves, corners, internal shell details and integrated steps from the model reference.
- Pool size: ${size} meters.
- Keep realistic perspective and scale.
- The pool must be visibly smaller than the house.
- The pool should occupy roughly 20–25% of the visible open garden area.
- Keep at least 2–3 meters of visible space from fences, trees, paths, buildings and garden boundaries.

---

RULE 3 — BEST POSSIBLE GARDEN PLACEMENT

Choose the most attractive, realistic and practical pool location automatically.

- Find the clearest and largest unobstructed lawn area.
- Preserve a beautiful sightline between the pool and the house.
- Never overlap swings, furniture, trees, hedges, paths, walls, fences or existing pool equipment.
- Prefer the area nearest to the main patio, terrace or garden-facing house side.
- Position and rotate the pool according to the original camera and ground perspective.
- Compose the pool and house together like a premium real-estate photograph.
- Avoid placing the pool too close to the camera unless this is the only suitable open area.
- Match original lighting, shadows, perspective and time of day.

---

RULE 4 — REALISTIC WATER

- Clear, premium bright-blue fiberglass pool water.
- Natural depth, water reflections, light shimmer and subtle color variation.
- The pool interior visibly descends below ground.
- Photorealistic output only.

---

${surroundRule}

${
  config.hasStairs
    ? `
RULE 6 — STAINLESS STEEL LADDER (MANDATORY)

- Include one polished stainless-steel 3-step pool ladder.
- Put it on a short end of the pool.
- Steps descend naturally into the pool water.
`
    : ""
}

${
  config.hasWaterfall
    ? `
RULE 7 — WATERFALL BLADE (MANDATORY)

- Include one small, elegant stainless-steel cobra waterfall blade.
- Approximately 35cm wide and 40cm high.
- Mount it directly on the pool coping edge on a long side.
- Water must flow in a smooth sheet into the pool.
`
    : ""
}

---

ABSOLUTE PROHIBITIONS

- No above-ground pool.
- No visible pool exterior walls.
- No wrong Roma or Relax shape.
- No square tiles when ceramic is selected.
- No turquoise tiles unless the selected ceramic color is Turkuaz.
- No blocked house view.
- No altered buildings, trees, fences, paths or landscaping.
- No cartoon, illustration, CGI or 3D render style.
- The output must look like a real photograph.
`.trim();
}