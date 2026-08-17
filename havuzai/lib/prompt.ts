import type { ClientConfig } from "./config-types";

export interface PoolConfig {
  model:        string;
  size:         string;
  deck:         string;
  ceramic:      string;
  hasWaterfall: boolean;
  hasStairs:    boolean;
  stairType:    "corner" | "wide";
}

export function buildPoolPrompt(config: PoolConfig, clientConfig: ClientConfig): string {
  const { model, size, ceramic, deck } = config;

  // Firma config'inden model bilgisini bul
  const poolModel     = clientConfig.pool_models.find((m) => m.id === model);
  const modelName     = poolModel?.name || model;
  const shapeDesc     = poolModel?.prompt_description || poolModel?.description || `${model} shaped fiberglass pool`;
  const isRoma         = model.toUpperCase() === "ROMA" || modelName.toUpperCase() === "ROMA";

  // Deck ve seramik renk bilgilerini bul
  const deckColor     = deck    ? clientConfig.deck_colors.find((d)    => d.id === deck)    : null;
  const ceramicColor  = ceramic ? clientConfig.ceramic_colors.find((c) => c.id === ceramic) : null;

  // NOT: Daha önce burada model=ROMA ise otomatik "OVAL/TEARDROP, asimetrik"
  // diyen sabit bir kural vardı — bu, Roma'nın gerçek şeklini (shapeDesc,
  // simetrik rounded-rectangle/pill shape) DOĞRUDAN çelişerek yanlış/farklı
  // bir model çıkmasına sebep oluyordu. Kaldırıldı — artık şekil tamamen
  // shapeDesc'e (süper-admin panelindeki AI şekil açıklamasına) bırakılıyor,
  // hangi model olursa olsun.

  // ─────────────────────────────────────────────────────────────
  // GÖRSEL SIRASI HESAPLAMA
  // Bu blok, fal.ts'teki imageUrls dizisine EKLENME SIRASIYLA birebir
  // aynı olmalı: [müşteri fotoğrafı, havuz ref 1, havuz ref 2?, şelale?, merdiven?]
  // fal.ts'e yeni bir referans eklersen buraya da aynı sırayla ekle.
  // ─────────────────────────────────────────────────────────────
  const hasSecondRef = !!poolModel?.reference_image_url_2;
  const stairRef      = clientConfig.features?.stair_reference_url;
  const hasStairRef   = config.hasStairs && !!stairRef;

  let idx = 2; // Image 1 = müşteri fotoğrafı, Image 2 = havuz ana referansı
  const guideLines: string[] = [
    "- Image 1: Customer garden/property photo — THIS IS THE IMAGE TO EDIT",
    `- Image 2: ${modelName} pool model (primary reference) — USE THIS EXACT POOL SHAPE`,
  ];

  if (hasSecondRef) {
    idx++;
    guideLines.push(`- Image ${idx}: ${modelName} pool model (secondary reference — additional angle/detail) — USE THIS ALONGSIDE IMAGE 2 FOR THE SAME POOL SHAPE`);
  }
  if (config.hasWaterfall) {
    idx++;
    guideLines.push(`- Image ${idx}: Waterfall style reference — ADD THIS WATERFALL TO POOL EDGE`);
  }
  if (hasStairRef) {
    idx++;
    guideLines.push(`- Image ${idx}: Pool ladder style reference — USE THIS LADDER STYLE`);
  }

  const referenceGuide = guideLines.join("\n");

  return `
You are a professional architectural visualization AI. Your task is to place a luxury fiberglass swimming pool into the provided outdoor photo. The result must look exactly like a real photograph taken after the pool was professionally built and installed.

===================================================
🚫 CRITICAL — READ THIS FIRST — MOST COMMON MISTAKES
===================================================
1. POOL TOO LARGE / TOO CLOSE TO CAMERA
   - The pool itself should occupy approximately 8-10% of the total photo frame area and MUST NOT exceed 12%.
   - The pool's long side must NOT be wider than the visible width of the house/building.
   - Do NOT place the pool in the extreme foreground. Leave visible open lawn between the near edge of the frame and the near edge of the pool.
   - Do NOT make the pool larger just because the selected deck or ceramic surround is present. The pool body remains compact.

2. CROOKED / MISALIGNED PLACEMENT
   - The pool's edges MUST align with the perspective lines already present in the photo (fence lines, house walls, patio edges, path lines).
   - The pool's long sides must run parallel to the dominant straight lines of the scene.
   - Do NOT rotate the pool at a random diagonal angle relative to the camera or the house.

3. WRONG POOL SHAPE
   - The pool shape must match Image 2 EXACTLY — its silhouette, proportions, and symmetry.
   - Do not substitute a different shape, a different silhouette, or a different model's style.

If unsure — make the pool smaller, move it further back, align it with the scene's existing lines, and match Image 2's shape precisely.
===================================================

DECISION PRIORITY — FOLLOW IN THIS ORDER:
1. Preserve the original garden photograph and camera perspective.
2. Copy the exact selected pool silhouette from Image 2.
3. Scale the pool down until it feels realistically proportioned to the garden.
4. Excavate only the narrow surround footprint from the existing lawn.
5. Install the selected ceramic/deck flush into that excavated footprint.
6. Rebuild realistic grass/soil contact around the outside edge.
7. Add water, ladder and waterfall only after the pool and ground installation are correct.
If a result looks like a pasted overlay, a floating slab, or the wrong pool model, that result is INVALID and must be regenerated.

REFERENCE IMAGES GUIDE:
${referenceGuide}

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
${isRoma ? `ROMA MODEL — VISUAL REFERENCE HAS ABSOLUTE PRIORITY:
- Ignore any generic interpretation of the word ROMA. The actual shape must be copied from Image 2.
- Treat Image 2 as a geometric template: reproduce its outer contour, corner radius, length/width ratio, step layout, waterline shape, and internal basin proportions.
- The finished pool must visibly have FOUR SOFTLY ROUNDED CORNERS and TWO LONG, STRAIGHT, PARALLEL SIDES. It must read immediately as the same ROMA pool shown in Image 2.
- NEVER convert ROMA into a standard rectangle. NEVER use sharp 90-degree corners. NEVER use an oval, ellipse, kidney, bean, teardrop, freeform, or asymmetrical silhouette.
- Do not redesign the model to fit the garden. Scale the SAME ROMA silhouette down uniformly until it fits naturally.
- The ceramic/deck outline MUST be generated from the ROMA pool perimeter; it must not create a separate rectangular or diamond-shaped footprint.
- If Image 2 and any text description disagree, Image 2 wins.` : `${shapeDesc}`}
Size: ${size} meters — preserve the selected model's proportions.
FINAL SIZE CONTROL: make the actual pool body modest in the garden, approximately 8-10% of the visible frame area. If there is any conflict between fitting the selected size and making the scene believable, scale the entire pool uniformly smaller rather than making it wider or moving it toward the camera.
The surround material must never be used to make the pool appear larger.
Size: ${size} meters — maintain exact proportions from the selected reference.
The pool body must be SMALL relative to the garden — approximately 8-10% of the total photo frame area and never more than 12%.
The pool must be clearly SMALLER than the house/building.
The pool must sit at a middle-distance in the garden, NOT in the extreme foreground.
There must be visible grass on ALL sides around the pool — at least 2-3 meters of grass between pool edge and garden boundaries wherever the original garden allows.
DO NOT fill the garden with the pool.
The selected surround material must NEVER enlarge or change the pool silhouette.

---

RULE 2b — OPTIMAL PLACEMENT & ALIGNMENT (MANDATORY)
Choose the placement a professional real-estate photographer would choose:
- Place the pool in the clearest, most unobstructed open lawn area with a good sightline to the house
- Do NOT overlap, block, or crowd existing objects — swing sets, furniture, hot tubs, trees, paths
- CRITICAL: Align the pool's edges with the perspective lines already in the photo (fence lines, house walls, patio edges) — do NOT rotate it to a random diagonal angle
- Prefer the spot closest to the house's main outdoor-facing side (patio, terrace, garden doors)

---

RULE 3 — POOL WATER
Clear, bright blue fiberglass pool interior.
Water is realistic — natural depth, light shimmer, and color variation.
The pool interior goes visibly deep into the ground.

---

${ceramicColor ? `
RULE 4 — CERAMIC TILE SURROUND (MANDATORY — IN-GROUND, NOT FLOATING)
The ceramic is a THIN IN-GROUND WALKING STRIP immediately around the pool. It is NOT a platform, slab, patio, terrace, or floating surface.
- Target width: approximately 45-60 cm from the outer pool coping to the outer ceramic edge. NEVER expand it into a large apron.
- The ceramic must follow the exact silhouette of the selected pool, including every rounded ROMA corner when ROMA is selected.
- CONSTRUCTION SEQUENCE MUST BE VISIBLE: remove the grass from ONLY the 45-60 cm ring, expose the soil underneath, prepare that strip, then set the ceramic into the prepared ground. The final image must show a believable transition from soil/grass into the installed tile.
- The ceramic is physically embedded in the landscape. It is NOT composited over the photograph and NOT laid over the existing grass texture.
- The outer ceramic edge must terminate irregularly/naturally against the existing lawn perspective, with tiny realistic soil/grass contact at the boundary. The tile surface and grass must share the SAME ground plane and SAME horizon/perspective. There must be no floating blue sheet, no hard pasted outline, no raised slab, and no visible image-compositing seam.
- Use physically correct contact shadows, soft occlusion, slight edge darkening from the excavation, and realistic reflected light at the grass/tile boundary. The purpose is to make the ceramic look physically installed, not digitally painted.
- The ground plane should visually continue beneath the tile installation, with realistic excavation depth and a natural flush transition to the lawn.
- Keep the surrounding lawn intact everywhere outside this narrow ceramic ring. Do NOT cover distant grass.
- The ceramic footprint must be mathematically derived from the pool outline: offset the pool boundary outward by only 45-60 cm. Do NOT create a second large rectangle, diamond, square, or camera-facing slab.
- The perspective of the tile joints must follow the ground plane and the original camera perspective.
- Tile color: ${ceramicColor.name} colored ceramic tiles, rectangular (not square), with realistic grout lines and slight natural surface variation.
- Tiles are thin and installed flush at ground level — NOT raised.
- No grass may appear UNDER the ceramic tiles. No ceramic may appear floating ABOVE the grass.
- The final result must look like real landscaping/construction: a contractor excavated a narrow ring around the pool and installed the tiles into the soil.
DO NOT let the tiled area cover a large portion of the lawn. DO NOT let it look like a patio, terrace, platform, overlay, sticker, or Photoshop cutout. It is a narrow in-ground trim around the pool only.
` : deckColor ? `
RULE 4 — DECK SURROUND (MANDATORY — IN-GROUND, NOT FLOATING)
Add a composite wood deck as a THIN IN-GROUND walking strip immediately around the pool — NOT a patio, terrace, platform, or floating slab.
- Target width: approximately 45-60 cm from the outer pool coping to the outer deck edge.
- The deck must follow the exact pool silhouette, including every rounded ROMA corner when ROMA is selected.
- CONSTRUCTION SEQUENCE MUST BE VISIBLE: remove the grass from ONLY the 45-60 cm ring, expose/prepare the soil, then install the deck into that prepared strip. The deck must replace the grass in this ring; it must never be layered on top of the lawn.
- The outer deck edge must terminate naturally into the existing lawn at the SAME elevation and ground plane. Use realistic soil/grass contact, subtle edge shadow, and no raised border, floating boards, hard pasted outline, or visible compositing seam.
- Add subtle contact shadows and realistic grounding where the deck meets the soil/grass.
- Deck footprint must be derived ONLY from the pool perimeter and offset outward by 45-60 cm. Boards must follow that perimeter and the scene perspective; never form a giant rectangle, diamond, square, or camera-facing platform.
- Keep all lawn outside the narrow ring unchanged.
- Deck color: ${deckColor.name} colored composite wood deck, realistic tight board gaps and natural construction detail.
- Deck sits flush at ground level — NOT raised.
DO NOT let the deck cover a large portion of the lawn. DO NOT let it look like a patio, terrace, platform, overlay, sticker, or Photoshop cutout. It is a narrow in-ground trim around the pool only.
` : `
RULE 4 — POOL SURROUND (NO DECK OR CERAMIC SELECTED)
No deck or ceramic walkway was selected — do NOT add any tiles, wood boards, stone pavers, or walkway material.
The existing ground (grass, soil) comes right up to the pool's coping edge — no wide border.

The pool DOES have a normal, thin, in-ground pool coping (5-10cm wide):
- Coping material: matte natural stone-grey or light beige concrete — NEVER bright white, NEVER plastic-looking
- The coping sits FLUSH with the surrounding ground — grass touches the outer edge directly
- Keep the coping subtle and realistic — a normal residential in-ground pool edge
DO NOT add a decorative walkway, deck, or tile border — only the narrow, natural-toned coping.
`}

---

${hasStairRef ? `
RULE 5 — POOL LADDER (MANDATORY)
A stainless steel pool ladder MUST be visible in the final image, matching the style shown in the ladder reference image.
- Type: 3-step stainless steel pool entry ladder
- Material: polished chrome stainless steel, shiny and realistic
- Position: mounted on one SHORT END of the pool edge, steps going DOWN INTO the water
OMITTING THE LADDER = INVALID OUTPUT.
` : config.hasStairs ? `
RULE 5 — POOL LADDER (MANDATORY)
A stainless steel pool ladder MUST be visible in the final image.
- Type: 3-step stainless steel pool entry ladder
- Material: polished chrome stainless steel, shiny and realistic
- Position: mounted on one SHORT END of the pool edge, steps going DOWN INTO the water
OMITTING THE LADDER = INVALID OUTPUT.
` : ""}

${config.hasWaterfall ? `
RULE 6 — WATERFALL BLADE (MANDATORY)
A stainless steel cobra waterfall blade MUST be visible in the final image.
- Size: small and elegant — approximately 35cm wide, 40cm tall
- Material: polished brushed stainless steel, chrome finish
- Position: mounted DIRECTLY ON THE POOL COPING EDGE on one LONG side
- Water flows in a smooth sheet from the blade DOWN INTO the pool
OMITTING THE WATERFALL = INVALID OUTPUT.
` : ""}

---

RULE 7 — PHOTOREALISTIC QUALITY
- Output must look like a real professional photograph
- Match the exact camera angle and perspective of the original photo
- Match the lighting, shadows, and time of day of the original photo
- The pool must look completely natural — like it was always there
- Luxury villa quality — professional, clean, premium finish

---

ABSOLUTE PROHIBITIONS:
❌ Pool larger than 12% of the frame, wider than the house, or placed too close to the camera
❌ Pool above ground level in any way
❌ Surround material pasted over the original grass without believable excavation and ground contact
❌ Crooked/diagonal placement not aligned with the scene
❌ Wrong pool shape, silhouette, or symmetry — must match Image 2 exactly
${isRoma ? "❌ ROMA rendered as an oval, kidney, teardrop, sharp rectangle, or any non-ROMA silhouette" : ""}
❌ Changing existing buildings, trees, or landscaping
❌ Cartoon, render, 3D, or illustration style — PHOTO ONLY
${ceramicColor ? "❌ Ceramic floating above grass, sitting on top of grass, showing a hard rectangular/diamond slab, having a raised edge, or looking pasted/Photoshopped" : ""}
${deckColor ? "❌ Deck floating above grass, sitting on top of grass, showing a hard rectangular/diamond platform, having a raised edge, or looking pasted/Photoshopped" : ""}
${config.hasStairs ? "❌ Missing pool ladder — MANDATORY when selected" : ""}
${config.hasWaterfall ? "❌ Missing waterfall — MANDATORY when selected" : ""}
  `.trim();
}