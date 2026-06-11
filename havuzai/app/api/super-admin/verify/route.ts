export async function POST(request: Request) {
  const { password } = await request.json();
  if (password === process.env.SUPER_ADMIN_PASSWORD) {
    return Response.json({ ok: true });
  }
  return Response.json({ error: "Yanlış şifre." }, { status: 401 });
}
