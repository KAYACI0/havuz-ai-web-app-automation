import fs from "node:fs";
import * as pkg from "turkey-location-data";

const lib = pkg.getAllProvinces ? pkg : pkg.default;
const provinces = lib.getAllProvinces()
  .map((p) => ({ id: p.apiId, name: p.name }))
  .sort((a, b) => a.name.localeCompare(b.name, "tr"));

const districts = {};
for (const p of provinces) {
  districts[p.id] = (lib.getDistrictsByProvinceApiId(p.id) ?? [])
    .map((d) => ({ id: d.apiId, name: d.name }))
    .sort((a, b) => a.name.localeCompare(b.name, "tr"));
}

fs.mkdirSync("lib", { recursive: true });
fs.writeFileSync("lib/geo-data.json", JSON.stringify({ provinces, districts }));
console.log(provinces.length, "il,", Object.values(districts).flat().length, "ilçe yazıldı");
