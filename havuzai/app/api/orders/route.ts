import { supabaseAdmin } from "@/lib/supabase";

export async function GET(request: Request) {
  if (!supabaseAdmin) {
    return Response.json({ orders: [], total: 0 });
  }

  const { searchParams } = new URL(request.url);
  const clientId = searchParams.get("clientId");
  const status   = searchParams.get("status");
  const page     = parseInt(searchParams.get("page") || "1");
  const limit    = 20;

  let query = supabaseAdmin
    .from("orders")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  if (clientId) {
    query = query.eq("client_id", clientId);
  }

  if (status && status !== "all") {
    query = query.eq("status", status);
  }

  const { data, error, count } = await query;

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ orders: data, total: count });
}
