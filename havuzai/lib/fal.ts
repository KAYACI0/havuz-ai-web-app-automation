import { fal } from "@fal-ai/client";
import sharp from "sharp";
import { buildPoolPrompt, PoolConfig } from "./prompt";
import type { ClientConfig } from "./config-types";

fal.config({ credentials: process.env.FAL_KEY! });

async function fetchImageBuffer(url: string): Promise<Buffer> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Image could not be downloaded: ${response.status}`);
  }

  return Buffer.from(await response.arrayBuffer());
}

async function createOrientationGuide(
  customerPhotoUrl: string,
  orientation: "horizontal" | "vertical"
): Promise<string> {
  const sourceBuffer = await fetchImageBuffer(customerPhotoUrl);
  const image = sharp(sourceBuffer).rotate();
  const metadata = await image.metadata();

  if (!metadata.width || !metadata.height) {
    throw new Error("Garden photo dimensions could not be read.");
  }

  const { width, height } = metadata;
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

  return `data:image/png;base64,${guidedBuffer.toString("base64")}`;
}

// Nano Banana Pro Edit should receive two strong references only:
// Image 1 = guided garden, Image 2 = this combined pool-model board.
async function createPoolReferenceBoard(
  primaryReferenceUrl: string,
  secondaryReferenceUrl?: string
): Promise<string> {
  if (!secondaryReferenceUrl) {
    return primaryReferenceUrl;
  }

  const [primaryBuffer, secondaryBuffer] = await Promise.all([
    fetchImageBuffer(primaryReferenceUrl),
    fetchImageBuffer(secondaryReferenceUrl),
  ]);

  const panelWidth = 1024;
  const panelHeight = 1024;

  const [primaryPanel, secondaryPanel] = await Promise.all([
    sharp(primaryBuffer)
      .rotate()
      .resize(panelWidth, panelHeight, {
        fit: "contain",
        background: "#ffffff",
      })
      .png()
      .toBuffer(),
    sharp(secondaryBuffer)
      .rotate()
      .resize(panelWidth, panelHeight, {
        fit: "contain",
        background: "#ffffff",
      })
      .png()
      .toBuffer(),
  ]);

  const board = await sharp({
    create: {
      width: panelWidth * 2,
      height: panelHeight,
      channels: 4,
      background: "#ffffff",
    },
  })
    .composite([
      { input: primaryPanel, left: 0, top: 0 },
      { input: secondaryPanel, left: panelWidth, top: 0 },
    ])
    .png()
    .toBuffer();

  return `data:image/png;base64,${board.toString("base64")}`;
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
    throw new Error(`Pool model reference was not found: ${config.model}`);
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

  const poolReferenceBoard = await createPoolReferenceBoard(
    poolRef,
    model?.reference_image_url_2
  );

  // Do not append waterfall or ladder images here. They dilute the exact pool-model
  // reference. Their required appearance is controlled in prompt.ts.
  const imageUrls = [gardenImageForAi, poolReferenceBoard];

  console.log("=== FAL.AI DEBUG ===");
  console.log("Model:", config.model);
  console.log("Orientation:", config.poolOrientation);
  console.log("Orientation guide used:", needsOrientationGuide);
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

    const aiImageUrls = result.data.images.map((image) => image.url);
    console.log("4 GENERATED IMAGE URLS:", aiImageUrls);

    return {
      // Keeps current frontend integrations working.
      aiImageUrl: aiImageUrls[0],
      // Use this later in the frontend to display/select all four candidates.
      aiImageUrls,
      prompt,
    };
  } catch (error: any) {
    console.error("FAL.AI ERROR:", error);
    throw error;
  }
}
