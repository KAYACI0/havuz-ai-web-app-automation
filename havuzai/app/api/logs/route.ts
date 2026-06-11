import { getLogs, clearLogs } from "@/lib/logger";

function authorized(request: Request) {
  const secret = request.headers.get("x-admin-secret") || new URL(request.url).searchParams.get("secret");
  return secret === process.env.ADMIN_SECRET;
}

export async function GET(request: Request) {
  if (!authorized(request)) return Response.json({ error: "Yetkisiz." }, { status: 401 });
  return Response.json(getLogs());
}

export async function DELETE(request: Request) {
  if (!authorized(request)) return Response.json({ error: "Yetkisiz." }, { status: 401 });
  clearLogs();
  return Response.json({ cleared: true });
}
