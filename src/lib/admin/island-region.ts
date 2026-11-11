export const INDONESIAN_ISLANDS = ["Sumatra", "Kalimantan", "Sulawesi", "Jawa", "Papua"] as const;

export type IndonesianIsland = (typeof INDONESIAN_ISLANDS)[number];

const ISLAND_REGION_PATTERNS: Record<IndonesianIsland, RegExp> = {
  Sumatra: /\b(sumatra|sumatera|aceh|lampung|bengkulu|jambi|riau|kepri|kepulauan riau|bangka belitung)\b/i,
  Kalimantan: /\b(kalimantan|pontianak|banjarmasin|samarinda|palangka raya|palangkaraya|tarakan|ketapang|kapuas|kota baru|kotabaru)\b/i,
  Sulawesi: /\b(sulawesi|makassar|manado|gorontalo|palu|kendari|mamuju|bugis|minahasa)\b/i,
  Jawa: /\b(jawa|jakarta|banten|serang|tangerang|bogor|depok|bekasi|bandung|garut|semarang|surakarta|yogyakarta|surabaya|malang|kediri|madiun|cirebon|tegal|cilacap|purwokerto|pekalongan|jepara|ponorogo)\b/i,
  Papua: /\b(papua|jayapura|merauke|sorong|manokwari|nabire|timika|biak|fakfak|mimika|keerom)\b/i,
};

export function getIndonesianIsland(location: string): IndonesianIsland | undefined {
  return INDONESIAN_ISLANDS.find((island) => ISLAND_REGION_PATTERNS[island].test(location));
}