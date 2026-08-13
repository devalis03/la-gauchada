import type { Product } from "./types"

export const initialProducts: Product[] = [
  // PROMOS
  { id: "promo-001", name: "CRIOLLO + BOMBILLA + YERBERO", description: "Kit promocional con mate criollo, bombilla y yerbero.", price: 32000, image: "/images/kit-matero.jpg", category: "promos", stock: 10 },
  { id: "promo-002", name: "CAMIONERO + BOMBILLA + YERBERO", description: "Kit promocional con mate camionero, bombilla y yerbero.", price: 42000, image: "/images/kit-matero.jpg", category: "promos", stock: 10 },
  { id: "promo-003", name: "IMPERIAL + BOMBILLA + YERBERO", description: "Kit promocional con mate imperial, bombilla y yerbero.", price: 52000, image: "/images/kit-matero.jpg", category: "promos", stock: 10 },
  { id: "promo-004", name: "COMBO SOL DE MAYO", description: "Mate Sol de Mayo + Yerbero Grabado + Bombilla", price: 58000, image: "/images/kit-matero.jpg", category: "promos", stock: 10 },
  { id: "promo-005", name: "CRIOLLO + BOMBILLA + TERMO", description: "Kit promocional con mate criollo, bombilla y termo.", price: 44000, image: "/images/kit-matero.jpg", category: "promos", stock: 10 },
  { id: "promo-006", name: "CAMIONERO + BOMBILLA + TERMO", description: "Kit promocional con mate camionero, bombilla y termo.", price: 54000, image: "/images/kit-matero.jpg", category: "promos", stock: 10 },
  { id: "promo-007", name: "IMPERIAL + BOMBILLA + TERMO", description: "Kit promocional con mate imperial, bombilla y termo.", price: 64000, image: "/images/kit-matero.jpg", category: "promos", stock: 10 },
  { id: "promo-008", name: "RANCHERO + BOMBILLA + TERMO", description: "Kit promocional con mate ranchero, bombilla y termo.", price: 68500, image: "/images/kit-matero.jpg", category: "promos", stock: 10 },

  // MATES IMPERIALES
  { id: "mate-006", name: "IMPERIAL", description: "Virola de Alpaca Cincelada y Lisa", price: 38000, image: "/images/mate-madera.jpg", category: "mates", subcategory: "mates-imperiales", stock: 10 },
  { id: "mate-002", name: "IMPERIAL CUERO CRUDO", description: "Virola de Alpaca", price: 0, image: "/images/mate-madera.jpg", category: "mates", subcategory: "mates-imperiales", stock: 0 },
  { id: "mate-008", name: "IMPERIAL ALGARROBO", description: "Premium Virola de Alpaca", price: 40000, image: "/images/mate-madera.jpg", category: "mates", subcategory: "mates-imperiales", stock: 10 },
  { id: "mate-011", name: "IMPERIAL ALGARROBO", description: "Virola de Acero Inoxidable", price: 14000, image: "/images/mate-madera.jpg", category: "mates", subcategory: "mates-imperiales", stock: 10 },

  // MATES TRADICIONALES
  { id: "mate-001", name: "SOL DE MAYO", description: "Mate de Algarrobo Chapeado con el Sol", price: 40000, image: "/images/mate-madera.jpg", category: "mates", subcategory: "mates-tradicionales", stock: 10 },
  { id: "mate-004", name: "RANCHERO", description: "Madera Maciza de Algarrobo", price: 42500, image: "/images/mate-madera.jpg", category: "mates", subcategory: "mates-tradicionales", stock: 10 },
  { id: "mate-005", name: "CAMIONERO", description: "Virola de Acero", price: 27000, image: "/images/mate-madera.jpg", category: "mates", subcategory: "mates-tradicionales", stock: 10 },
  { id: "mate-009", name: "CRIOLLO", description: "Mate Calabaza con Base de Cuero Coquito/SP", price: 16000, image: "/images/mate-madera.jpg", category: "mates", subcategory: "mates-tradicionales", stock: 10 },
  { id: "mate-010", name: "CAMIONERO ALGARROBO", description: "Virola de Acero Inoxidable", price: 14000, image: "/images/mate-madera.jpg", category: "mates", subcategory: "mates-tradicionales", stock: 10 },

  // MATES TORPEDOS
  { id: "mate-007", name: "TORPEDO", description: "Virola de Acero", price: 27000, image: "/images/mate-madera.jpg", category: "mates", subcategory: "mates-torpedos", stock: 10 },
  { id: "mate-003", name: "TORPEDO CUERO CRUDO", description: "Virola de Alpaca", price: 40000, image: "/images/mate-madera.jpg", category: "mates", subcategory: "mates-torpedos", stock: 10 },

  // MATERAS
  { id: "matera-001", name: "MORRAL MARRON", description: "Bandolera Matera de Cuero", price: 85000, image: "/images/bolsa-matera.jpg", category: "materas", stock: 10 },
  { id: "matera-002", name: "MORRAL NEGRO", description: "Bandolera Matera de Cuero", price: 85000, image: "/images/bolsa-matera.jpg", category: "materas", stock: 10 },
  { id: "matera-003", name: "CANASTA", description: "Canasta Cuadra de Cuero 4x4", price: 0, image: "/images/bolsa-matera.jpg", category: "materas", stock: 0 },
  { id: "matera-004", name: "PATAGONIA", description: "Matera de Tela con Cierre y Detalles de Cuero", price: 65000, image: "/images/bolsa-matera.jpg", category: "materas", stock: 10 },

  // YERBEROS
  { id: "yerbero-001", name: "GAMUZADO MARRON", description: "Yerbero de Cuero con Capacidad de 500g", price: 13000, image: "/images/yerbera-cuero.jpg", category: "yerberos", stock: 10 },
  { id: "yerbero-002", name: "GAMUZADO BEIGE", description: "Yerbero de Cuero con Capacidad de 500g", price: 13000, image: "/images/yerbera-cuero.jpg", category: "yerberos", stock: 10 },
  { id: "yerbero-003", name: "GAMUZADO VERDE", description: "Yerbero de Cuero con Capacidad de 500g", price: 13000, image: "/images/yerbera-cuero.jpg", category: "yerberos", stock: 10 },
  { id: "yerbero-004", name: "GAMUZADO CON BASE", description: "Yerbero de Cuero con Capacidad de 500g", price: 13000, image: "/images/yerbera-cuero.jpg", category: "yerberos", stock: 10 },

  // SOMBREROS
  { id: "sombrero-001", name: "SOMBRERO NORTEÑO", description: "Ala 10\"", price: 65000, image: "/images/sombrero.jpg", category: "otros", stock: 10 },
  { id: "sombrero-002", name: "SOMBRERO AUSTRALIANO", description: "Cuero Engrasado", price: 65000, image: "/images/sombrero.jpg", category: "otros", stock: 10 },

  // PONCHOS
  { id: "poncho-001", name: "PONCHO PESADO", description: "Guarda Lisa", price: 79000, image: "/images/poncho.jpg", category: "otros", stock: 10 },
  { id: "poncho-002", name: "PONCHO PESADO", description: "Guarda Incaica", price: 79000, image: "/images/poncho.jpg", category: "otros", stock: 10 },

  // BOINAS
  { id: "boina-001", name: "TOLOSA DE HILO", description: "Tolosa Tupida. Colores: Beige, Bordo, Gris", price: 35000, image: "/images/boina.jpg", category: "otros", stock: 10 },
  { id: "boina-002", name: "ESPINOSA DE PAÑO", description: "Colores Azul, Verde, Bordo", price: 40000, image: "/images/boina.jpg", category: "otros", stock: 10 },
  { id: "boina-003", name: "ECONOMICA DE HILO", description: "Colores Azul, Bordo", price: 10000, image: "/images/boina.jpg", category: "otros", stock: 10 },

  // TERMOS
  { id: "termo-001", name: "MEDIA MANIJA", description: "Termo media manija clásico.", price: 25000, image: "/images/termo-stanley.jpg", category: "termos", stock: 10 },
  { id: "termo-002", name: "TERMOLAR NEGRO", description: "Termo Termolar color negro.", price: 80000, image: "/images/termo-stanley.jpg", category: "termos", stock: 10 },
  { id: "termo-003", name: "STANLEY ORIGINAL", description: "Termo Stanley original, alta calidad.", price: 125000, image: "/images/termo-stanley.jpg", category: "termos", stock: 10 },
  { id: "termo-004", name: "OPCIONES GRABADAS", description: "Personalizadas en Termos", price: 5000, image: "/images/termo-stanley.jpg", category: "termos", stock: 10 },

  // BOMBILLAS
  { id: "bombilla-001", name: "PICO DE ORO", description: "Bombilla de Acero Inoxidable Tamaño Pequeño y Grande ($5.500 PROMO CON MATE)", price: 6500, image: "/images/bombilla-alpaca.jpg", category: "bombillas", stock: 10 },
  { id: "bombilla-002", name: "PICO DE ORO DORADA", description: "Bombilla de Acero Inoxidable Tamaño Pequeño y Grande ($5.500 PROMO CON MATE)", price: 6500, image: "/images/bombilla-alpaca.jpg", category: "bombillas", stock: 10 },
  { id: "bombilla-003", name: "BOMBILLO PICO DE REY", description: "Bombillo de Alpaca Liso", price: 10000, image: "/images/bombilla-alpaca.jpg", category: "bombillas", stock: 10 },

  // OTROS
  { id: "otro-001", name: "GRABADOS", description: "Virolas, Calabazas, Cueros, Termos, Bombillas, Yerberos. DONDE QUIERAS ($5.000 x1  $4.000 x2  $3.000 x3)", price: 5000, image: "/images/otros.jpg", category: "otros", stock: 10 },
  { id: "otro-002", name: "PORTAMATES", description: "De Cuero. Sirve para transportar en la caja de cambio del auto", price: 15000, image: "/images/otros.jpg", category: "otros", stock: 10 },
  { id: "otro-003", name: "DESPOLVILLADORES", description: "Para quitar el polvillo de la yerba", price: 15000, image: "/images/otros.jpg", category: "otros", stock: 10 },
  { id: "otro-004", name: "TABLA DE ASADO", description: "Tabla de madera para asado.", price: 40000, image: "/images/otros.jpg", category: "otros", stock: 10 }
];