import { createClient } from "@supabase/supabase-js";

export async function GET(req: Request) {
  const cookie = req.headers.get("cookie") || "";
  const token  = cookie
    .split(";")
    .find(c => c.trim().startsWith("havuzai_token="))
    ?.split("=")[1]
    ?.trim();

  if (!token) {
    return Response.json({ valid: false }, { status: 401 });
  }

  const sb = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );

  const { data: session } = await sb
    .from("sessions")
    .select("client_id, expires_at")
    .eq("token", token)
    .maybeSingle();

  if (!session) {
    return Response.json({ valid: false }, { status: 401 });
  }

  if (new Date(session.expires_at) < new Date()) {
    await sb.from("sessions").delete().eq("token", token);
    return Response.json({ valid: false }, { status: 401 });
  }

  return Response.json({ valid: true, clientId: session.client_id });
}
