import { supabaseAdmin } from "@/lib/supabase";

export async function POST(request: Request) {
  const { password, clientData } = await request.json();

  if (password !== process.env.SUPER_ADMIN_PASSWORD) {
    return Response.json({ error: "Yetkisiz erişim." }, { status: 401 });
  }

  if (!supabaseAdmin) {
    return Response.json({ error: "Veritabanı bağlantısı kurulamadı." }, { status: 500 });
  }

  const { id, name, email, phone, plan, monthly_fee, plain_password } = clientData;

  if (!id || !name || !email || !plain_password) {
    return Response.json({ error: "Tüm zorunlu alanları doldurun." }, { status: 400 });
  }

  // 1. Supabase Auth kullanıcısı oluştur
  const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password: plain_password,
    email_confirm: true,
  });

  if (authError || !authUser.user) {
    return Response.json(
      { error: `Auth kullanıcısı oluşturulamadı: ${authError?.message}` },
      { status: 500 }
    );
  }

  // 2. Clients tablosuna kaydet (auth_user_id ile)
  const { error: dbError } = await supabaseAdmin
    .from("clients")
    .insert({
      id,
      name,
      email,
      phone,
      plan:         plan || "basic",
      monthly_fee:  monthly_fee || 0,
      is_active:    true,
      auth_user_id: authUser.user.id,
    });

  if (dbError) {
    // Rollback: auth kullanıcısını sil
    await supabaseAdmin.auth.admin.deleteUser(authUser.user.id);
    return Response.json({ error: dbError.message }, { status: 500 });
  }

  return Response.json({ success: true });
}
