import { fal } from "@fal-ai/client";
import { buildPoolPrompt, PoolConfig } from "./prompt";
import type { ClientConfig } from "./config-types";

fal.config({ credentials: process.env.FAL_KEY! });

// Model tek yerden değişsin: .env'de FAL_MODEL=fal-ai/nano-banana/edit
const FAL_MODEL = process.env.FAL_MODEL || "fal-ai/nano-banana/edit";

export async function generatePoolVisualization(
  customerPhotoUrl: string,
  config: PoolConfig,
  clientConfig: ClientConfig
) {
  const t0 = Date.now();
  const lap = (label: string) =>
    console.log(`[süre] ${label}: ${Date.now() - t0}ms`);

  const prompt = buildPoolPrompt(config, clientConfig);

  const model = clientConfig.pool_models.find((m) => m.id === config.model);
  const poolRef = model?.reference_image_url;
  if (!poolRef) {
    throw new Error(`Model referans görseli bulunamadı: ${config.model}`);
  }

  const imageUrls: string[] = [customerPhotoUrl, poolRef];
  if (model?.reference_image_url_2) {
    imageUrls.push(model.reference_image_url_2);
  }

  // HEAD kontrolü sadece geliştirmede, ve paralel
  if (process.env.NODE_ENV !== "production") {
    await Promise.all(
      imageUrls.map(async (url) => {
        try {
          const res = await fetch(url, { method: "HEAD" });
          console.log(`URL kontrol: ${url} → ${res.status}`);
        } catch {
          console.log(`URL HATASI: ${url} → erişilemiyor`);
        }
      })
    );
  }

  lap("hazırlık bitti");

  try {
    let queuedAt = 0;
    let progressAt = 0;

    const result = await fal.subscribe(FAL_MODEL, {
      input: { prompt, image_urls: imageUrls },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === "IN_QUEUE") {
          if (!queuedAt) queuedAt = Date.now() - t0;
          console.log(
            `[fal] kuyrukta, sıra: ${(update as any).queue_position}`
          );
        }
        if (update.status === "IN_PROGRESS" && !progressAt) {
          progressAt = Date.now() - t0;
          lap("işleme başladı (kuyruk bitti)");
        }
        if (update.status === "IN_PROGRESS") {
          update.logs?.forEach((log) => console.log("[fal.ai]", log.message));
        }
      },
    });

    lap("fal bitti (toplam)");

    return {
      aiImageUrl: result.data.images[0].url,
      prompt,
    };
  } catch (error: any) {
    console.error("❌ FAL.AI HATASI:", error?.status, error?.message);
    console.error("Body:", JSON.stringify(error?.body, null, 2));
    throw error;
  }
}