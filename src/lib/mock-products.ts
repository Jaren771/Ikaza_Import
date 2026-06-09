export interface MockProduct {
  id: string;
  slug: string;
  name: string;
  sku: string;
  price: number;
  comparePrice: number | null;
  shortDescription: string;
  description: string;
  status: string;
  isFeatured: boolean;
  categoryId: string;
  category: { id: string; name: string; slug: string };
  subcategoryId?: string;
  subcategory?: { id: string; name: string; slug: string } | null;
  brandId: string;
  brand: { id: string; name: string; slug: string; logo: string | null };
  images: { id: string; url: string; alt: string | null; isPrimary: boolean; position: number }[];
  inventory: { quantity: number; minStock: number; reservedQuantity: number };
  reviews: { id: string; rating: number; title: string; content: string; user: { name: string; image: string | null }; createdAt: Date }[];
  tags: string[];
  avgRating?: number;
  reviewCount?: number;
}

const MOCK_CATEGORIES = [
  { id: "cat-hogar", name: "Hogar", slug: "hogar" },
  { id: "cat-cocina", name: "Cocina", slug: "cocina" },
  { id: "cat-tecnologia", name: "Tecnología", slug: "tecnologia" },
  { id: "cat-decoracion", name: "Decoración", slug: "decoracion" },
  { id: "cat-vestimenta", name: "Vestimenta", slug: "vestimenta" },
  { id: "cat-belleza", name: "Belleza y cuidado personal", slug: "belleza-y-cuidado-personal" },
  { id: "cat-juguetes", name: "Juguetes y juegos", slug: "juguetes-y-juegos" },
  { id: "cat-regalos", name: "Regalos y celebraciones", slug: "regalos-y-celebraciones" },
  { id: "cat-jardin", name: "Jardín", slug: "jardin" },
  { id: "cat-bano", name: "Baño", slug: "bano" },
  { id: "cat-arte-y-manualidades", name: "Arte y Manualidades", slug: "arte-y-manualidades" },
];

const MOCK_BRANDS = [
  { id: "br-homestyle", name: "HomeStyle", slug: "homestyle", logo: null },
  { id: "br-techpro", name: "TechPro", slug: "techpro", logo: null },
  { id: "br-cookmaster", name: "CookMaster", slug: "cookmaster", logo: null },
  { id: "br-decoart", name: "DecoArt", slug: "decoart", logo: null },
  { id: "br-ecogarden", name: "EcoGarden", slug: "ecogarden", logo: null },
];

const IMG = (id: string) => `https://images.unsplash.com/${id}?w=600&auto=format&fit=crop&q=60`;

function mockProduct(
  overrides: Partial<MockProduct> & { name: string; price: number; categoryId: string; brandId: string },
  imageIds: string[],
): MockProduct {
  const slug = overrides.slug ?? overrides.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const category = MOCK_CATEGORIES.find((c) => c.id === overrides.categoryId)!;
  const brand = MOCK_BRANDS.find((b) => b.id === overrides.brandId)!;
  return {
    id: `mock-${slug}`,
    slug,
    sku: `IKZ-MOCK-${slug.slice(0, 8).toUpperCase()}`,
    shortDescription: `Descubre el mejor ${overrides.name.toLowerCase()} para tu hogar.`,
    description: `${overrides.name} de alta calidad, diseñado para brindar la mejor experiencia. Materiales premium, diseño moderno y funcionalidad excepcional. Ideal para cualquier espacio de tu hogar.`,
    status: "ACTIVE",
    isFeatured: false,
    subcategoryId: undefined,
    subcategory: null,
    inventory: { quantity: Math.floor(Math.random() * 40) + 3, minStock: 5, reservedQuantity: 0 },
    reviews: [
      { id: `rev-${slug}-1`, rating: 5, title: "Excelente", content: "Superó mis expectativas", user: { name: "María G.", image: null }, createdAt: new Date() },
      { id: `rev-${slug}-2`, rating: 4, title: "Muy bueno", content: "Buena relación calidad-precio", user: { name: "Carlos L.", image: null }, createdAt: new Date() },
    ],
    tags: [],
    images: imageIds.map((id, i) => ({
      id: `img-${slug}-${i}`,
      url: IMG(id),
      alt: `${overrides.name} - Vista ${i + 1}`,
      isPrimary: i === 0,
      position: i,
    })),
    ...overrides,
  } as MockProduct;
}

const cat = (name: string) => MOCK_CATEGORIES.find((c) => c.name === name)!.id;
const br = (name: string) => MOCK_BRANDS.find((b) => b.name === name)!.id;

