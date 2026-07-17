import { fal } from "@fal-ai/client";
import sharp from "sharp";
import { buildPoolPrompt, PoolConfig } from "./prompt";
import type { ClientConfig } from "./config-types";

fal.config({ credentials: process.env.FAL_KEY! });

const WATERFALL_REF = process.env.NEXT_PUBLIC_SELALE_REFERENCE_URL!;

async function createOrientationGuide(
  customerPhotoUrl: string,
  orientation: "horizontal" | "vertical"
): Promise<string> {
  const response = await fetch(customerPhotoUrl);

  if (!response.ok) {
    throw new Error(`Bahçe fotoğrafı indirilemedi: ${response.status}`);
  }

  const sourceBuffer = Buffer.from(await response.arrayBuffer());
  const image = sharp(sourceBuffer).rotate();
  const metadata = await image.metadata();

  if (!metadata.width || !metadata.height) {
    throw new Error("Bahçe fotoğrafının boyutları okunamadı.");
  }

  const { width, height } = metadata;

  // Rehber fotoğrafın orta-alt bölümünde oluşturulur.
  // Bu değerleri sonra istersen arayüzden kullanıcıya sürükleterek seçtirebiliriz.
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

  // Canlı pembe rehber: modelin havuzu bu dikdörtgenin tam yerine koymasını sağlar.
  const guideSvg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect
        x="${x}"
        y="${y}"
        width="${guideWidth}"
        height="${guideHeight}"
        fill="rgba(255, 0, 255, 0.18)"
        stroke="#ff00ff"
        stroke-width="${strokeWidth}"
      />
      <line
        x1="${x}"
        y1="${Math.round(y + guideHeight / 2)}"
        x2="${x + guideWidth}"
        y2="${Math.round(y + guideHeight / 2)}"
        stroke="#ff00ff"
        stroke-width="${Math.max(4, Math.round(strokeWidth / 2))}"
        stroke-dasharray="${strokeWidth * 2} ${strokeWidth}"
      />
    </svg>
  `;

  const guidedBuffer = await image
    .composite([{ input: Buffer.from(guideSvg) }])
    .png()
    .toBuffer();

  // fal.ai image_urls alanı Base64 data URI kabul eder.
  return `data:image/png;base64,${guidedBuffer.toString("base64")}`;
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

  const needsOrientationGuide =
    config.poolOrientation === "horizontal" ||
    config.poolOrientation === "vertical";

  const gardenImageForAi = needsOrientationGuide
    ? await createOrientationGuide(
        customerPhotoUrl,
        config.poolOrientation as "horizontal" | "vertical"
      )
    : customerPhotoUrl;

  const imageUrls: string[] = [gardenImageForAi, poolRef];

  const poolRef2 = model?.reference_image_url_2;
  if (poolRef2) {
    imageUrls.push(poolRef2);
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
  console.log("Orientation:", config.poolOrientation);
  console.log("Orientation guide used:", needsOrientationGuide);
  console.log("Prompt length:", prompt.length);
  console.log("Reference image count:", imageUrls.length);
  console.log("====================");

  try {
  const result = await fal.subscribe("fal-ai/nano-banana-pro/edit", {
    input: {
      prompt,
      image_urls: imageUrls,
      output_format: "png",
      resolution: "2K",
      num_images: 4,
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

  console.log(
    "4 GÖRSEL URL:",
    result.data.images.map((image) => image.url)
  );

  return {
    aiImageUrl: result.data.images[0].url,
    prompt,
  };
} catch (error: any) {
  console.error("FAL.AI HATASI:", error);
  throw error;
}
}