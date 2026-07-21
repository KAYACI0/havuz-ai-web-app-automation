import { fal } from "@fal-ai/client";
import { buildPoolPrompt, PromptImageReferences, PoolConfig } from "./prompt";
import type { ClientConfig } from "./config-types";

// API Key kontrolü
const apiKey = process.env.FAL_KEY || process.env.NEXT_PUBLIC_FAL_KEY;
if (apiKey) {
  fal.config({ credentials: apiKey });
}

const WATERFALL_REF = process.env.NEXT_PUBLIC_SELALE_REFERENCE_URL || "";

export async function generatePoolVisualization(
  customerPhotoUrl: string,
  config: PoolConfig,
  clientConfig: ClientConfig
) {
  if (!apiKey) {
    throw new Error("FAL API Key bulunamadı. Lütfen FAL_KEY ortam değişkenini kontrol edin.");
  }

  if (!clientConfig?.pool_models) {
    throw new Error("Client konfigürasyonundaki 'pool_models' yüklenemedi.");
  }

  const model = clientConfig.pool_models.find((m) => m.id === config.model);
  const poolRef = model?.reference_image_url;

  if (!poolRef) {
    throw new Error(`Model referans görseli bulunamadı: ${config.model}`);
  }

  // --- Görsel Dizisini & İndeks Eşleşmelerini Dinamik Oluşturma ---
  const imageUrls: string[] = [];

  // 1. Müşteri Bahçe Fotoğrafı (Index: 1)
  imageUrls.push(customerPhotoUrl);
  const gardenIndex = imageUrls.length;

  // 2. Seçilen Model Ana Referansı (Index: 2)
  imageUrls.push(poolRef);
  const poolPrimaryIndex = imageUrls.length;

  // 3. Seçilen Model İkinci Açı Referansı
  let poolSecondaryIndex: number | undefined;
  if (model?.reference_image_url_2) {
    imageUrls.push(model.reference_image_url_2);
    poolSecondaryIndex = imageUrls.length;
  }

  // 4. Seramik Referansı
  let ceramicIndex: number | undefined;
  if (config.ceramic) {
    const ceramicLayoutRef = clientConfig.ceramic_colors?.find(
      (color) => Boolean(color.reference_image_url)
    )?.reference_image_url;

    if (ceramicLayoutRef) {
      imageUrls.push(ceramicLayoutRef);
      ceramicIndex = imageUrls.length;
    }
  }

  // 5. Şelale Referansı
  let waterfallIndex: number | undefined;
  if (config.hasWaterfall && WATERFALL_REF) {
    imageUrls.push(WATERFALL_REF);
    waterfallIndex = imageUrls.length;
  }

  // 6. Merdiven Referansı
  let stairIndex: number | undefined;
  const stairRef = clientConfig.features?.stair_reference_url;
  if (config.hasStairs && stairRef) {
    imageUrls.push(stairRef);
    stairIndex = imageUrls.length;
  }

  // Prompt için indeks haritasını oluştur (3. parametre)
  const refs: PromptImageReferences = {
    gardenIndex,
    poolPrimaryIndex,
    poolSecondaryIndex,
    ceramicIndex,
    waterfallIndex,
    stairIndex,
  };

  // ✅ ARTIK 3 PARAMETRE İLE ÇAĞRILIYOR - HATA ÇÖZÜLDÜ!
  const prompt = buildPoolPrompt(config, clientConfig, refs);

  console.log("=== FAL.AI DEBUG ===");
  console.log("Seçilen Model:", config.model);
  console.log("İndeks Eşleşmeleri (refs):", refs);
  console.log("Gönderilen Görseller:", JSON.stringify(imageUrls, null, 2));
  console.log("====================");

  try {
    const result = await fal.subscribe("fal-ai/nano-banana/edit", {
      input: {
        prompt,
        image_urls: imageUrls,
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === "IN_PROGRESS") {
          update.logs?.forEach((log) => console.log("[fal.ai]", log.message));
        }
      },
    });

    const responseData = result.data as { images?: { url: string }[] };
    const aiImageUrl = responseData?.images?.[0]?.url;

    if (!aiImageUrl) {
      throw new Error("Fal AI başarılı yanıt döndü fakat görsel URL'i bulunamadı.");
    }

    return {
      aiImageUrl,
      prompt,
    };
  } catch (error: any) {
    console.error("❌ FAL.AI HATASI:", error?.message || error);
    if (error?.body) {
      console.error("Body:", JSON.stringify(error.body, null, 2));
    }
    throw error;
  }
}