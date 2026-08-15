/**
 * Verilen provinceId'ye ait ilçe listesini TurkiyeAPI'den sunucu tarafında çeker.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const provinceId = searchParams.get("provinceId");

  if (!provinceId) {
    return Response.json({ success: false, districts: [], error: "provinceId gerekli" }, { status: 400 });
  }

  try {
    const res = await fetch(
      `https://api.turkiyeapi.dev/v2/districts?provinceId=${encodeURIComponent(provinceId)}&fields=id,name&sort=name&limit=100`,
      { next: { revalidate: 86400 } }
    );
    if (!res.ok) throw new Error(`TurkiyeAPI ${res.status}`);
    const data = await res.json();
    return Response.json({ success: true, districts: data.data || [] });
  } catch (error) {
    return Response.json({ success: false, districts: [], error: (error as Error).message }, { status: 500 });
  }
}