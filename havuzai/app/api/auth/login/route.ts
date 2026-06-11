import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return Response.json(
      { success: false, error: "Email ve şifre gir" },
      { status: 400 }
    );
  }

  const sb = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );

  const { data: client } = await sb
    .from("clients")
    .select("id, name, password_hash, is_active")
    .eq("email", email)
    .maybeSingle();

  if (!client || !client.password_hash) {
    return Response.json(
      { success: false, error: "Email veya şifre hatalı" },
      { status: 401 }
    );
  }

  if (client.is_active === false) {
    return Response.json(
      { success: false, error: "Hesap aktif değil" },
      { status: 401 }
    );
  }

  const valid = await bcrypt.compare(password, client.password_hash);
  if (!valid) {
    return Response.json(
      { success: false, error: "Email veya şifre hatalı" },
      { status: 401 }
    );
  }

  const token = crypto.randomUUID() + crypto.randomUUID();
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await sb.from("sessions").insert({
    client_id:  client.id,
    token,
    expires_at: expires.toISOString(),
  });

  return new Response(
    JSON.stringify({ success: true, clientId: client.id, clientName: client.name }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Set-Cookie": `havuzai_token=${token}; HttpOnly; Path=/; Expires=${expires.toUTCString()}; SameSite=Lax`,
      },
    }
  );
}
