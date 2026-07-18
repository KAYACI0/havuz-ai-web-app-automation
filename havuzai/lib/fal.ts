import { fal } from "@fal-ai/client";
import sharp from "sharp";
import { buildPoolPrompt, PoolConfig } from "./prompt";
import type { ClientConfig } from "./config-types";

fal.config({ credentials: process.env.FAL_KEY! });

// Şelale referansı henüz config'te tutulmuyor; global env fallback kullanılır.
const WATERFALL_REF = process.env.NEXT_PUBLIC_SELALE_REFERENCE_URL!;

async function fetchImageBuffer(url: string): Promise<Buffer> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Görsel indirilemedi: ${response.status} — ${url}`);
  }
  return Buffer.from(await response.arrayBuffer());
}

// fal'ın desteklediği çıktı oranlarından, müşteri fotoğrafına en yakınını seçer.
// Böylece yatay/dikey HAVUZ seçimi çıktının kadrajını asla değiştiremez.
function closestAspectRatio(width: number, height: number): string {
  const ratio = width / height;
  const supported: [string, number][] = [
    ["21:9", 21 / 9],
    ["16:9", 16 / 9],
    ["4:3", 4 / 3],
    ["3:2", 3 / 2],
    ["1:1", 1],
    ["2:3", 2 / 3],
    ["3:4", 3 / 4],
    ["9:16", 9 / 16],
  ];
  supported.sort((a, b) => Math.abs(a[1] - ratio) - Math.abs(b[1] - ratio));
  return supported[0][0];
}

// Müşteri fotoğrafının üstüne magenta yerleşim kılavuzu çizer.
// prompt.ts'teki PLACEMENT GUIDE talimatı bu çizimle birebir eşleşir:
// kutu = havuz ayak izi, kesikli çizgi = uzun eksen yönü.
async function createOrientationGuide(
  sourceBuffer: Buffer,
  width: number,
  height: number,
  orientation: "horizontal" | "vertical"
): Promise<string> {
  const guideWidth =
    orientation === "horizontal"
      ? Math.round(width * 0.62)
      : Math.round(width * 0.24);
  const guideHeight =
    orientation === "horizontal"
      ? Math.round(height * 0.19)
      : Math.round(height * 0.48);
  const x = Math.round((width - guideWidth) / 2);
  const y = Math.round(height * 0.56 - guideHeight / 2);
  const strokeWidth = Math.max(8, Math.round(Math.min(width, height) * 0.012));
  const dashStroke = Math.max(4, Math.round(strokeWidth / 2));

  // Uzun eksen çizgisi orientation'a göre yön değiştirir:
  // yatayda soldan sağa, dikeyde yukarıdan aşağıya.
  const midX = Math.round(x + guideWidth / 2);
  const midY = Math.round(y + guideHeight / 2);
  const axisLine =
    orientation === "horizontal"
      ? `<line x1="${x}" y1="${midY}" x2="${x + guideWidth}" y2="${midY}"
           stroke="#ff00ff" stroke-width="${dashStroke}"
           stroke-dasharray="${strokeWidth * 2} ${strokeWidth}" />`
      : `<line x1="${midX}" y1="${y}" x2="${midX}" y2="${y + guideHeight}"
           stroke="#ff00ff" stroke-width="${dashStroke}"
           stroke-dasharray="${strokeWidth * 2} ${strokeWidth}" />`;

  const guideSvg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect
        x="${x}" y="${y}"
        width="${guideWidth}" height="${guideHeight}"
        fill="rgba(255, 0, 255, 0.18)"
        stroke="#ff00ff"
        stroke-width="${strokeWidth}"
      />
      ${axisLine}
    </svg>
  `;

  const guidedBuffer = await sharp(sourceBuffer)
    .rotate() // EXIF yönünü piksellere işler — telefon fotoğrafları için şart
    .composite([{ input: Buffer.from(guideSvg) }])
    .png()
    .toBuffer();

  return `data:image/png;base64,${guidedBuffer.toString("base64")}`;
}

