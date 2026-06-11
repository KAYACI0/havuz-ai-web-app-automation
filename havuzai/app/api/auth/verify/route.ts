import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("havuzai_token")?.value;

    if (!token) {
      return Response.json({ valid: false }, { status: 401 });
    }

    const { data: session } = await supabase
      .from("sessions")
      .select("client_id, expires_at")
      .eq("token", token)
      .single();

    if (!session) {
      return Response.json({ valid: false }, { status: 401 });
    }

    if (new Date(session.expires_at) < new Date()) {
      return Response.json({ valid: false }, { status: 401 });
    }

    return Response.json({
      valid:    true,
      clientId: session.client_id,
    });

  } catch {
    return Response.json({ valid: false }, { status: 401 });
  }
}
