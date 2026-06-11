import { supabaseAdmin } from "@/lib/supabase";
import bcrypt from "bcryptjs";

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

  const password_hash = await bcrypt.hash(plain_password, 10);

  const { error } = await supabaseAdmin
    .from("clients")
    .insert({
      id,
      name,
      email,
      phone,
      plan:        plan || "basic",
      monthly_fee: monthly_fee || 0,
      password_hash,
      is_active:   true,
    });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ success: true });
}
