export type ProductColorFamily = "neutros" | "tierra" | "verdes" | "grises" | "rojos" | "violetas" | "azules" | "amarillos" | "especiales"

export interface ProductColorDefinition {
  id: string
  name: string
  family: ProductColorFamily
  hex: string
  aliases?: string[]
}

type ColorEntry = [name: string, hex: string, aliases?: string[]]

export function normalizeColorName(value: string) {
  return value.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[-_]+/g, " ").replace(/\s+/g, " ")
}

function defineColors(family: ProductColorFamily, entries: ColorEntry[]): ProductColorDefinition[] {
  return entries.map(([name, hex, aliases]) => ({ id: normalizeColorName(name).replace(/ /g, "-"), name, family, hex, aliases }))
}

export const PRODUCT_COLORS: ProductColorDefinition[] = [
  ...defineColors("neutros", [
    ["Blanco", "#ffffff"], ["Blanco roto", "#f7f4ed"], ["Crudo", "#eee4d0"], ["Natural", "#d8b98a"], ["Marfil", "#fff4d6"], ["Hueso", "#e8dfc8"], ["Crema", "#f4e4c1"], ["Perla", "#e8e4dc"], ["Beige", "#d8c3a5", ["beis"]], ["Beige claro", "#eadcc8"], ["Beige oscuro", "#b59a78"], ["Arena", "#cbb994"], ["Champagne", "#f1dfb8"], ["Visón", "#a99a88"], ["Nude", "#e3bda5"], ["Tiza", "#f1eee5"],
  ]),
  ...defineColors("tierra", [
    ["Suela", "#a9673f"], ["Cuero natural", "#a66a3f"], ["Cuero claro", "#c58a5b"], ["Cuero oscuro", "#68402d"], ["Habano", "#9b6b43"], ["Camel", "#b88958"], ["Caramelo", "#b97845"], ["Tostado", "#9a6545"], ["Marrón", "#795548", ["marron"]], ["Marrón claro", "#a98262"], ["Marrón oscuro", "#4e342e"], ["Chocolate", "#482818"], ["Café", "#6f4e37"], ["Café con leche", "#a8896b"], ["Canela", "#9b552f"], ["Tabaco", "#704214"], ["Terracota", "#c45d3a"], ["Ladrillo", "#a84332"], ["Óxido", "#a94b26"], ["Cognac", "#9a4f2f"], ["Siena", "#a0522d"], ["Taupe", "#8b7d6b"], ["Avellana", "#b0835a"], ["Miel", "#d39b42"],
  ]),
  ...defineColors("verdes", [
    ["Verde", "#2f7d32"], ["Verde claro", "#72b878"], ["Verde oscuro", "#1b4d25"], ["Verde seco", "#7d8b62"], ["Verde oliva", "#708238", ["verde oliba"]], ["Verde militar", "#4b5320"], ["Verde musgo", "#536b35"], ["Verde bosque", "#14532d"], ["Verde botella", "#075e3f"], ["Verde salvia", "#9caf88"], ["Verde menta", "#98d8b0"], ["Verde agua", "#8edbd0"], ["Verde esmeralda", "#168a5b"], ["Verde inglés", "#1f5f4a"], ["Caqui", "#78866b", ["khaki"]], ["Verde petróleo", "#176b6b"], ["Verde manzana", "#8db600"], ["Verde lima", "#84cc16"], ["Verde jade", "#00a86b"], ["Verde pastel", "#b7d7a8"],
  ]),
  ...defineColors("grises", [
    ["Negro", "#111111"], ["Negro mate", "#242424"], ["Carbón", "#36454f"], ["Grafito", "#41424c"], ["Antracita", "#293133"], ["Gris", "#808080"], ["Gris claro", "#c5c6c7"], ["Gris oscuro", "#4a4a4a"], ["Gris melange", "#969696"], ["Gris cemento", "#8d8d85"], ["Gris topo", "#77716b"], ["Gris humo", "#b6b6b4"], ["Acero", "#71797e"], ["Acero inoxidable", "#b7c3c8"], ["Plateado", "#c0c0c0"], ["Dorado", "#d4af37"], ["Bronce", "#cd7f32"], ["Cobre", "#b87333"], ["Oro rosa", "#b76e79"],
  ]),
  ...defineColors("rojos", [
    ["Rojo", "#d62828"], ["Rojo oscuro", "#8b1e1e"], ["Rojo ladrillo", "#a84332"], ["Bordó", "#7f1d32", ["bordo", "bordeaux", "borravino"]], ["Vino", "#722f37"], ["Borgoña", "#800020"], ["Granate", "#8b0000"], ["Cereza", "#b5122d"], ["Rosa", "#e7799d"], ["Rosa claro", "#f4b6c2"], ["Rosa pastel", "#f6c6d2"], ["Rosa bebé", "#f7c8d0"], ["Rosa viejo", "#c08081"], ["Rosa palo", "#d8a9a9"], ["Rosa chicle", "#f48fb1"], ["Fucsia", "#d946a8", ["fuxia"]], ["Coral", "#ff7f50"], ["Salmón", "#fa8072"],
  ]),
  ...defineColors("violetas", [["Lila", "#c8a2c8"], ["Lavanda", "#b57edc"], ["Malva", "#b784a7"], ["Violeta", "#7f00ff"], ["Morado", "#800080"], ["Púrpura", "#6a0dad"], ["Ciruela", "#8e4585"]]),
  ...defineColors("azules", [
    ["Azul", "#2563eb"], ["Azul claro", "#60a5fa"], ["Azul oscuro", "#1e3a8a"], ["Azul marino", "#001f3f", ["navy"]], ["Azul noche", "#101a3a"], ["Azul petróleo", "#075985"], ["Azul Francia", "#318ce7"], ["Azul eléctrico", "#0066ff"], ["Azul rey", "#4169e1"], ["Azul acero", "#4682b4"], ["Azul pastel", "#aec6cf"], ["Azul denim", "#1560bd"], ["Celeste", "#87ceeb"], ["Celeste bebé", "#bde0fe"], ["Turquesa", "#2dd4bf"], ["Aguamarina", "#7fffd4"], ["Cian", "#00ffff"],
  ]),
  ...defineColors("amarillos", [
    ["Amarillo", "#facc15"], ["Amarillo pastel", "#fdfd96"], ["Amarillo mostaza", "#d4a017"], ["Amarillo limón", "#fff44f"], ["Ocre", "#cc7722"], ["Naranja", "#f97316"], ["Naranja pastel", "#ffb07c"], ["Naranja quemado", "#cc5500"], ["Mandarina", "#f28500"], ["Durazno", "#ffcba4"], ["Damasco", "#fbceb1"], ["Ámbar", "#ffbf00"],
  ]),
  ...defineColors("especiales", [["Transparente", "#e9f7ff"], ["Cristal", "#dff6ff"], ["Multicolor", "#ffffff"], ["Arcoíris", "#ffffff"], ["Marmolado", "#d9d4cf"], ["Tornasolado", "#b9a7d8"], ["Degradado", "#9ad7e8"], ["Madera natural", "#b9824b"], ["Madera clara", "#d2a679"], ["Madera oscura", "#6f4e37"]]),
]

