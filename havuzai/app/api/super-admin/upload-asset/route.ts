import { supabaseAdmin } from "@/lib/supabase";

function checkAuth(request: Request) {
  const auth = request.headers.get("x-super-admin-password");
  return auth === process.env.SUPER_ADMIN_PASSWORD;
}

/**
 * POST /api/super-admin/upload-asset  (multipart/form-data)
 * Alanlar: file (görsel), clientId, kind ("model" | "logo")
 * → assets (public) bucket'ına yükler, public URL döner.
 */
export async function POST(request: Request) {
  if (!checkAuth(request)) {
    return Response.json({ error: "Yetkisiz erişim." }, { status: 401 });
  }
  if (!supabaseAdmin) {
    return Response.json({ error: "Veritabanı bağlantısı kurulamadı." }, { status: 500 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const clientId = formData.get("clientId") as string | null;
  const kind = (formData.get("kind") as string) || "asset";

  if (!file || !clientId) {
    return Response.json({ error: "file ve clientId gerekli." }, { status: 400 });
  }

  const ext = (file.name.split(".").pop() || "png").toLowerCase();
  const path = `${clientId}/${kind}-${Date.now()}.${ext}`;
  const buffer = await file.arrayBuffer();

  const { error: uploadError } = await supabaseAdmin.storage
    .from("assets")
    .upload(path, buffer, { contentType: file.type || "image/png", upsert: true });

  if (uploadError) {
    return Response.json(
      { error: "Yükleme başarısız: " + uploadError.message },
      { status: 500 }
    );
  }

  const { data } = supabaseAdmin.storage.from("assets").getPublicUrl(path);
  return Response.json({ success: true, url: data.publicUrl });
}
