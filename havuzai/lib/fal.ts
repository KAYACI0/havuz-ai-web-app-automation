import { fal } from "@fal-ai/client";
import { buildPoolPrompt, PoolConfig } from "./prompt";

fal.config({ credentials: process.env.FAL_KEY! });

const POOL_REFS: Record<string, string> = {
  RELAX: process.env.NEXT_PUBLIC_RELAX_REFERENCE_URL!,
  ROMA:  process.env.NEXT_PUBLIC_ROMA_REFERENCE_URL!,
};

const WATERFALL_REF = process.env.NEXT_PUBLIC_SELALE_REFERENCE_URL!;

export async function generatePoolVisualization(
  customerPhotoUrl: string,
  config: PoolConfig
) {
  const prompt = buildPoolPrompt(config);

  // Referans görselleri topla
  const imageUrls: string[] = [
    customerPhotoUrl,                       // 1. Müşteri fotoğrafı (düzenlenecek)
    POOL_REFS[config.model.toUpperCase()],  // 2. Havuz şekli referansı
  ];

  // Şelale seçildiyse referansı ekle
  if (config.hasWaterfall) {
    imageUrls.push(WATERFALL_REF);
  }

  console.log("=== FAL.AI DEBUG ===");
  console.log("Model:", config.model);
  console.log("Prompt uzunluğu:", prompt.length);
  console.log("Prompt ilk 200 karakter:", prompt.slice(0, 200));
  console.log("Image URLs:", JSON.stringify(imageUrls, null, 2));
  console.log("====================");

  for (const url of imageUrls) {
    try {
      const res = await fetch(url, { method: "HEAD" });
      console.log(`URL kontrol: ${url} → ${res.status}`);
    } catch (e) {
      console.log(`URL HATASI: ${url} → erişilemiyor`);
    }
  }

  try {
    const result = await fal.subscribe("fal-ai/nano-banana-pro/edit", {
      input: {
        prompt,
        image_urls: imageUrls,
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === "IN_PROGRESS") {
          update.logs?.forEach((log) =>
            console.log("[fal.ai]", log.message)
          );
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
