type GeocodingAddress = Record<string, unknown>;
type GeocodingResult = { address?: GeocodingAddress };

function firstAddressPart(address: GeocodingAddress, keys: string[]): string {
  for (const key of keys) {
    const value = address[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  if (query.length < 5 || query.length > 200) {
    return Response.json({ error: "Alamat harus berisi 5–200 karakter." }, { status: 400 });
  }

  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("countrycodes", "id");
  url.searchParams.set("limit", "1");
  url.searchParams.set("accept-language", "id");
  url.searchParams.set("q", query);

  try {
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "TEDUHI/1.0 (mailto:support@teduhi.id)",
      },
      next: { revalidate: 60 * 60 * 24 },
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) {
      return Response.json({ error: "Layanan pencarian alamat sedang tidak tersedia." }, { status: 502 });
    }

    const results = await response.json() as GeocodingResult[];
    const address = results[0]?.address;
    if (!address) return Response.json({ province: "", city: "", district: "" });

    const province = firstAddressPart(address, ["state", "province", "region"]);
    const county = firstAddressPart(address, ["county"]);
    const countyIsDistrict = /^(kecamatan|kec\.?)(\s|$)/i.test(county);
    const city = firstAddressPart(address, ["city", "state_district"])
      || (countyIsDistrict ? "" : county)
      || firstAddressPart(address, ["municipality", "town", "village"]);
    const municipality = firstAddressPart(address, ["municipality"]);
    const district = firstAddressPart(address, ["city_district", "district"])
      || (countyIsDistrict ? county : "")
      || (municipality !== city ? municipality : "")
      || firstAddressPart(address, ["suburb", "borough"]);

    return Response.json({ province, city, district });
  } catch {
    return Response.json({ error: "Alamat gagal dicari. Periksa koneksi atau isi wilayah secara manual." }, { status: 502 });
  }
}