export const MOCK_PRODUCTS: MockProduct[] = [
  mockProduct(
    { name: "Set de Sartenes Antiadherentes Premium", price: 189.90, comparePrice: 249.90, categoryId: cat("Cocina"), brandId: br("CookMaster"), isFeatured: true, tags: ["Cocina", "Antiaderente", "Premium"] },
    ["photo-1556909114-f6e7ad7d3136", "photo-1590794056226-79ef3a8147e1"],
  ),
  mockProduct(
    { name: "Auriculares Bluetooth Pro Noise Cancelling", price: 299.90, comparePrice: 399.90, categoryId: cat("Tecnología"), brandId: br("TechPro"), isFeatured: true, tags: ["Audio", "Bluetooth", "Tecnología"] },
    ["photo-1505740420928-5e560c06d30e", "photo-1484704849700-f032a568e944"],
  ),
  mockProduct(
    { name: "Lámpara LED de Escritorio Articulada", price: 149.90, comparePrice: null, categoryId: cat("Hogar"), brandId: br("HomeStyle"), inventory: { quantity: 0, minStock: 5, reservedQuantity: 0 }, tags: ["Iluminación", "LED", "Escritorio"] },
    ["photo-1507473885765-e6ed057f782c", "photo-1513506003901-1e6a229e2d15"],
  ),
  mockProduct(
    { name: "Procesador de Alimentos 12 en 1", price: 459.90, comparePrice: 529.90, categoryId: cat("Cocina"), brandId: br("CookMaster"), isFeatured: true, tags: ["Cocina", "Electrodomésticos"] },
    ["photo-1590794056226-79ef3a8147e1", "photo-1556909114-f6e7ad7d3136"],
  ),
  mockProduct(
    { name: "Set de 3 Jarrones Cerámicos Minimalistas", price: 89.90, comparePrice: null, categoryId: cat("Decoración"), brandId: br("DecoArt"), isFeatured: true, tags: ["Decoración", "Cerámica", "Minimalista"] },
    ["photo-1513694203232-719a280e022f", "photo-1484101403633-562f891dc89a"],
  ),
  mockProduct(
    { name: "Lámpara de Mesa Elegante", price: 89.90, comparePrice: 120.00, categoryId: cat("Hogar"), brandId: br("HomeStyle"), tags: ["Iluminación", "Mesa", "Elegante"] },
    ["photo-1507473885765-e6ed057f782c", "photo-1513506003901-1e6a229e2d15"],
  ),
  mockProduct(
    { name: "Cojín Decorativo Moderno", price: 45.00, comparePrice: null, categoryId: cat("Decoración"), brandId: br("DecoArt"), tags: ["Decoración", "Cojín", "Moderno"] },
    ["photo-1584100936595-c0654b55a2e2", "photo-1513694203232-719a280e022f"],
  ),
  mockProduct(
    { name: "Robot Aspirador Inteligente", price: 899.90, comparePrice: 1099.90, categoryId: cat("Tecnología"), brandId: br("TechPro"), isFeatured: true, tags: ["Tecnología", "Robot", "Limpieza"] },
    ["photo-1526738549149-a6f2f6b8b2d8", "photo-1484704849700-f032a568e944"],
  ),
  mockProduct(
    { name: "Organizador de Cocina Multinivel", price: 59.90, comparePrice: null, categoryId: cat("Cocina"), brandId: br("CookMaster"), tags: ["Cocina", "Organización"] },
    ["photo-1556909114-f6e7ad7d3136", "photo-1590794056226-79ef3a8147e1"],
  ),
  mockProduct(
    { name: "Macetero Colgante Macramé", price: 34.90, comparePrice: 49.90, categoryId: cat("Decoración"), brandId: br("DecoArt"), tags: ["Decoración", "Macramé", "Plantas"] },
    ["photo-1484101403633-562f891dc89a", "photo-1513694203232-719a280e022f"],
  ),
  mockProduct(
    { name: "Kit de Jardinería 10 Piezas", price: 79.90, comparePrice: null, categoryId: cat("Jardín"), brandId: br("EcoGarden"), isFeatured: true, tags: ["Jardín", "Herramientas"] },
    ["photo-1416879595882-3373a0480b5b", "photo-1585320806297-9794b3e4eeae"],
  ),
  mockProduct(
    { name: "Manguera Retráctil 30m", price: 129.90, comparePrice: 169.90, categoryId: cat("Jardín"), brandId: br("EcoGarden"), tags: ["Jardín", "Riego"] },
    ["photo-1416879595882-3373a0480b5b", "photo-1585320806297-9794b3e4eeae"],
  ),
  mockProduct(
    { name: "Set de Toallas de Microfibra Premium", price: 69.90, comparePrice: null, categoryId: cat("Baño"), brandId: br("HomeStyle"), tags: ["Baño", "Textiles", "Premium"] },
    ["photo-1605270012917-bf1c5db6eb9a", "photo-1507652313519-d4e917d2e4e4"],
  ),
  mockProduct(
    { name: "Cortina de Baño Impermeable", price: 49.90, comparePrice: 65.00, categoryId: cat("Baño"), brandId: br("HomeStyle"), tags: ["Baño", "Cortina"] },
    ["photo-1605270012917-bf1c5db6eb9a", "photo-1507652313519-d4e917d2e4e4"],
  ),
  mockProduct(
    { name: "Altavoz Portátil Resistente al Agua", price: 199.90, comparePrice: 249.90, categoryId: cat("Tecnología"), brandId: br("TechPro"), tags: ["Audio", "Portátil", "Bluetooth"] },
    ["photo-1484704849700-f032a568e944", "photo-1505740420928-5e560c06d30e"],
  ),
  mockProduct(
    { name: "Tabla de Picar de Bambú 3 Piezas", price: 39.90, comparePrice: null, categoryId: cat("Cocina"), brandId: br("CookMaster"), tags: ["Cocina", "Bambú", "Ecológico"] },
    ["photo-1556909114-f6e7ad7d3136", "photo-1590794056226-79ef3a8147e1"],
  ),
  mockProduct(
    { name: "Espejo Decorativo Pared Grande", price: 159.90, comparePrice: 199.90, categoryId: cat("Decoración"), brandId: br("DecoArt"), tags: ["Decoración", "Espejo"] },
    ["photo-1513694203232-719a280e022f", "photo-1484101403633-562f891dc89a"],
  ),
  mockProduct(
    { name: "Filtro de Agua Purificador 3 Etapas", price: 249.90, comparePrice: null, categoryId: cat("Cocina"), brandId: br("TechPro"), isFeatured: true, tags: ["Cocina", "Salud", "Agua"] },
    ["photo-1556909114-f6e7ad7d3136", "photo-1590794056226-79ef3a8147e1"],
  ),
];

