import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function POST() {
  const cookieStore = await cookies();
  const token = cookieStore.get("havuzai_token")?.value;

  if (token) {
    await supabase.from("sessions").delete().eq("token", token);
  }

  const response = Response.json({ success: true });
  response.headers.set(
    "Set-Cookie",
    "havuzai_token=; HttpOnly; Secure; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT"
  );
  return response;
}
