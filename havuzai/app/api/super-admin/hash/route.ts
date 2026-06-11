import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  const { password, adminPassword } = await req.json();

  if (adminPassword !== process.env.SUPER_ADMIN_PASSWORD) {
    return Response.json({ error: "Yetkisiz erişim." }, { status: 401 });
  }

  if (!password) {
    return Response.json({ error: "Şifre boş olamaz." }, { status: 400 });
  }

  const hash = await bcrypt.hash(password, 10);
  return Response.json({ hash });
}