export function getMockCategories() {
  return MOCK_CATEGORIES.map((c) => ({
    ...c,
    isActive: true,
    sortOrder: MOCK_CATEGORIES.indexOf(c),
    subcategories: [] as { id: string; name: string; slug: string; isActive: boolean; sortOrder: number }[],
    _count: { products: MOCK_PRODUCTS.filter((p) => p.categoryId === c.id).length },
  }));
}

export function filterMockProducts(filters: {
  search?: string;
  categoryId?: string;
  subcategoryId?: string;
  brandId?: string;
  minPrice?: number;
  maxPrice?: number;
  isFeatured?: boolean;
  inStock?: boolean;
  sortBy?: string;
  page?: number;
  limit?: number;
}) {
  let filtered = [...MOCK_PRODUCTS];

  if (filters.search) {
    const q = filters.search.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q)),
    );
  }
  if (filters.categoryId) {
    const matchCat = MOCK_CATEGORIES.find(
      (c) => c.id === filters.categoryId || c.slug === filters.categoryId
    );
    if (matchCat) {
      filtered = filtered.filter((p) => p.categoryId === matchCat.id);
    }
  }
  if (filters.brandId) {
    filtered = filtered.filter((p) => p.brandId === filters.brandId);
  }
  if (filters.minPrice !== undefined) {
    filtered = filtered.filter((p) => p.price >= filters.minPrice!);
  }
  if (filters.maxPrice !== undefined) {
    filtered = filtered.filter((p) => p.price <= filters.maxPrice!);
  }
  if (filters.isFeatured) {
    filtered = filtered.filter((p) => p.isFeatured);
  }
  if (filters.inStock) {
    filtered = filtered.filter((p) => p.inventory.quantity > 0);
  }

  if (filters.sortBy === "price_asc") filtered.sort((a, b) => a.price - b.price);
  else if (filters.sortBy === "price_desc") filtered.sort((a, b) => b.price - a.price);
  else if (filters.sortBy === "name") filtered.sort((a, b) => a.name.localeCompare(b.name));
  else filtered.sort((a, b) => (a.isFeatured === b.isFeatured ? 0 : a.isFeatured ? -1 : 1));

  const page = filters.page ?? 1;
  const limit = filters.limit ?? 12;
  const total = filtered.length;
  const totalPages = Math.ceil(total / limit);
  const start = (page - 1) * limit;
  const data = filtered.slice(start, start + limit);

  return {
    data,
    meta: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
}
