import { supabaseAdmin } from "@/lib/supabase";

function checkAuth(request: Request) {
  const auth = request.headers.get("x-super-admin-password");
  return auth === process.env.SUPER_ADMIN_PASSWORD;
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!checkAuth(request)) {
    return Response.json({ error: "Yetkisiz erişim." }, { status: 401 });
  }
  if (!supabaseAdmin) {
    return Response.json({ error: "Veritabanı bağlantısı kurulamadı." }, { status: 500 });
  }

  const { id } = await params;
  const body = await request.json();
  const { name, email, phone, plan, monthly_fee, is_active, plain_password } = body;

  const updates: Record<string, unknown> = {};
  if (name        !== undefined) updates.name        = name;
  if (email       !== undefined) updates.email       = email;
  if (phone       !== undefined) updates.phone       = phone;
  if (plan        !== undefined) updates.plan        = plan;
  if (monthly_fee !== undefined) updates.monthly_fee = monthly_fee;
  if (is_active   !== undefined) updates.is_active   = is_active;

  // Şifre güncelleme: Supabase Auth üzerinden
  if (plain_password) {
    const { data: clientRow } = await supabaseAdmin
      .from("clients")
      .select("auth_user_id")
      .eq("id", id)
      .single();

    if (clientRow?.auth_user_id) {
      const { error: authUpdateError } = await supabaseAdmin.auth.admin.updateUserById(
        clientRow.auth_user_id,
        { password: plain_password }
      );
      if (authUpdateError) {
        return Response.json(
          { error: `Şifre güncellenemedi: ${authUpdateError.message}` },
          { status: 500 }
        );
      }
    }
  }

  if (Object.keys(updates).length > 0) {
    const { error } = await supabaseAdmin
      .from("clients")
      .update(updates)
      .eq("id", id);

    if (error) return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ success: true });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!checkAuth(request)) {
    return Response.json({ error: "Yetkisiz erişim." }, { status: 401 });
  }
  if (!supabaseAdmin) {
    return Response.json({ error: "Veritabanı bağlantısı kurulamadı." }, { status: 500 });
  }

  const { id } = await params;

  // Auth kullanıcısını da sil
  const { data: clientRow } = await supabaseAdmin
    .from("clients")
    .select("auth_user_id")
    .eq("id", id)
    .single();

  if (clientRow?.auth_user_id) {
    await supabaseAdmin.auth.admin.deleteUser(clientRow.auth_user_id);
  }

  const { error } = await supabaseAdmin
    .from("clients")
    .delete()
    .eq("id", id);

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ success: true });
}
