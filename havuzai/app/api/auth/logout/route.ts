import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  const cookie = req.headers.get("cookie") || "";
  const token  = cookie
    .split(";")
    .find(c => c.trim().startsWith("havuzai_token="))
    ?.split("=")[1]
    ?.trim();

  if (token) {
    const sb = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    );
    await sb.from("sessions").delete().eq("token", token);
  }

  return new Response(
    JSON.stringify({ success: true }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Set-Cookie": "havuzai_token=; HttpOnly; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT",
      },
    }
  );
}
