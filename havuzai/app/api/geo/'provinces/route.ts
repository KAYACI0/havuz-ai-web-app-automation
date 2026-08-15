/**
 * İl listesini TurkiyeAPI'den sunucu tarafında çeker ve döner.
 * Tarayıcıdan doğrudan dış API'ye istek atmak yerine bu proxy kullanılır —
 * CORS/ağ sorunlarını tamamen ortadan kaldırır.
 */
export async function GET() {
  try {
    const res = await fetch("https://api.turkiyeapi.dev/v2/provinces?fields=id,name&sort=name", {
      // Bir günlük cache — il listesi neredeyse hiç değişmiyor
      next: { revalidate: 86400 },
    });
    if (!res.ok) throw new Error(`TurkiyeAPI ${res.status}`);
    const data = await res.json();
    return Response.json({ success: true, provinces: data.data || [] });
  } catch (error) {
    return Response.json({ success: false, provinces: [], error: (error as Error).message }, { status: 500 });
  }
}