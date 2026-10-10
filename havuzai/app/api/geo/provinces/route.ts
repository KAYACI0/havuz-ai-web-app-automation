import geo from "@/lib/geo-data.json";

export const dynamic = "force-static";

export async function GET() {
  return Response.json({ provinces: geo.provinces });
}