export async function generatePoolVisualization(
  customerPhotoUrl: string,
  config: PoolConfig,
  clientConfig: ClientConfig
) {
  const prompt = buildPoolPrompt(config, clientConfig);

  // Seçilen modelin referans görseli firma config'inden gelir.
  const model = clientConfig.pool_models.find((m) => m.id === config.model);
  const poolRef = model?.reference_image_url;
  if (!poolRef) {
    throw new Error(`Model referans görseli bulunamadı: ${config.model}`);
  }

  // Müşteri fotoğrafını bir kez indir; hem oran ölçümü hem kılavuz çizimi
  // aynı buffer'ı kullanır (çift indirme = çift gecikme olmasın).
  const customerBuffer = await fetchImageBuffer(customerPhotoUrl);
  const { width = 0, height = 0 } = await sharp(customerBuffer)
    .rotate()
    .metadata();

  let aspectRatio: string | null = null;
  if (width && height) {
    aspectRatio = closestAspectRatio(width, height);
  } else {
    console.warn("Fotoğraf boyutları okunamadı, aspect_ratio gönderilmeyecek.");
  }

  // Orientation seçiliyse Image 1 = kılavuz çizilmiş fotoğraf.
  // prompt.ts'teki PLACEMENT GUIDE bloğu da yalnızca orientation seçiliyken
  // prompt'a girdiği için kod ile prompt her zaman senkron kalır.
  const needsGuide =
    (config.poolOrientation === "horizontal" ||
      config.poolOrientation === "vertical") &&
    width > 0 &&
    height > 0;

  const gardenImageForAi = needsGuide
    ? await createOrientationGuide(
        customerBuffer,
        width,
        height,
        config.poolOrientation as "horizontal" | "vertical"
      )
    : customerPhotoUrl;

  // Referans görselleri topla
  const imageUrls: string[] = [gardenImageForAi, poolRef];

  // İkinci referans görsel varsa ekle
  const poolRef2 = model?.reference_image_url_2;
  if (poolRef2) {
    imageUrls.push(poolRef2);
  }

  // Şelale seçildiyse referansı ekle
  if (config.hasWaterfall && WATERFALL_REF) {
    imageUrls.push(WATERFALL_REF);
  }

  // Merdiven seçildiyse ladder stil referansını ekle
  const stairRef = clientConfig.features?.stair_reference_url;
  if (config.hasStairs && stairRef) {
    imageUrls.push(stairRef);
  }

  console.log("=== FAL.AI DEBUG ===");
  console.log("Model:", config.model);
  console.log("Orientation:", config.poolOrientation || "(seçilmedi)");
  console.log("Kılavuz çizildi:", needsGuide);
  console.log("Aspect ratio (çıktı):", aspectRatio ?? "(otomatik)");
  console.log("Prompt uzunluğu:", prompt.length);
  console.log("Referans görsel sayısı:", imageUrls.length);
  console.log("====================");

  // Sadece dış URL'leri kontrol et (data: URI'ler fetch HEAD desteklemez)
  for (const url of imageUrls) {
    if (url.startsWith("data:")) continue;
    try {
      const res = await fetch(url, { method: "HEAD" });
      console.log(`URL kontrol: ${url} → ${res.status}`);
    } catch (e) {
      console.log(`URL HATASI: ${url} → erişilemiyor`);
    }
  }

  const input: Record<string, unknown> = {
    prompt,
    image_urls: imageUrls,
  };
  if (aspectRatio) {
    input.aspect_ratio = aspectRatio;
  }

  try {
    const result = await fal.subscribe("fal-ai/nano-banana-pro/edit", {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      input: input as any,
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === "IN_PROGRESS") {
          update.logs?.forEach((log) => console.log("[fal.ai]", log.message));
        }
      },
    });

    console.log("✅ BAŞARILI:", result.data.images[0].url);

    return {
      aiImageUrl: result.data.images[0].url,
      prompt,
    };
  } catch (error: any) {
    console.error("❌ FAL.AI HATASI - tam detay:");
    console.error("Status:", error?.status);
    console.error("Body:", JSON.stringify(error?.body, null, 2));
    console.error("Message:", error?.message);
    throw error;
  }
}