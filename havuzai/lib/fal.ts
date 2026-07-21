import { fal } from "@fal-ai/client";
import { buildPoolPrompt, PoolConfig } from "./prompt";
import type { ClientConfig } from "./config-types";

fal.config({ credentials: process.env.FAL_KEY! });

const WATERFALL_REF = process.env.NEXT_PUBLIC_SELALE_REFERENCE_URL!;

// Bu görsel sadece 33x66 dikdörtgen karo formu, sıra düzeni ve derzler içindir.
// Rengi ASLA kopyalanmaz; prompt içindeki seçili seramik rengi kullanılır.
const CERAMIC_REFERENCE =
  process.env.NEXT_PUBLIC_SERAMIK_REFERENCE_URL ||
  process.env.NEXT_PUBLIC_CERAMIC_REFERENCE_URL;

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

  if (config.ceramic && !CERAMIC_REFERENCE) {
    throw new Error(
      "Seramik seçildi ancak NEXT_PUBLIC_SERAMIK_REFERENCE_URL tanımlı değil."
    );
  }

  const imageUrls: string[] = [
    customerPhotoUrl, // Image 1: Bahçe fotoğrafı
    poolRef, // Image 2: Birincil havuz referansı
  ];

  // Roma / Relax modelinin ikinci açıdan referansını da gönder.
  if (model?.reference_image_url_2) {
    imageUrls.push(model.reference_image_url_2);
  }

  // Seçilen renkten bağımsız olarak turkuaz seramik görseli,
  // sadece dikdörtgen karo biçimi ve döşeme düzeni için gönderilir.
  if (config.ceramic && CERAMIC_REFERENCE) {
    imageUrls.push(CERAMIC_REFERENCE);
  }

  if (config.hasWaterfall && WATERFALL_REF) {
    imageUrls.push(WATERFALL_REF);
  }

  const stairRef = clientConfig.features?.stair_reference_url;
  if (config.hasStairs && stairRef) {
    imageUrls.push(stairRef);
  }

  console.log("=== FAL.AI DEBUG ===");
  console.log("Model:", config.model);
  console.log("Prompt uzunluğu:", prompt.length);
  console.log("Image URLs:", JSON.stringify(imageUrls, null, 2));
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
          update.logs?.forEach((log) => {
            console.log("[fal.ai]", log.message);
          });
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