const COLOR_BY_NORMALIZED_NAME = new Map<string, ProductColorDefinition>()
for (const color of PRODUCT_COLORS) {
  COLOR_BY_NORMALIZED_NAME.set(normalizeColorName(color.name), color)
  for (const alias of color.aliases ?? []) COLOR_BY_NORMALIZED_NAME.set(normalizeColorName(alias), color)
}

export function findProductColor(value: string) {
  return COLOR_BY_NORMALIZED_NAME.get(normalizeColorName(value))
}

function levenshtein(first: string, second: string) {
  const row = Array.from({ length: second.length + 1 }, (_, index) => index)
  for (let firstIndex = 1; firstIndex <= first.length; firstIndex++) {
    let previous = row[0]
    row[0] = firstIndex
    for (let secondIndex = 1; secondIndex <= second.length; secondIndex++) {
      const current = row[secondIndex]
      row[secondIndex] = Math.min(row[secondIndex] + 1, row[secondIndex - 1] + 1, previous + (first[firstIndex - 1] === second[secondIndex - 1] ? 0 : 1))
      previous = current
    }
  }
  return row[second.length]
}

export function suggestProductColors(value: string, limit = 5) {
  const query = normalizeColorName(value)
  if (!query) return []
  const familyWord = query.split(" ")[0]
  const family = PRODUCT_COLORS.find((color) => normalizeColorName(color.name).startsWith(familyWord))?.family
  return PRODUCT_COLORS.map((color) => {
    const normalizedName = normalizeColorName(color.name)
    const distance = levenshtein(query, normalizedName)
    const score = (family && color.family === family ? 35 : 0) + (normalizedName.startsWith(familyWord) ? 20 : 0) - distance * 3
    return { color, score, distance }
  }).filter(({ distance, score }) => score > 0 && distance <= Math.max(4, Math.ceil(query.length * 0.45))).sort((a, b) => b.score - a.score || a.distance - b.distance).slice(0, limit).map(({ color }) => color)
}

export function formatProductColor(value: string) {
  return findProductColor(value)?.name ?? value.trim().replace(/\b\w/g, (letter) => letter.toUpperCase())
}

export function getProductColorHex(value: string, customColors: Record<string, string> = {}) {
  return customColors[value] ?? findProductColor(value)?.hex ?? "#d1d5db"
}

export function getProductColorStyle(value: string, customColors: Record<string, string> = {}) {
  const normalized = normalizeColorName(value)
  if (normalized === "multicolor" || normalized === "arcoiris") return { background: "linear-gradient(135deg, #ef4444, #facc15, #22c55e, #3b82f6, #a855f7)" }
  if (normalized === "marmolado") return { background: "linear-gradient(135deg, #f5f5f4 20%, #78716c 45%, #e7e5e4 60%, #57534e 80%)" }
  if (normalized === "tornasolado") return { background: "linear-gradient(135deg, #f9a8d4, #93c5fd, #86efac, #fde68a)" }
  if (normalized === "degradado") return { background: "linear-gradient(135deg, #60a5fa, #c084fc)" }
  if (normalized === "transparente" || normalized === "cristal") return { backgroundColor: getProductColorHex(value, customColors), backgroundImage: "linear-gradient(135deg, transparent 40%, rgba(255,255,255,.8) 41%, transparent 52%)" }
  return { backgroundColor: getProductColorHex(value, customColors) }
}

export function getProductColorClass(value: string) {
  const normalized = normalizeColorName(value)
  if (normalized === "blanco" || normalized === "blanco roto" || normalized === "tiza") return "bg-white"
  if (normalized.startsWith("negro") || normalized.includes("carbon") || normalized.includes("grafito")) return "bg-gray-900"
  if (normalized.startsWith("rojo") || normalized.includes("bordo") || normalized.includes("borgona")) return "bg-red-700"
  if (normalized.startsWith("verde")) return "bg-green-600"
  if (normalized.startsWith("azul") || normalized.startsWith("celeste")) return "bg-blue-600"
  if (normalized.startsWith("amarillo")) return "bg-yellow-400"
  if (normalized.startsWith("naranja")) return "bg-orange-500"
  return "bg-muted"
}
