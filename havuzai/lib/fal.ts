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
  customerPhotoUrl: string,
  prompt: string
): Promise<string> {
  const result = await fal.subscribe("fal-ai/flux-pro/kontext", {
    input: {
      prompt,
      image_url:      customerPhotoUrl,
      guidance_scale: 7.5,
      output_format:  "jpeg",
      num_images:     1,
    },
  }) as unknown as FalResponse;

  return result.data.images[0].url;
}
