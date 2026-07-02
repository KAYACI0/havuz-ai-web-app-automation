import { supabaseAdmin } from "@/lib/supabase";
import { getClientConfig } from "@/lib/config";

/**
 * Firma konfigürasyonunu döner. Müşteri formu (/app, /embed) her açılışta çağırır.
 * GET /api/config?clientId=havuzyaptir
 */
export async function GET(request: Request) {
  const clientId = new URL(request.url).searchParams.get("clientId");

  if (!clientId) {
    return Response.json({ success: false, error: "clientId gerekli" }, { status: 400 });
  }

  if (!supabaseAdmin) {
    return Response.json(
      { success: false, error: "Veritabanı bağlantısı kurulamadı" },
      { status: 500 }
    );
  }

  // Firma var mı ve aktif mi?
  const { data: client, error } = await supabaseAdmin
    .from("clients")
    .select("id, is_active")
    .eq("id", clientId)
    .maybeSingle();

  if (error || !client) {
    return Response.json({ success: false, error: "Firma bulunamadı" }, { status: 404 });
  }

  if (!client.is_active) {
    return Response.json({ success: false, error: "Firma pasif" }, { status: 403 });
  }

  const config = await getClientConfig(clientId);
  return Response.json({ success: true, config });
}
