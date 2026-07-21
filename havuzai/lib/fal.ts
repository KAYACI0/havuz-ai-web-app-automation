import { fal } from "@fal-ai/client";
import sharp from "sharp";
import { buildPoolPrompt, PoolConfig } from "./prompt";
import type { ClientConfig } from "./config-types";

fal.config({ credentials: process.env.FAL_KEY! });

// Ucuz/klasik model — bütçe kısıtı nedeniyle burada kalınıyor.
const FAL_MODEL = "fal-ai/nano-banana/edit";

// Şelale referansı henüz config'te tutulmuyor; global env fallback kullanılır.
const WATERFALL_REF = process.env.NEXT_PUBLIC_SELALE_REFERENCE_URL!;

async function fetchImageBuffer(url: string): Promise<Buffer> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Görsel indirilemedi: ${response.status} — ${url}`);
  return Buffer.from(await response.arrayBuffer());
}

function closestAspectRatio(width: number, height: number): string {
  const ratio = width / height;
  const supported: [string, number][] = [
    ["21:9", 21 / 9], ["16:9", 16 / 9], ["4:3", 4 / 3], ["3:2", 3 / 2],
    ["1:1", 1], ["2:3", 2 / 3], ["3:4", 3 / 4], ["9:16", 9 / 16],
  ];
  supported.sort((a, b) => Math.abs(a[1] - ratio) - Math.abs(b[1] - ratio));
  return supported[0][0];
}

function parsePoolAspect(size: string): number | null {
  const match = size.match(/(\d+(?:[.,]\d+)?)\s*[x×]\s*(\d+(?:[.,]\d+)?)/i);
  if (!match) return null;
  const a = parseFloat(match[1].replace(",", "."));
  const b = parseFloat(match[2].replace(",", "."));
  if (!a || !b) return null;
  const ratio = Math.max(a, b) / Math.min(a, b);
  return Math.min(Math.max(ratio, 1.15), 3.5);
}

// Bahçe fotoğrafının üstüne, havuzun gerçek konum/ölçeğini işaretleyen
// GERÇEK bir magenta kılavuz çizer (eskiden burada bu adım hiç yoktu —
// prompt "magenta dikdörtgen var" diyordu ama görselde hiç çizilmiyordu,
// bu da modelin pembe bir alan uydurmasına yol açıyordu).
async function createPlacementGuide(
  sourceBuffer: Buffer,
  width: number,
  height: number,
  withWalkwayBoundary: boolean,
  poolSize: string
): Promise<string> {
  const poolAspect = parsePoolAspect(poolSize);
  const isLandscape = width >= height;

  let guideWidth: number;
  let guideHeight: number;

  if (isLandscape) {
    guideWidth = Math.round(width * 0.46);
    guideHeight = poolAspect
      ? Math.round(guideWidth / poolAspect)
      : Math.round(height * 0.15);
  } else {
    guideHeight = Math.round(height * 0.4);
    guideWidth = poolAspect
      ? Math.round(guideHeight / poolAspect)
      : Math.round(width * 0.2);
  }

  const x = Math.round((width - guideWidth) / 2);
  const y = Math.round(height * 0.56 - guideHeight / 2);
  const strokeWidth = Math.max(8, Math.round(Math.min(width, height) * 0.012));
  const dashStroke = Math.max(4, Math.round(strokeWidth / 2));

  const offset = Math.round(0.25 * Math.min(guideWidth, guideHeight));
  const outerRect = withWalkwayBoundary
    ? `<rect x="${x - offset}" y="${y - offset}" width="${guideWidth + offset * 2}" height="${guideHeight + offset * 2}" fill="none" stroke="#ff00ff" stroke-width="${Math.max(3, Math.round(strokeWidth / 2))}" />`
    : "";

  const midX = Math.round(x + guideWidth / 2);
  const midY = Math.round(y + guideHeight / 2);
  const axisLine = isLandscape
    ? `<line x1="${x}" y1="${midY}" x2="${x + guideWidth}" y2="${midY}" stroke="#ff00ff" stroke-width="${dashStroke}" stroke-dasharray="${strokeWidth * 2} ${strokeWidth}" />`
    : `<line x1="${midX}" y1="${y}" x2="${midX}" y2="${y + guideHeight}" stroke="#ff00ff" stroke-width="${dashStroke}" stroke-dasharray="${strokeWidth * 2} ${strokeWidth}" />`;

  const guideSvg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      ${outerRect}
      <rect x="${x}" y="${y}" width="${guideWidth}" height="${guideHeight}" fill="#ff00ff" stroke="#ff00ff" stroke-width="${strokeWidth}" />
      ${axisLine}
    </svg>
  `;

  const guidedBuffer = await sharp(sourceBuffer)
    .rotate()
    .composite([{ input: Buffer.from(guideSvg) }])
    .png()
    .toBuffer();

  return `data:image/png;base64,${guidedBuffer.toString("base64")}`;
}

