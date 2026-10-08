export function getProductColorClass(color: string) {
  const normalizedColor = color
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")

  if (normalizedColor.includes("borravino") || normalizedColor.includes("bordo") || normalizedColor.includes("bordeaux") || normalizedColor.includes("vino") || normalizedColor.includes("granate")) return "bg-[#7f1d32]"
  if (normalizedColor.includes("marron") || normalizedColor.includes("chocolate") || normalizedColor.includes("camel")) return "bg-[#6b4428]"
  if (normalizedColor.includes("beige") || normalizedColor.includes("crema") || normalizedColor.includes("marfil")) return "bg-[#e8d7bd]"
  if (normalizedColor.includes("negro") || normalizedColor.includes("carbon") || normalizedColor.includes("grafito")) return "bg-[#1f2937]"
  if (normalizedColor.includes("blanco") || normalizedColor.includes("natural")) return "bg-white"
  if (normalizedColor.includes("gris") || normalizedColor.includes("plomo")) return "bg-gray-500"
  if (normalizedColor.includes("plateado") || normalizedColor.includes("plata")) return "bg-gray-300"
  if (normalizedColor.includes("rojo") || normalizedColor.includes("coral")) return "bg-red-600"
  if (normalizedColor.includes("naranja") || normalizedColor.includes("terracota")) return "bg-orange-500"
  if (normalizedColor.includes("amarillo") || normalizedColor.includes("mostaza")) return "bg-yellow-400"
  if (normalizedColor.includes("dorado") || normalizedColor.includes("oro")) return "bg-amber-500"
  if (normalizedColor.includes("verde oliva") || normalizedColor.includes("oliva")) return "bg-[#708238]"
  if (normalizedColor.includes("verde oscuro") || normalizedColor.includes("verde botella") || normalizedColor.includes("esmeralda")) return "bg-emerald-800"
  if (normalizedColor.includes("verde claro") || normalizedColor.includes("menta")) return "bg-emerald-300"
  if (normalizedColor.includes("verde")) return "bg-green-600"
  if (normalizedColor.includes("azul marino") || normalizedColor.includes("azul navy") || normalizedColor.includes("azul oscuro")) return "bg-blue-950"
  if (normalizedColor.includes("azul claro") || normalizedColor.includes("celeste")) return "bg-sky-300"
  if (normalizedColor.includes("turquesa") || normalizedColor.includes("aqua")) return "bg-teal-400"
  if (normalizedColor.includes("azul")) return "bg-blue-600"
  if (normalizedColor.includes("violeta") || normalizedColor.includes("morado") || normalizedColor.includes("purpura") || normalizedColor.includes("lila")) return "bg-violet-600"
  if (normalizedColor.includes("rosa") || normalizedColor.includes("rosado")) return "bg-pink-400"
  return "bg-muted"
}
