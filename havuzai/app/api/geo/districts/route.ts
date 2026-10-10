import geo from "@/lib/geo-data.json";

const districtsByProvince = geo.districts as Record<string, { id: number; name: string }[]>;

export async function GET(request: Request) {
  const provinceId = new URL(request.url).searchParams.get("provinceId") ?? "";
  return Response.json({ districts: districtsByProvince[provinceId] ?? [] });
}
