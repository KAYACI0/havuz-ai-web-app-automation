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

  const poolModel    = clientConfig.pool_models.find((m) => m.id === model);
  const modelName    = poolModel?.name || model;
  const deckColor    = deck    ? clientConfig.deck_colors.find((d)    => d.id === deck)    : null;
  const ceramicColor = ceramic ? clientConfig.ceramic_colors.find((c) => c.id === ceramic) : null;

  const isRoma = model.toUpperCase() === "ROMA";
  const hasSurround = Boolean(ceramicColor || deckColor);

  const COLOR_EN: Record<string, string> = {
    mavi: "blue", beyaz: "white", gri: "gray", "açık gri": "light gray",
    "koyu gri": "dark gray", antrasit: "anthracite gray", bej: "beige",
    krem: "cream", kahverengi: "brown", "açık kahve": "light brown",
    siyah: "black", yeşil: "green", turkuaz: "turquoise", kum: "sand",
    kırmızı: "brick red", bordo: "burgundy",
  };
  const toEnColor = (name: string) => COLOR_EN[name.trim().toLowerCase()] ?? name;
  const ceramicColorEn = ceramicColor ? toEnColor(ceramicColor.name) : "";
  const deckColorEn    = deckColor    ? toEnColor(deckColor.name)    : "";

  const hasRef2 = Boolean(poolModel?.reference_image_url_2);
  const poolRefLabel = hasRef2
    ? "Image 2 shows the pool model from two angles side by side"
    : "Image 2 shows the pool model";

  const hasMaterialRef = Boolean(
    (ceramicColor as { reference_image_url?: string } | null)?.reference_image_url ||
    (deckColor as { reference_image_url?: string } | null)?.reference_image_url
  );
  const waterfallImageNo = hasMaterialRef ? 4 : 3;
  const materialLabel = hasMaterialRef
    ? ceramicColor
      ? `Image 3 shows the EXACT ${ceramicColorEn} paving material — match its color, texture, and slab look precisely.`
      : `Image 3 shows the EXACT ${deckColorEn} deck material — match its color, texture, and board look precisely.`
    : "";

  const shapeLine = isRoma
    ? `Pool shape — the ROMA model: copy the reference pool's outline EXACTLY. Both ends of the pool have SOFTLY ROUNDED corners — NEITHER end is a sharp 90-degree corner or a flat straight end, and NEITHER end is a full semicircle either. One long side flows with a gentle wave, curving slightly inward then back out; the opposite long side is straighter. The whole outline is smooth and organic, matching the reference silhouette point for point. Copy its molded interior too: wide steps spanning one end, and a bench ledge running along one side, molded from the same material and color as the shell, clearly visible underwater with soft light and shadow on each edge.`
    : `Pool shape — the RELAX model: copy the reference pool's outline EXACTLY — a clean rectangle, straight sides, square 90-degree corners, no curves anywhere. Copy its molded interior too: built-in steps in the SAME corner/position as shown in the reference, molded from the same material and color as the shell, clearly visible underwater with soft light and shadow on each step edge.`;

  const guideLines = hasSurround
    ? `Image 1 has magenta construction marks placed at the best open spot of the lawn: a SOLID magenta rectangle covering the pool's exact footprint, a THIN outer rectangle marking the outer edge of the paving, and a dashed line showing the pool's long axis.
Build the water exactly over the solid rectangle; align the pool's long axis with the dashed line. Paving fills ONLY the ring between the two rectangles — its outer edge is straight and rectangular, and the lawn begins immediately at the thin line. Absolutely nothing is built or paved beyond that thin line.
PAINT OVER ALL MAGENTA COMPLETELY — zero magenta pixels may remain in the final image.`
    : `Image 1 has magenta construction marks placed at the best open spot of the lawn: a SOLID magenta rectangle covering the pool's exact footprint, and a dashed line showing the pool's long axis.
Build the pool exactly over the solid rectangle, its long axis aligned with the dashed line. The lawn continues immediately at the rectangle's edge — nothing else is built.
PAINT OVER ALL MAGENTA COMPLETELY — zero magenta pixels may remain in the final image.`;

  const scaleLines = `SIZE — READ CAREFULLY, THIS IS THE MOST COMMONLY BROKEN RULE:
- The pool (with its paving) occupies roughly 10-12% of the total photo frame area — not more.
- The pool's long side looks clearly SMALLER than the visible width of the house — never equal, never larger.
- Do not place the pool in the extreme foreground: leave visible open lawn between the near edge of the photo and the near edge of the pool.
- If in doubt, make the pool and its paving smaller and set them further back. Small and correctly placed beats big and dominant.`;

  const surroundLines = ceramicColor
    ? `Paving: LARGE matte ${ceramicColorEn} porcelain slabs — long rectangles, each slab clearly TWICE as long as it is wide (about 33cm x 66cm), laid long-side parallel to the pool in a RUNNING-BOND brick pattern with staggered joints — a pattern impossible with square tiles. NOT mosaic, NOT small square tiles, NOT bathroom tiles. Two slab rows per side, about 1.2m total width — this is a narrow walkway, not a wide patio, and must never look wider than that.
One color everywhere: the slab row touching the water is IDENTICAL to the others — never lighter, darker, or a white border row. Water meets slab directly. The pool interior itself is smooth fiberglass — no tile strip or mosaic band at the waterline inside the pool.
The paving is SUNK INTO the lawn like a real in-ground patio: its surface sits at exactly the same level as the grass, with no visible slab thickness, no raised platform edge, no step, and no shadow gap where paving meets lawn. Clean surface — no covers, lids, or fixtures.`
    : deckColor
    ? `Deck: ${deckColorEn} composite wood boards, about 20cm wide, laid parallel to the pool, about 1.2m total width per side — a narrow walkway, never wider.
The deck is SUNK INTO the lawn like a real in-ground terrace: its surface sits at exactly the same level as the grass, with no visible board thickness, no raised platform edge, no step, and no shadow gap where the deck meets the lawn. Boards reach the water directly and act as the coping — no white strip, and the board row at the water is identical to the others. Clean surface — no covers or fixtures.`
    : `No paving, no deck: the existing ground runs directly to the water's edge.
The pool still has a normal, thin, in-ground coping (5-10cm) — a real physical necessity — in a matte natural stone-gray or light beige tone, NEVER bright white, NEVER plastic-looking, NEVER a thick raised lip. It sits flush with the ground: grass touches its outer edge directly, no gap, no visible pool wall above ground. Do not add any decorative walkway, deck, or tile border — only this narrow, natural-toned structural coping.`;

  const equipLines = [
    config.hasStairs
      ? `Exactly ONE stainless steel 3-step entry ladder, mounted at the end of the pool AWAY from the molded steps — never the same end, never two ladders.`
      : "",
    config.hasWaterfall
      ? `Exactly ONE small stainless steel cobra waterfall (about 35cm wide) mounted on one long side, water pouring in a smooth sheet into the pool. Never two waterfalls. Image ${waterfallImageNo} shows the waterfall style.`
      : "",
  ].filter(Boolean).join("\n");

  return `
Edit Image 1 (the customer's garden photo): add ONE luxury fiberglass swimming pool, professionally installed, so the result looks like a real photograph. ${poolRefLabel} — the ${modelName}.${materialLabel ? ` ${materialLabel}` : ""}

IN-GROUND — MOST IMPORTANT RULE: the pool is dug INTO the earth. The water surface sits level with the surrounding lawn; the ground runs naturally up to the water's edge; the pool casts and receives the same shadows as everything else in the scene, as if it had always been there. No pool shell, wall, or lip is ever visible above the ground. A pool sitting on top of the grass like a container is the single worst possible failure.

${shapeLine}
Size ${size} meters — keep those proportions.

${scaleLines}

PLACEMENT:
${guideLines}
Grass is visible on all four sides of the pool and its paving at all times — between them and every edge of the photo there is always open lawn; the pool and paving never touch or run past the left, right, top, or bottom edge of the image.

${surroundLines}

No skimmer boxes, equipment lids, light covers, or any small white/gray square fixtures anywhere on the paving, coping, or pool edge — the surface stays clean and unbroken.

${equipLines ? `${equipLines}\n` : ""}
Keep everything else in the photo unchanged: buildings, trees, fences, framing, aspect ratio, camera angle, lighting. Photorealistic only — never a render, illustration, or 3D look.
  `.trim();
}