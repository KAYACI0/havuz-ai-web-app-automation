import { fal } from "@fal-ai/client";

fal.config({ credentials: process.env.FAL_KEY });

export async function GET(request: Request) {
  const secret = new URL(request.url).searchParams.get("secret");
  if (secret !== process.env.ADMIN_SECRET) {
    return Response.json({ error: "Yetkisiz." }, { status: 401 });
  }

  const checks: Record<string, unknown> = {};

  // 1. Env değişkenleri
  checks.env = {
    FAL_KEY:             process.env.FAL_KEY ? "✅ VAR" : "❌ YOK",
    SUPABASE_URL:        process.env.SUPABASE_URL ? "✅ VAR" : "❌ YOK",
    SUPABASE_SERVICE_KEY:process.env.SUPABASE_SERVICE_KEY ? "✅ VAR" : "❌ YOK",
    RESEND_API_KEY:      process.env.RESEND_API_KEY ? "✅ VAR" : "❌ YOK",
  };

  // 2. Supabase bağlantısı
  try {
    const { createClient } = await import("@supabase/supabase-js");
    const sb = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);
    const { error } = await sb.from("clients").select("id").limit(1);
    checks.supabase = error ? `❌ ${error.message}` : "✅ Bağlantı OK";
  } catch (e) {
    checks.supabase = `❌ ${String(e)}`;
  }

  // 3. fal.ai — küçük test görseli ile gerçek bir istek
  try {
    const result = await fal.subscribe("fal-ai/flux-pro/kontext", {
      input: {
        prompt: "Add a small blue swimming pool to the backyard. Photorealistic.",
        image_url: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400",
      },
    });

    checks.fal = {
      status:          "✅ Yanıt alındı",
      response_keys:   Object.keys(result as object),
      full_response:   result,
    };
  } catch (e: unknown) {
    const err = e as { status?: number; body?: unknown; message?: string };
    checks.fal = {
      status:  "❌ Hata",
      message: err?.message,
      http_status: err?.status,
      body:    err?.body,
    };
  }

  return Response.json(checks, {
    headers: { "Content-Type": "application/json" },
  });
}
