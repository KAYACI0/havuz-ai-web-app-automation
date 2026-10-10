import { getAllProvinces } from "turkey-location-data";

export const dynamic = "force-static";

export async function GET() {
  const provinces = getAllProvinces()
    .map((p) => ({ id: p.apiId, name: p.name }))
    .sort((a, b) => a.name.localeCompare(b.name, "tr"));
  return Response.json({ provinces });
}
