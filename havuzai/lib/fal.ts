import { fal } from "@fal-ai/client";
import { buildPoolPrompt, PoolConfig } from "./prompt";
import type { ClientConfig } from "./config-types";

fal.config({ credentials: process.env.FAL_KEY! });

const WATERFALL_REF = process.env.NEXT_PUBLIC_SELALE_REFERENCE_URL!;

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

  // Turkuaz seramik görseli gibi, reference_image_url olan İLK seramik
  // yalnızca 33x66 form/döşeme/derz referansı olur.
  // Kullanıcının seçtiği renk prompt tarafından uygulanır.
  const ceramicLayoutRef = clientConfig.ceramic_colors.find(
    (color) => color.reference_image_url
  )?.reference_image_url;

  const imageUrls: string[] = [
    customerPhotoUrl, // Image 1: müşteri bahçesi
    poolRef, // Image 2: seçilen Roma / Relax ana referansı
  ];

  // Roma veya Relax ikinci açı referansı.
  if (model?.reference_image_url_2) {
    imageUrls.push(model.reference_image_url_2);
  }

  // Seramik seçilmişse, tek genel seramik form referansını gönder.
  if (config.ceramic && ceramicLayoutRef) {
    imageUrls.push(ceramicLayoutRef);
  }

  if (config.hasWaterfall && WATERFALL_REF) {
    imageUrls.push(WATERFALL_REF);
  }

  const stairRef = clientConfig.features?.stair_reference_url;
  if (config.hasStairs && stairRef) {
    imageUrls.push(stairRef);
  }

  console.log("=== FAL.AI DEBUG ===");
  console.log("Seçilen model:", config.model);
  console.log("Seramik referansı:", ceramicLayoutRef || "YOK");
  console.log("Gönderilen görseller:", JSON.stringify(imageUrls, null, 2));
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

    return {
      aiImageUrl: result.data.images[0].url,
      prompt,
    };
  } catch (error: any) {
    console.error("❌ FAL.AI HATASI:", error?.message);
    console.error("Body:", JSON.stringify(error?.body, null, 2));
    throw error;
  }
}