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
  const result = await fal.subscribe("fal-ai/flux-kontext/pro", {
    input: {
      prompt,
      image_url:           customerPhotoUrl,
      guidance_scale:      3.5,
      num_inference_steps: 28,
      strength:            0.75,
    },
  }) as unknown as FalResponse;

  return result.data.images[0].url;
}
