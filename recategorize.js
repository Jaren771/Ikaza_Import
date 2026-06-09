const fs = require('fs');

const data = JSON.parse(fs.readFileSync('prisma/seed-reales.json', 'utf8'));

const CATEGORY_MAP = {
  // Belleza y Cuidado Personal
  "labial": { cat: "cat-belleza-y-cuidado-personal", sub: "maquillaje" },
  "gloss": { cat: "cat-belleza-y-cuidado-personal", sub: "maquillaje" },
  "rimel": { cat: "cat-belleza-y-cuidado-personal", sub: "maquillaje" },
  "sombras": { cat: "cat-belleza-y-cuidado-personal", sub: "maquillaje" },
  "rubor": { cat: "cat-belleza-y-cuidado-personal", sub: "maquillaje" },
  "polvo": { cat: "cat-belleza-y-cuidado-personal", sub: "maquillaje" },
  "delineador": { cat: "cat-belleza-y-cuidado-personal", sub: "maquillaje" },
  "pestañas": { cat: "cat-belleza-y-cuidado-personal", sub: "accesorios-belleza" },
  "brocha": { cat: "cat-belleza-y-cuidado-personal", sub: "accesorios-belleza" },
  "plancha": { cat: "cat-belleza-y-cuidado-personal", sub: "accesorios-belleza" },
  
  // Vestimenta
  "vestido": { cat: "cat-vestimenta", sub: "ropa-mujer" },
  "blusa": { cat: "cat-vestimenta", sub: "ropa-mujer" },
  "falda": { cat: "cat-vestimenta", sub: "ropa-mujer" },
  "tops": { cat: "cat-vestimenta", sub: "ropa-mujer" },
  "polo": { cat: "cat-vestimenta", sub: "ropa-hombre" },
  "camisa": { cat: "cat-vestimenta", sub: "ropa-hombre" },
  "conjunto": { cat: "cat-vestimenta", sub: "ropa-mujer" },
  "saco": { cat: "cat-vestimenta", sub: "ropa-mujer" },
  "casaca": { cat: "cat-vestimenta", sub: "ropa-infantil" },
  "pantalon": { cat: "cat-vestimenta", sub: "ropa-mujer" },
  "chullo": { cat: "cat-vestimenta", sub: "accesorios-ropa" },
  "chalina": { cat: "cat-vestimenta", sub: "accesorios-ropa" },
  "medias": { cat: "cat-vestimenta", sub: "accesorios-ropa" },
  "mochila": { cat: "cat-vestimenta", sub: "accesorios-ropa" },
  "orejeras": { cat: "cat-vestimenta", sub: "accesorios-ropa" },
  "goroo": { cat: "cat-vestimenta", sub: "accesorios-ropa" },
  "gorro": { cat: "cat-vestimenta", sub: "accesorios-ropa" },
  "guantes": { cat: "cat-vestimenta", sub: "accesorios-ropa" },
  "faja": { cat: "cat-vestimenta", sub: "accesorios-ropa" },
  "bolso": { cat: "cat-vestimenta", sub: "accesorios-ropa" },
  
  // Juguetes y Juegos
  "peluche": { cat: "cat-juguetes-y-juegos", sub: "peluches" },
  "oso": { cat: "cat-juguetes-y-juegos", sub: "peluches" },
  "cerdito": { cat: "cat-juguetes-y-juegos", sub: "peluches" },
  "ajedrez": { cat: "cat-juguetes-y-juegos", sub: "didacticos" },
  "burbuja": { cat: "cat-juguetes-y-juegos", sub: "diversion" },
  "cometa": { cat: "cat-juguetes-y-juegos", sub: "diversion" },
  "carro": { cat: "cat-juguetes-y-juegos", sub: "didacticos" },
  "truck": { cat: "cat-juguetes-y-juegos", sub: "didacticos" },
  "juegos": { cat: "cat-juguetes-y-juegos", sub: "didacticos" },
  
  // Regalos y Celebraciones
  "día del padre": { cat: "cat-regalos-y-celebraciones", sub: "dia-del-padre" },
  "bolsa de regalo": { cat: "cat-regalos-y-celebraciones", sub: "fiestas" },
  "cumpleaños": { cat: "cat-regalos-y-celebraciones", sub: "fiestas" },
  "bombonera": { cat: "cat-regalos-y-celebraciones", sub: "fiestas" },
  
  // Hogar
  "sabana": { cat: "cat-hogar", sub: "dormitorio" },
  "edredón": { cat: "cat-hogar", sub: "dormitorio" },
  "manta": { cat: "cat-hogar", sub: "dormitorio" },
  "ducha": { cat: "cat-hogar", sub: "bano" },
  "bañera": { cat: "cat-hogar", sub: "bano" },
  "lavavajilla": { cat: "cat-hogar", sub: "limpieza" },
  "quitasarro": { cat: "cat-hogar", sub: "limpieza" },
  "trapeador": { cat: "cat-hogar", sub: "limpieza" },
  "limpiatodo": { cat: "cat-hogar", sub: "limpieza" },
  "pinesol": { cat: "cat-hogar", sub: "limpieza" },
  "zapatera": { cat: "cat-hogar", sub: "organizacion" },
  "organizador": { cat: "cat-hogar", sub: "organizacion" },
  "perchero": { cat: "cat-hogar", sub: "organizacion" },
  "estante": { cat: "cat-hogar", sub: "organizacion" },
  
  // Cocina
  "sartén": { cat: "cat-cocina", sub: "utensilios" },
  "fuente": { cat: "cat-cocina", sub: "utensilios" },
  "plato": { cat: "cat-cocina", sub: "utensilios" },
  "utensilio": { cat: "cat-cocina", sub: "utensilios" },
  "tijera": { cat: "cat-cocina", sub: "utensilios" },
  "batidora": { cat: "cat-cocina", sub: "electrodomesticos" },
  "hervidor": { cat: "cat-cocina", sub: "electrodomesticos" },
  "condimentero": { cat: "cat-cocina", sub: "almacenamiento-cocina" },
  "táper": { cat: "cat-cocina", sub: "almacenamiento-cocina" },
  
  // Tecnología
  "audifono": { cat: "cat-tecnologia", sub: "audio" },
  "parlante": { cat: "cat-tecnologia", sub: "audio" },
  "cable": { cat: "cat-tecnologia", sub: "accesorios-tech" },
  "celular": { cat: "cat-tecnologia", sub: "accesorios-tech" },
  "reloj": { cat: "cat-tecnologia", sub: "accesorios-tech" },
  "aspiradora": { cat: "cat-tecnologia", sub: "accesorios-tech" },
  "lampara": { cat: "cat-tecnologia", sub: "iluminacion" },
  "foco": { cat: "cat-tecnologia", sub: "iluminacion" },
  
  // Decoración
  "cuadro": { cat: "cat-decoracion", sub: "cuadros" },
  "portafoto": { cat: "cat-decoracion", sub: "cuadros" },
  "flor": { cat: "cat-decoracion", sub: "plantas-artificiales" },
  "espejo": { cat: "cat-decoracion", sub: "adornos" },
  "pegatina": { cat: "cat-decoracion", sub: "adornos" },
  "tapiz": { cat: "cat-decoracion", sub: "adornos" },
  "bola": { cat: "cat-decoracion", sub: "adornos" },
  "joyero": { cat: "cat-decoracion", sub: "adornos" },
  
  // Arte y Manualidades
  "compás": { cat: "cat-arte-y-manualidades", sub: "utiles" },
  "papel": { cat: "cat-arte-y-manualidades", sub: "utiles" },
  "marcador": { cat: "cat-arte-y-manualidades", sub: "utiles" },
  "sticker": { cat: "cat-arte-y-manualidades", sub: "manualidades" },
  "cinta": { cat: "cat-arte-y-manualidades", sub: "manualidades" },
  "arte": { cat: "cat-arte-y-manualidades", sub: "manualidades" }
};

data.forEach(product => {
  const name = product.name.toLowerCase();
  let matched = false;
  
  for (const [key, mapping] of Object.entries(CATEGORY_MAP)) {
    if (name.includes(key)) {
      product.categoryId = mapping.cat;
      product.subcategoryId = mapping.sub; 
      matched = true;
      break;
    }
  }
  
  if (!matched) {
    if (name.includes("bolsa de compra")) {
      product.categoryId = "cat-hogar";
      product.subcategoryId = "organizacion";
    } else if (name.includes("chocolate")) {
      product.categoryId = "cat-regalos-y-celebraciones";
      product.subcategoryId = "dia-del-padre";
    } else {
      product.categoryId = "cat-hogar";
      product.subcategoryId = "sala";
    }
  }
});

fs.writeFileSync('prisma/seed-reales.json', JSON.stringify(data, null, 2));
console.log("Re-categorization complete.");
