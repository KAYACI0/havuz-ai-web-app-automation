import { supabaseAdmin } from "@/lib/supabase";

function checkAuth(request: Request) {
  const auth = request.headers.get("x-super-admin-password");
  return auth === process.env.SUPER_ADMIN_PASSWORD;
}

export async function GET(request: Request) {
  if (!checkAuth(request)) {
    return Response.json({ error: "Yetkisiz erişim." }, { status: 401 });
  }
  if (!supabaseAdmin) {
    return Response.json({ error: "Veritabanı bağlantısı kurulamadı." }, { status: 500 });
  }

  const { data, error } = await supabaseAdmin
    .from("clients")
    .select("id, name, email, phone, plan, monthly_fee, is_active, created_at, last_login")
    .order("created_at", { ascending: false });

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ clients: data });
}
