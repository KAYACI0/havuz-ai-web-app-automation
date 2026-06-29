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

  console.log("Model:", config.model);
  console.log("Referans görsel sayısı:", imageUrls.length);
  console.log("Image URLs:", imageUrls);

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

  return {
    aiImageUrl: result.data.images[0].url,
    prompt,
  };
}