// Havuzun 2. referans fotoğrafı (basamak yakın çekimi) varsa AYRI göndermek
// yerine tek board'da birleştiriyoruz — ayrı göndermek daha önce şekil
// sinyalini zayıflattığı için denenip elenmişti.
async function createPoolReferenceBoard(primaryUrl: string, secondaryUrl?: string): Promise<string> {
  if (!secondaryUrl) return primaryUrl;

  const [a, b] = await Promise.all([fetchImageBuffer(primaryUrl), fetchImageBuffer(secondaryUrl)]);

  const panel = 1024;
  const [pa, pb] = await Promise.all([
    sharp(a).rotate().resize(panel, panel, { fit: "contain", background: "#ffffff" }).png().toBuffer(),
    sharp(b).rotate().resize(panel, panel, { fit: "contain", background: "#ffffff" }).png().toBuffer(),
  ]);

  const board = await sharp({ create: { width: panel * 2, height: panel, channels: 4, background: "#ffffff" } })
    .composite([{ input: pa, left: 0, top: 0 }, { input: pb, left: panel, top: 0 }])
    .png()
    .toBuffer();

  return `data:image/png;base64,${board.toString("base64")}`;
}

// Üretim sonrası çıktıda pembe/magenta piksel taraması — varsa 1 kez
// otomatik yeniden üretim (kılavuz düzgün silinmemişse sigorta).
async function detectMagentaResidue(imageUrl: string): Promise<boolean> {
  const buffer = await fetchImageBuffer(imageUrl);
  const { data, info } = await sharp(buffer)
    .resize(300, undefined, { withoutEnlargement: true })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const channels = info.channels;
  let magentaPixels = 0;
  const totalPixels = info.width * info.height;

  for (let i = 0; i < data.length; i += channels) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    if (r > 170 && b > 170 && g < 110 && Math.abs(r - b) < 60) magentaPixels++;
  }

  const ratio = totalPixels > 0 ? magentaPixels / totalPixels : 0;
  return ratio > 0.001;
}

