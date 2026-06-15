import { fal } from "@fal-ai/client";

fal.config({ credentials: process.env.FAL_KEY });

interface FalResponse {
  data: {
    images: { url: string; width: number; height: number }[];
  };
  requestId: string;
}

export async function uploadPhotoToFal(
  buffer: ArrayBuffer,
  mimeType: string
): Promise<string> {
  const blob = new Blob([buffer], { type: mimeType });
  return fal.storage.upload(blob);
}

export async function generatePoolImage(
  sceneUrl: string,
  referenceUrl: string,
  prompt: string
): Promise<string> {
  const result = await fal.subscribe("fal-ai/flux-pro/kontext/multi", {
    input: {
      prompt,
      image_urls:     [sceneUrl, referenceUrl],
      guidance_scale: 5.5,
      output_format:  "jpeg",
      num_images:     1,
    },
  }) as unknown as FalResponse;

  return result.data.images[0].url;
}
