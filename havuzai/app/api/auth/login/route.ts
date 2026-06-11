import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return Response.json(
        { success: false, error: "Email ve şifre gerekli" },
        { status: 400 }
      );
    }

    const { data: client, error } = await supabase
      .from("clients")
      .select("id, name, email, password_hash, is_active")
      .eq("email", email)
      .single();

    if (error || !client) {
      return Response.json(
        { success: false, error: "Email veya şifre hatalı" },
        { status: 401 }
      );
    }

    if (!client.is_active) {
      return Response.json(
        { success: false, error: "Hesabınız aktif değil" },
        { status: 401 }
      );
    }

    if (!client.password_hash) {
      return Response.json(
        { success: false, error: "Şifre tanımlı değil" },
        { status: 401 }
      );
    }

    const isValid = await bcrypt.compare(password, client.password_hash);

    if (!isValid) {
      return Response.json(
        { success: false, error: "Email veya şifre hatalı" },
        { status: 401 }
      );
    }

    const token = nanoid(64);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await supabase.from("sessions").insert({
      client_id:  client.id,
      token,
      expires_at: expiresAt.toISOString(),
    });

    const response = Response.json({
      success:    true,
      clientId:   client.id,
      clientName: client.name,
    });

    response.headers.set(
      "Set-Cookie",
      `havuzai_token=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Expires=${expiresAt.toUTCString()}`
    );

    return response;

  } catch (err) {
    console.error("Login error:", err);
    return Response.json(
      { success: false, error: "Sunucu hatası" },
      { status: 500 }
    );
  }
}