export async function generatePoolVisualization(
  customerPhotoUrl: string,
  config: PoolConfig,
  clientConfig: ClientConfig
) {
  const prompt = buildPoolPrompt(config, clientConfig);

  const model = clientConfig.pool_models.find((m) => m.id === config.model);
  const poolRef = model?.reference_image_url;
  if (!poolRef) {
    throw new Error(`Model referans görseli bulunamadı: ${config.model}`);
  }

  const customerBuffer = await fetchImageBuffer(customerPhotoUrl);
  const { width = 0, height = 0 } = await sharp(customerBuffer).rotate().metadata();

  let aspectRatio: string | null = null;
  if (width && height) {
    aspectRatio = closestAspectRatio(width, height);
  } else {
    console.warn("Fotoğraf boyutları okunamadı, aspect_ratio gönderilmeyecek.");
  }

  // Artık gerçekten kılavuz çiziliyor — prompt'un tarif ettiği magenta
  // dikdörtgen gerçekten görselde var oluyor.
  const gardenImageForAi = width > 0 && height > 0
    ? await createPlacementGuide(
        customerBuffer, width, height,
        Boolean(config.ceramic || config.deck),
        config.size
      )
    : customerPhotoUrl;

  const poolReference = await createPoolReferenceBoard(poolRef, model?.reference_image_url_2);

  const ceramicSel = config.ceramic
    ? clientConfig.ceramic_colors.find((c) => c.id === config.ceramic)
    : null;
  const deckSel = config.deck
    ? clientConfig.deck_colors.find((d) => d.id === config.deck)
    : null;
  const materialRef = ceramicSel?.reference_image_url || deckSel?.reference_image_url || null;

  const stairRef = clientConfig.features?.stair_reference_url;

  // Sıra prompt.ts'teki numaralandırmayla BİREBİR aynı olmalı:
  // 1: bahçe (kılavuzlu), 2: havuz referans board'u,
  // sonra (varsa) malzeme -> şelale -> merdiven.
  const imageUrls: string[] = [gardenImageForAi, poolReference];

  if (materialRef) imageUrls.push(materialRef);
  if (config.hasWaterfall && WATERFALL_REF) imageUrls.push(WATERFALL_REF);
  if (config.hasStairs && stairRef) imageUrls.push(stairRef);

  console.log("=== FAL.AI DEBUG ===");
  console.log("Endpoint:", FAL_MODEL);
  console.log("Model:", config.model);
  console.log("Malzeme referansı:", materialRef ? "VAR" : "yok");
  console.log("Merdiven referansı:", (config.hasStairs && stairRef) ? "VAR" : "yok");
  console.log("Aspect ratio (çıktı):", aspectRatio ?? "(otomatik)");
  console.log("Prompt uzunluğu:", prompt.length);
  console.log("Referans görsel sayısı:", imageUrls.length);
  console.log("====================");

  for (const url of imageUrls) {
    if (url.startsWith("data:")) continue;
    try {
      const res = await fetch(url, { method: "HEAD" });
      console.log(`URL kontrol: ${url} → ${res.status}`);
    } catch (e) {
      console.log(`URL HATASI: ${url} → erişilemiyor`);
    }
  }

  const baseInput: Record<string, unknown> = { prompt, image_urls: imageUrls };

  const subscribe = (input: Record<string, unknown>) =>
    fal.subscribe(FAL_MODEL, {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      input: input as any,
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === "IN_PROGRESS") {
          update.logs?.forEach((log) => console.log("[fal.ai]", log.message));
        }
      },
    });

  const runOnce = async () => {
    if (aspectRatio) {
      try {
        return await subscribe({ ...baseInput, aspect_ratio: aspectRatio });
      } catch (err: any) {
        const bodyText = JSON.stringify(err?.body ?? "");
        if (err?.status === 422 || bodyText.includes("aspect_ratio")) {
          console.warn("aspect_ratio desteklenmiyor, parametresiz yeniden deneniyor.");
          return await subscribe(baseInput);
        }
        throw err;
      }
    }
    return await subscribe(baseInput);
  };

  try {
    const result = await runOnce();
    let finalUrl: string = result.data.images[0].url;
    let retried = false;

    const hasResidue = await detectMagentaResidue(finalUrl);
    if (hasResidue) {
      console.warn("⚠️ Magenta kalıntısı tespit edildi, 1 kez yeniden üretiliyor...");
      const retryResult = await runOnce();
      finalUrl = retryResult.data.images[0].url;
      retried = true;
    }

    console.log("✅ BAŞARILI:", finalUrl, retried ? "(retry sonrası)" : "");
    return { aiImageUrl: finalUrl, prompt };
  } catch (error: any) {
    console.error("❌ FAL.AI HATASI:", error?.status, error?.message);
    throw error;
  }
}