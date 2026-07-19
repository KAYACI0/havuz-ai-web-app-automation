// ============================================================
// NİHAİ VERSİYON — tek kaynak bu dosya olsun.
// Model: fal-ai/nano-banana/edit (klasik) → $0.039/görsel
// Özellikler: magenta yerleşim kılavuzu + çıktı oranı sabitleme
// Prompt tarafı: placementGuide bloklu son prompt.ts ile uyumlu
// Gereksinim: npm install sharp
// ============================================================

import { fal } from "@fal-ai/client";
import sharp from "sharp";
import { buildPoolPrompt, PoolConfig } from "./prompt";
import type { ClientConfig } from "./config-types";

fal.config({ credentials: process.env.FAL_KEY! });

// Görsel başına maliyeti belirleyen tek satır burası.
// Kalite yetmezse "fal-ai/nano-banana-pro/edit" yap ($0.15/görsel).
const FAL_MODEL = "fal-ai/nano-banana/edit";

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
  orientation: "horizontal" | "vertical",
  withWalkwayBoundary: boolean
): Promise<string> {
  const guideWidth =
    orientation === "horizontal"
      ? Math.round(width * 0.46)
      : Math.round(width * 0.2);
  const guideHeight =
    orientation === "horizontal"
      ? Math.round(height * 0.15)
      : Math.round(height * 0.4);
  const x = Math.round((width - guideWidth) / 2);
  const y = Math.round(height * 0.56 - guideHeight / 2);
  const strokeWidth = Math.max(8, Math.round(Math.min(width, height) * 0.012));
  const dashStroke = Math.max(4, Math.round(strokeWidth / 2));

  // Yürüme yolu dış sınırı: havuz kutusundan her yönde ~%30 (kısa kenara göre)
  // dışarıda ince bir ikinci dikdörtgen. Model 1.2m'yi kelimeden anlamıyor
  // ama çizili sınırı takip edebiliyor.
  const offset = Math.round(0.25 * Math.min(guideWidth, guideHeight));
  const outerRect = withWalkwayBoundary
    ? `<rect
        x="${x - offset}" y="${y - offset}"
        width="${guideWidth + offset * 2}" height="${guideHeight + offset * 2}"
        fill="none"
        stroke="#ff00ff"
        stroke-width="${Math.max(3, Math.round(strokeWidth / 2))}"
      />`
    : "";

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
      ${outerRect}
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
  // aynı buffer'ı kullanır.
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
        config.poolOrientation as "horizontal" | "vertical",
        Boolean(config.ceramic || config.deck)
      )
    : customerPhotoUrl;

  // Referans görselleri topla
  const imageUrls: string[] = [gardenImageForAi, poolRef];

  const poolRef2 = model?.reference_image_url_2;
  if (poolRef2) {
    imageUrls.push(poolRef2);
  }

  if (config.hasWaterfall && WATERFALL_REF) {
    imageUrls.push(WATERFALL_REF);
  }

  // Merdiven stil referansı bilinçli olarak GÖNDERİLMİYOR:
  // fazladan her referans görsel, modelin havuz şeklini (Image 2) kopyalama
  // gücünü sulandırıyor. Merdiven zaten prompt tarifiyle sorunsuz çıkıyor.

  console.log("=== FAL.AI DEBUG ===");
  console.log("Endpoint:", FAL_MODEL);
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

  const baseInput: Record<string, unknown> = {
    prompt,
    image_urls: imageUrls,
  };

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

  try {
    let result;
    if (aspectRatio) {
      try {
        result = await subscribe({ ...baseInput, aspect_ratio: aspectRatio });
      } catch (err: any) {
        // Klasik model aspect_ratio desteklemiyorsa (422/validation),
        // parametresiz otomatik yeniden dene — üretim durmasın.
        const bodyText = JSON.stringify(err?.body ?? "");
        if (err?.status === 422 || bodyText.includes("aspect_ratio")) {
          console.warn(
            "aspect_ratio bu endpoint'te desteklenmiyor, parametresiz yeniden deneniyor."
          );
          result = await subscribe(baseInput);
        } else {
          throw err;
        }
      }
    } else {
      result = await subscribe(baseInput);
    }

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