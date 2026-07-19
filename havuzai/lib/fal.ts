// ============================================================
// NİHAİ VERSİYON — tek kaynak bu dosya olsun.
// Model: fal-ai/nano-banana/edit (klasik) → $0.039/görsel
// Özellikler: OPAK magenta yerleşim kılavuzu (ölçeğe kilitli oran)
//             + çıktı oranı sabitleme + magenta tespiti/retry sigortası
// Prompt tarafı: solid-block dilli son prompt.ts ile uyumlu
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

// YENİ (S2/S5): "8x4", "8 x 4", "8,5x4" gibi metinlerden uzun/kısa kenar
// oranını çıkarır. Kılavuz kutusu artık bu orana kilitli çiziliyor —
// önceden kutu her zaman sabit ~3:1 (yatay) / ~1:2 (dikey) idi, config.size
// ne olursa olsun; bu, prompt'taki "Size 8x4 meters" metniyle kutunun
// şekli arasında bir tutarsızlık yaratıyordu.
function parsePoolAspect(size: string): number | null {
  const match = size.match(/(\d+(?:[.,]\d+)?)\s*[x×]\s*(\d+(?:[.,]\d+)?)/i);
  if (!match) return null;
  const a = parseFloat(match[1].replace(",", "."));
  const b = parseFloat(match[2].replace(",", "."));
  if (!a || !b) return null;
  const ratio = Math.max(a, b) / Math.min(a, b);
  // Aşırı uç oranlarda kutu görsel olarak anlamsızlaşmasın diye sınırla.
  return Math.min(Math.max(ratio, 1.15), 3.5);
}

// Müşteri fotoğrafının üstüne magenta yerleşim kılavuzu çizer.
// prompt.ts'teki PLACEMENT GUIDE talimatı bu çizimle birebir eşleşir:
// kutu = havuz ayak izi, kesikli çizgi = uzun eksen yönü.
//
// S1 DEĞİŞİKLİĞİ: su alanı kutusu artık TAM OPAK dolgu ile çiziliyor
// (önceden %18 saydamdı, çim hafifçe görünüyordu). Amaç: modelin bunu
// "çime binmiş pembe ton" değil, "değiştirilmesi gereken bir yer tutucu
// nesne" olarak görmesi. prompt.ts'teki guideLines bu değişikliğe göre
// güncellendi ("solid block / replace" çerçevesi).
//
// S2/S5 DEĞİŞİKLİĞİ: guideWidth/guideHeight artık parsePoolAspect'ten
// gelen gerçek havuz oranına kilitli; parse edilemezse eski sabit
// oranlara (0.46/0.15 yatay, 0.2/0.4 dikey) düşülüyor — geriye dönük
// uyumluluk korunuyor.
async function createOrientationGuide(
  sourceBuffer: Buffer,
  width: number,
  height: number,
  orientation: "horizontal" | "vertical",
  withWalkwayBoundary: boolean,
  poolSize: string
): Promise<string> {
  const poolAspect = parsePoolAspect(poolSize);

  let guideWidth: number;
  let guideHeight: number;

  if (orientation === "horizontal") {
    // Taban ölçek çapası aynı kaldı (%46 genişlik) — kutunun "ne kadar
    // büyük dursun" heuristiği bu; sadece ŞEKLİ artık gerçek orana uyuyor.
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

  // Yürüme yolu / döşeme dış sınırı: havuz kutusundan her yönde ~%25
  // (kısa kenara göre) dışarıda ince bir ikinci dikdörtgen. Bu, ince ve
  // stroke-only kalmaya devam ediyor (döşeme alanı, "sil ve değiştir"
  // değil "bu bandı döşemeyle kapla" anlamına geliyor).
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
        fill="#ff00ff"
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

// İki havuz referansını tek yan-yana görsele birleştirir.
// Ucuz model çok sayıda referans görselde dağılıyor; tek güçlü
// referans, şekil kopyalama sinyalini belirgin biçimde artırıyor.
async function createPoolReferenceBoard(
  primaryUrl: string,
  secondaryUrl?: string
): Promise<string> {
  if (!secondaryUrl) return primaryUrl;

  const [a, b] = await Promise.all([
    fetchImageBuffer(primaryUrl),
    fetchImageBuffer(secondaryUrl),
  ]);

  const panel = 1024;
  const [pa, pb] = await Promise.all([
    sharp(a).rotate().resize(panel, panel, { fit: "contain", background: "#ffffff" }).png().toBuffer(),
    sharp(b).rotate().resize(panel, panel, { fit: "contain", background: "#ffffff" }).png().toBuffer(),
  ]);

  const board = await sharp({
    create: { width: panel * 2, height: panel, channels: 4, background: "#ffffff" },
  })
    .composite([
      { input: pa, left: 0, top: 0 },
      { input: pb, left: panel, top: 0 },
    ])
    .png()
    .toBuffer();

  return `data:image/png;base64,${board.toString("base64")}`;
}

// YENİ (S1 sigortası): üretilen görselde saf/yarı-opak magenta piksel
// oranını ölçer. Küçültülmüş görsel üzerinde tarar (hız için). %0.1 üstü
// = kılavuz kalıntısı var kabul edilir ve retry tetiklenir.
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
    // Saf ve yarı bozulmuş magenta tonlarını yakalar: R ve B yüksek,
    // G düşük, R ile B birbirine yakın (mora/pembeye kaymış türevler dahil).
    if (r > 170 && b > 170 && g < 110 && Math.abs(r - b) < 60) {
      magentaPixels++;
    }
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
        Boolean(config.ceramic || config.deck),
        config.size
      )
    : customerPhotoUrl;

  // Havuz referans(lar)ı: ikinci görsel varsa tek board'a birleştirilir.
  // Böylece havuz her zaman tek bir Image 2 olarak gider — model dağılmaz.
  const poolReference = await createPoolReferenceBoard(
    poolRef,
    model?.reference_image_url_2
  );

  // Referans görselleri topla
  const imageUrls: string[] = [gardenImageForAi, poolReference];

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

  const runOnce = async () => {
    if (aspectRatio) {
      try {
        return await subscribe({ ...baseInput, aspect_ratio: aspectRatio });
      } catch (err: any) {
        // Klasik model aspect_ratio desteklemiyorsa (422/validation),
        // parametresiz otomatik yeniden dene — üretim durmasın.
        const bodyText = JSON.stringify(err?.body ?? "");
        if (err?.status === 422 || bodyText.includes("aspect_ratio")) {
          console.warn(
            "aspect_ratio bu endpoint'te desteklenmiyor, parametresiz yeniden deneniyor."
          );
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

    // YENİ (S1 sigortası): sadece kılavuz çizildiyse magenta kontrolü
    // anlamlı. Kalıntı bulunursa TEK SEFER yeniden üretim denenir —
    // sonsuz döngüye girmiyoruz, ikinci denemede de kalıntı varsa kabul
    // edip devam ediyoruz (üretim tamamen durmasın diye).
    if (needsGuide) {
      const hasResidue = await detectMagentaResidue(finalUrl);
      if (hasResidue) {
        console.warn("⚠️ Magenta kalıntısı tespit edildi, 1 kez yeniden üretiliyor...");
        const retryResult = await runOnce();
        finalUrl = retryResult.data.images[0].url;
        retried = true;
      }
    }

    console.log("✅ BAŞARILI:", finalUrl, retried ? "(retry sonrası)" : "");

    return {
      aiImageUrl: finalUrl,
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