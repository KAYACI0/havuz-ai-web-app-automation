import { supabaseAdmin } from "@/lib/supabase";
import { getClientConfig } from "@/lib/config";
import type { ClientConfig } from "@/lib/config-types";

function checkAuth(request: Request) {
  const auth = request.headers.get("x-super-admin-password");
  return auth === process.env.SUPER_ADMIN_PASSWORD;
}

/** GET /api/super-admin/config?clientId=xxx → düzenleme için efektif config (defaults dolu). */
export async function GET(request: Request) {
  if (!checkAuth(request)) {
    return Response.json({ error: "Yetkisiz erişim." }, { status: 401 });
  }
  if (!supabaseAdmin) {
    return Response.json({ error: "Veritabanı bağlantısı kurulamadı." }, { status: 500 });
  }

  const clientId = new URL(request.url).searchParams.get("clientId");
  if (!clientId) {
    return Response.json({ error: "clientId gerekli." }, { status: 400 });
  }

  const config = await getClientConfig(clientId);
  return Response.json({ success: true, config });
}

/** PUT /api/super-admin/config → firma config'ini kaydeder (upsert). */
export async function PUT(request: Request) {
  if (!checkAuth(request)) {
    return Response.json({ error: "Yetkisiz erişim." }, { status: 401 });
  }
  if (!supabaseAdmin) {
    return Response.json({ error: "Veritabanı bağlantısı kurulamadı." }, { status: 500 });
  }

  const body = await request.json();
  const { clientId, config } = body as { clientId?: string; config?: Partial<ClientConfig> };

  if (!clientId || !config) {
    return Response.json({ error: "clientId ve config gerekli." }, { status: 400 });
  }

  const { error } = await supabaseAdmin.from("client_configs").upsert(
    {
      client_id: clientId,
      pool_models: config.pool_models ?? [],
      deck_colors: config.deck_colors ?? [],
      ceramic_colors: config.ceramic_colors ?? [],
      features: config.features ?? {},
      brand: config.brand ?? {},
      contact: config.contact ?? {},
      updated_at: new Date().toISOString(),
    },
    { onConflict: "client_id" }
  );

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ success: true });
}
