import { getDistrictsByProvinceApiId } from "turkey-location-data";

export async function GET(request: Request) {
  const provinceId = Number(new URL(request.url).searchParams.get("provinceId"));

  if (!Number.isInteger(provinceId) || provinceId < 1) {
    return Response.json({ districts: [] }, { status: 400 });
  }

  const districts = (getDistrictsByProvinceApiId(provinceId) ?? [])
    .map((d) => ({ id: d.apiId, name: d.name }))
    .sort((a, b) => a.name.localeCompare(b.name, "tr"));

  return Response.json({ districts });
}
