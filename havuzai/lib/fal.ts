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
  prompt: string,
  deckHex?: string,
): Promise<string> {
  const input: Record<string, unknown> = {
    prompt,
    image_url: customerPhotoUrl,
    guidance_scale: 15,
    output_format: "jpeg",
    num_images: 1,
  };

  if (deckHex) {
    input.color_palette = {
      members: [{ color: deckHex, weight: 0.4 }]
    };
  }

  const result = await fal.subscribe("fal-ai/flux-pro/kontext/max", {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    input: input as any,
  }) as unknown as FalResponse;

  return result.data.images[0].url;
}