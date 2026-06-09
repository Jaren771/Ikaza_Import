import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

// =============================================================================
// Seed — Datos de prueba para desarrollo
// Ejecutar: npm run db:seed
// =============================================================================

async function main() {
  console.log("🌱 Iniciando seed de la base de datos...");

  // =========================================================================
  // LIMPIAR DATOS EXISTENTES (solo en desarrollo)
  // =========================================================================
  if (process.env.NODE_ENV !== "production") {
    await prisma.cartItem.deleteMany();
    await prisma.cart.deleteMany();
    await prisma.wishlistItem.deleteMany();
    await prisma.wishlist.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.payment.deleteMany();
    await prisma.order.deleteMany();
    await prisma.inventoryMovement.deleteMany();
    await prisma.inventory.deleteMany();
    await prisma.productImage.deleteMany();
    await prisma.productVariant.deleteMany();
    await prisma.review.deleteMany();
    await prisma.product.deleteMany();
    await prisma.subcategory.deleteMany();
    await prisma.category.deleteMany();
    await prisma.brand.deleteMany();
    await prisma.supplier.deleteMany();
    await prisma.banner.deleteMany();
    await prisma.coupon.deleteMany();
    await prisma.address.deleteMany();
    await prisma.session.deleteMany();
    await prisma.account.deleteMany();
    await prisma.user.deleteMany();
    console.log("✅ Datos anteriores eliminados");
  }

  // =========================================================================
  // USUARIOS
  // =========================================================================
  const adminPassword = await bcrypt.hash("Admin123!", 12);
  const customerPassword = await bcrypt.hash("Customer123!", 12);

  const superAdmin = await prisma.user.create({
    data: {
      name: "Super Administrador",
      email: "superadmin@ikaza.pe",
      password: adminPassword,
      role: "SUPER_ADMIN",
      status: "ACTIVE",
      emailVerified: new Date(),
    },
  });

  const admin = await prisma.user.create({
    data: {
      name: "Administrador ikaZa",
      email: "admin@ikaza.pe",
      password: adminPassword,
      role: "ADMIN",
      status: "ACTIVE",
      emailVerified: new Date(),
    },
  });

  const manager = await prisma.user.create({
    data: {
      name: "Gerente de Importaciones",
      email: "manager@ikaza.pe",
      password: adminPassword,
      role: "MANAGER",
      status: "ACTIVE",
      emailVerified: new Date(),
    },
  });

  const customers = await Promise.all([
    prisma.user.create({
      data: {
        name: "María García López",
        email: "maria@gmail.com",
        password: customerPassword,
        phone: "+51 987 654 321",
        role: "CUSTOMER",
        status: "ACTIVE",
        emailVerified: new Date(),
        cart: { create: {} },
        wishlist: { create: {} },
        addresses: {
          create: {
            firstName: "María",
            lastName: "García",
            street: "Av. Arequipa",
            number: "1234",
            district: "Miraflores",
            city: "Lima",
            state: "Lima",
            country: "PE",
            postalCode: "15074",
            isDefault: true,
            alias: "Casa",
          },
        },
      },
    }),
    prisma.user.create({
      data: {
        name: "Carlos Mendoza Rivas",
        email: "carlos@gmail.com",
        password: customerPassword,
        role: "CUSTOMER",
        status: "ACTIVE",
        emailVerified: new Date(),
        cart: { create: {} },
        wishlist: { create: {} },
      },
    }),
  ]);

  console.log("✅ Usuarios creados");

  // =========================================================================
  // CATEGORÍAS Y SUBCATEGORÍAS
  // =========================================================================
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: "Hogar",
        slug: "hogar",
        description: "Artículos para el hogar",
        sortOrder: 1,
        subcategories: {
          create: [
            { name: "Sala", slug: "sala", sortOrder: 1 },
            { name: "Dormitorio", slug: "dormitorio", sortOrder: 2 },
            { name: "Baño", slug: "bano", sortOrder: 3 },
            { name: "Limpieza", slug: "limpieza", sortOrder: 4 },
            { name: "Organización", slug: "organizacion", sortOrder: 5 },
          ],
        },
      },
    }),
    prisma.category.create({
      data: {
        name: "Cocina",
        slug: "cocina",
        description: "Utensilios y electrodomésticos de cocina",
        sortOrder: 2,
        subcategories: {
          create: [
            { name: "Utensilios", slug: "utensilios", sortOrder: 1 },
            { name: "Electrodomésticos", slug: "electrodomesticos", sortOrder: 2 },
            { name: "Almacenamiento", slug: "almacenamiento-cocina", sortOrder: 3 },
          ],
        },
      },
    }),
    prisma.category.create({
      data: {
        name: "Tecnología",
        slug: "tecnologia",
        description: "Gadgets y accesorios tecnológicos",
        sortOrder: 3,
        subcategories: {
          create: [
            { name: "Audio", slug: "audio", sortOrder: 1 },
            { name: "Accesorios", slug: "accesorios-tech", sortOrder: 2 },
            { name: "Iluminación", slug: "iluminacion", sortOrder: 3 },
          ],
        },
      },
    }),
    prisma.category.create({
      data: {
        name: "Decoración",
        slug: "decoracion",
        description: "Artículos decorativos para el hogar",
        sortOrder: 4,
        subcategories: {
          create: [
            { name: "Cuadros y Portafotos", slug: "cuadros", sortOrder: 1 },
            { name: "Plantas y Flores", slug: "plantas-artificiales", sortOrder: 2 },
            { name: "Adornos", slug: "adornos", sortOrder: 3 },
          ],
        },
      },
    }),
    prisma.category.create({
      data: {
        name: "Vestimenta",
        slug: "vestimenta",
        description: "Ropa y accesorios",
        sortOrder: 5,
        subcategories: {
          create: [
            { name: "Ropa Mujer", slug: "ropa-mujer", sortOrder: 1 },
            { name: "Ropa Hombre", slug: "ropa-hombre", sortOrder: 2 },
            { name: "Ropa Infantil", slug: "ropa-infantil", sortOrder: 3 },
            { name: "Accesorios", slug: "accesorios-ropa", sortOrder: 4 },
          ],
        },
      },
    }),
    prisma.category.create({
      data: {
        name: "Belleza y Cuidado Personal",
        slug: "belleza-y-cuidado-personal",
        description: "Productos de belleza y cosméticos",
        sortOrder: 6,
        subcategories: {
          create: [
            { name: "Maquillaje", slug: "maquillaje", sortOrder: 1 },
            { name: "Accesorios de Belleza", slug: "accesorios-belleza", sortOrder: 2 },
          ],
        },
      },
    }),
    prisma.category.create({
      data: {
        name: "Juguetes y Juegos",
        slug: "juguetes-y-juegos",
        description: "Diversión para todas las edades",
        sortOrder: 7,
        subcategories: {
          create: [
            { name: "Peluches", slug: "peluches", sortOrder: 1 },
            { name: "Didácticos y Juegos", slug: "didacticos", sortOrder: 2 },
            { name: "Diversión", slug: "diversion", sortOrder: 3 },
          ],
        },
      },
    }),
    prisma.category.create({
      data: {
        name: "Regalos y Celebraciones",
        slug: "regalos-y-celebraciones",
        description: "Regalos para fechas especiales",
        sortOrder: 8,
        subcategories: {
          create: [
            { name: "Día del Padre", slug: "dia-del-padre", sortOrder: 1 },
            { name: "Fiestas", slug: "fiestas", sortOrder: 2 },
          ],
        },
      },
    }),
    prisma.category.create({
      data: {
        name: "Jardín",
        slug: "jardin",
        description: "Artículos para el jardín y exteriores",
        sortOrder: 9,
      },
    }),
    prisma.category.create({
      data: {
        name: "Arte y Manualidades",
        slug: "arte-y-manualidades",
        description: "Materiales y arte",
        sortOrder: 10,
        subcategories: {
          create: [
            { name: "Útiles Escolares", slug: "utiles", sortOrder: 1 },
            { name: "Manualidades", slug: "manualidades", sortOrder: 2 },
          ],
        },
      },
    }),
  ]);

  console.log("✅ Categorías creadas");

  // =========================================================================
  // MARCAS Y PROVEEDORES
  // =========================================================================
  const brands = await Promise.all([
    prisma.brand.create({
      data: { name: "HomeStyle", slug: "homestyle", description: "Artículos de hogar premium" },
    }),
    prisma.brand.create({
      data: { name: "TechPro", slug: "techpro", description: "Tecnología de calidad" },
    }),
    prisma.brand.create({
      data: { name: "CookMaster", slug: "cookmaster", description: "Utensilios de cocina profesional" },
    }),
    prisma.brand.create({
      data: { name: "DecoArt", slug: "decoart", description: "Decoración y arte" },
    }),
  ]);

  const supplier = await prisma.supplier.create({
    data: {
      name: "Guangzhou Trading Co.",
      contactName: "Li Wei",
      email: "liwei@gztrade.cn",
      phone: "+86 20 1234 5678",
      country: "China",
      isActive: true,
    },
  });

  console.log("✅ Marcas y proveedores creados");

  // =========================================================================
  // PRODUCTOS
  // =========================================================================
  
  let importedProducts: any[] = [];
  try {
    const seedPath = path.join(process.cwd(), "prisma", "seed-reales.json");
    if (fs.existsSync(seedPath)) {
      importedProducts = JSON.parse(fs.readFileSync(seedPath, "utf-8"));
      console.log(`📦 Encontrados ${importedProducts.length} productos reales en seed-reales.json`);
    }
  } catch (e) {
    console.log("No se pudo leer seed-reales.json, usando productos por defecto.");
  }

  const products = [];
  
  if (importedProducts.length > 0) {
    for (let i = 0; i < importedProducts.length; i++) {
      const p = importedProducts[i];
      const categorySlug = p.categoryId.replace("cat-", ""); // asumiendo que "cat-hogar" -> "hogar"
      
      // Buscar la categoría real en BD o usar la primera por defecto
      let dbCat = await prisma.category.findUnique({ where: { slug: categorySlug } });
      if (!dbCat) {
        dbCat = categories[0]; // fallback
      }

      // Buscar la subcategoría real en BD si existe
      let dbSubCat = null;
      if (p.subcategoryId) {
        dbSubCat = await prisma.subcategory.findFirst({ where: { slug: p.subcategoryId } });
      }

      const product = await prisma.product.create({
        data: {
          name: p.name,
          slug: p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") + "-" + i,
          sku: `SKU-REAL-${i+1}`,
          description: p.name,
          shortDescription: p.name,
          price: p.price,
          comparePrice: null,
          costPrice: p.price * 0.7,
          status: "ACTIVE",
          isFeatured: i < 8,
          categoryId: dbCat.id,
          subcategoryId: dbSubCat ? dbSubCat.id : null,
          brandId: brands[0].id,
          supplierId: supplier.id,
          images: {
            create: [{
              url: `/products/${p.imageFile}`,
              alt: p.name,
              isPrimary: true,
              position: 0,
            }],
          },
          inventory: {
            create: { quantity: 50, minStock: 5 },
          },
        },
      });
      products.push(product);
    }
  } else {
    // Default mock products
    const defaultProducts = await Promise.all([
    // Producto 1 — Cocina
    prisma.product.create({
      data: {
        name: "Set de Sartenes Antiadherentes Premium",
        slug: "set-sartenes-antiadherentes-premium",
        sku: "SKU-001",
        description: "Juego de 3 sartenes antiadherentes con recubrimiento de titanio. Incluye sartenes de 20cm, 24cm y 28cm. Compatibles con todo tipo de cocinas incluyendo inducción.",
        shortDescription: "Set de 3 sartenes profesionales con recubrimiento antiadherente de titanio",
        price: 189.90,
        comparePrice: 249.90,
        costPrice: 85.00,
        status: "ACTIVE",
        isFeatured: true,
        categoryId: categories[1].id,
        brandId: brands[2].id,
        supplierId: supplier.id,
        tags: ["cocina", "sartenes", "antiadherente", "induccion"],
        metaTitle: "Set de Sartenes Antiadherentes Premium | ikaZa Import",
        metaDescription: "Juego de 3 sartenes profesionales con recubrimiento de titanio. Compatibles con inducción.",
        images: {
          create: [
            {
              url: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800",
              alt: "Set de sartenes antiadherentes",
              isPrimary: true,
              position: 0,
            },
          ],
        },
        inventory: {
          create: { quantity: 45, minStock: 10 },
        },
      },
    }),

    // Producto 2 — Tecnología
    prisma.product.create({
      data: {
        name: "Auriculares Bluetooth Pro Noise Cancelling",
        slug: "auriculares-bluetooth-pro-noise-cancelling",
        sku: "SKU-002",
        description: "Auriculares inalámbricos con cancelación de ruido activa. Hasta 30 horas de batería, Hi-Res Audio, micrófono HD. Conectividad Bluetooth 5.2.",
        shortDescription: "Auriculares premium con ANC y 30h de batería",
        price: 299.90,
        comparePrice: 399.90,
        costPrice: 120.00,
        status: "ACTIVE",
        isFeatured: true,
        categoryId: categories[2].id,
        brandId: brands[1].id,
        supplierId: supplier.id,
        tags: ["audio", "bluetooth", "auriculares", "noise-cancelling"],
        images: {
          create: [{
            url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800",
            alt: "Auriculares Bluetooth Pro",
            isPrimary: true,
            position: 0,
          }],
        },
        inventory: {
          create: { quantity: 28, minStock: 5 },
        },
      },
    }),

    // Producto 3 — Hogar
    prisma.product.create({
      data: {
        name: "Lámpara LED de Escritorio Articulada",
        slug: "lampara-led-escritorio-articulada",
        sku: "SKU-003",
        description: "Lámpara de escritorio LED con 5 temperaturas de color y 5 niveles de brillo. Base con cargador inalámbrico USB-C integrado. Brazo articulado 360°.",
        shortDescription: "Lámpara LED con cargador inalámbrico integrado",
        price: 149.90,
        comparePrice: null,
        costPrice: 55.00,
        status: "ACTIVE",
        isFeatured: false,
        categoryId: categories[0].id,
        brandId: brands[0].id,
        supplierId: supplier.id,
        tags: ["lampara", "led", "escritorio", "cargador-inalambrico"],
        images: {
          create: [{
            url: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800",
            alt: "Lámpara LED articulada",
            isPrimary: true,
            position: 0,
          }],
        },
        inventory: {
          create: { quantity: 0, minStock: 5 },
        },
      },
    }),

    // Producto 4 — Cocina destacado
    prisma.product.create({
      data: {
        name: "Procesador de Alimentos 12 en 1",
        slug: "procesador-alimentos-12-en-1",
        sku: "SKU-004",
        description: "Procesador de alimentos multifunción con 12 accesorios intercambiables. Motor 1000W, capacidad 2.5L, pantalla LCD.",
        shortDescription: "Procesador multifunción con 12 accesorios y 1000W",
        price: 459.90,
        comparePrice: 599.90,
        costPrice: 180.00,
        status: "ACTIVE",
        isFeatured: true,
        categoryId: categories[1].id,
        brandId: brands[2].id,
        supplierId: supplier.id,
        tags: ["procesador", "electrodomestico", "cocina"],
        images: {
          create: [{
            url: "https://images.unsplash.com/photo-1625961332771-3f40b0e2bdcf?w=800",
            alt: "Procesador de alimentos",
            isPrimary: true,
            position: 0,
          }],
        },
        inventory: {
          create: { quantity: 15, minStock: 3 },
        },
      },
    }),

    // Producto 5 — Decoración
    prisma.product.create({
      data: {
        name: "Set de 3 Jarrones Cerámicos Minimalistas",
        slug: "set-jarrones-ceramicos-minimalistas",
        sku: "SKU-005",
        description: "Elegante set de 3 jarrones de cerámica en diferentes tamaños. Diseño minimalista escandinavo. Colores: blanco, beige y terracota.",
        shortDescription: "Set de 3 jarrones cerámica estilo escandinavo",
        price: 89.90,
        comparePrice: 119.90,
        costPrice: 35.00,
        status: "ACTIVE",
        isFeatured: true,
        categoryId: categories[3].id,
        brandId: brands[3].id,
        supplierId: supplier.id,
        tags: ["decoracion", "jarrones", "ceramica", "escandinavo"],
        images: {
          create: [{
            url: "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=800",
            alt: "Jarrones cerámicos decorativos",
            isPrimary: true,
            position: 0,
          }],
        },
        inventory: {
          create: { quantity: 30, minStock: 8 },
        },
      },
    })
  ]);
  products.push(...defaultProducts);
}

  console.log("✅ Productos creados");

  // =========================================================================
  // BANNERS
  // =========================================================================
  await prisma.banner.createMany({
    data: [
      {
        title: "Hasta 40% de descuento en Hogar",
        subtitle: "Solo por tiempo limitado",
        image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1280",
        link: "/catalog?category=hogar",
        position: "home_hero",
        sortOrder: 0,
        isActive: true,
      },
      {
        title: "Nueva colección de cocina",
        subtitle: "Productos premium importados",
        image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1280",
        link: "/catalog?category=cocina",
        position: "home_secondary",
        sortOrder: 1,
        isActive: true,
      },
    ],
  });

  // =========================================================================
  // CUPONES
  // =========================================================================
  await prisma.coupon.createMany({
    data: [
      {
        code: "BIENVENIDO10",
        description: "10% de descuento para nuevos usuarios",
        discountType: "PERCENTAGE",
        discountValue: 10,
        minOrderAmount: 50,
        maxUses: 1000,
        isActive: true,
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 días
      },
      {
        code: "IKAZA20",
        description: "20% de descuento en toda la tienda",
        discountType: "PERCENTAGE",
        discountValue: 20,
        minOrderAmount: 200,
        maxUses: 500,
        isActive: true,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días
      },
      {
        code: "ENVIOGRATIS",
        description: "Envío gratuito",
        discountType: "FREE_SHIPPING",
        discountValue: 0,
        minOrderAmount: 100,
        isActive: true,
      },
    ],
  });

  console.log("✅ Banners y cupones creados");

  // =========================================================================
  // RESEÑAS DE PRUEBA
  // =========================================================================
  await prisma.review.createMany({
    data: [
      {
        productId: products[0].id,
        userId: customers[0].id,
        rating: 5,
        title: "Excelente calidad",
        content: "Los sartenes son increíbles, el antiadherente funciona perfectamente y limpian muy fácil.",
        isApproved: true,
      },
      {
        productId: products[1].id,
        userId: customers[1].id,
        rating: 4,
        title: "Muy buenos auriculares",
        content: "La cancelación de ruido es muy efectiva, el sonido es claro. Solo le daría 5 estrellas si fueran más cómodos.",
        isApproved: true,
      },
    ],
  });

  console.log("✅ Reseñas creadas");

  // =========================================================================
  // RESUMEN
  // =========================================================================
  console.log("\n🎉 Seed completado exitosamente!\n");
  console.log("📋 Usuarios de prueba:");
  console.log("  👑 Super Admin: superadmin@ikaza.pe / Admin123!");
  console.log("  🔧 Admin:       admin@ikaza.pe     / Admin123!");
  console.log("  📦 Manager:     manager@ikaza.pe   / Admin123!");
  console.log("  🛒 Cliente:     maria@gmail.com    / Customer123!");
  console.log("  🛒 Cliente:     carlos@gmail.com   / Customer123!");
  console.log("\n🏷️  Cupones:");
  console.log("  BIENVENIDO10 — 10% descuento");
  console.log("  IKAZA20      — 20% descuento");
  console.log("  ENVIOGRATIS  — Envío gratis\n");
}

main()
  .catch((e) => {
    console.error("❌ Error en seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
