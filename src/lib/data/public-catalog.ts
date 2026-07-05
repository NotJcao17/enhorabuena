import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export type BetterwareCatalogItem = {
  sku: string;
  title: string;
  productType: string;
  image: string;
  price: number;
  originalPrice: number | null;
  stock: number;
};

export type CustomCatalogItem = {
  id: string;
  title: string;
  category: string | null;
  image: string;
  price: number;
  stock: number;
};

// Helper for price calculation
function calculateBwPrice(
  unitCustomPrice: Prisma.Decimal | null,
  catalogPrice: Prisma.Decimal,
  catalogCompareAt: Prisma.Decimal | null
) {
  if (unitCustomPrice !== null) {
    const custom = Number(unitCustomPrice);
    const catalog = Number(catalogPrice);
    return {
      price: custom,
      originalPrice: custom < catalog ? catalog : null,
    };
  }

  const priceNum = Number(catalogPrice);
  if (catalogCompareAt !== null) {
    const compareNum = Number(catalogCompareAt);
    return {
      price: Math.min(priceNum, compareNum),
      originalPrice: Math.max(priceNum, compareNum),
    };
  }

  return {
    price: priceNum,
    originalPrice: null,
  };
}

export async function getAvailableBetterwareProducts(): Promise<BetterwareCatalogItem[]> {
  const units = await prisma.inventoryUnit.findMany({
    where: {
      status: "available",
    },
    include: {
      catalogProduct: true,
    },
  });

  // Group by catalogProduct
  const grouped = new Map<number, typeof units>();
  units.forEach((unit) => {
    const existing = grouped.get(unit.catalogProductId) || [];
    existing.push(unit);
    grouped.set(unit.catalogProductId, existing);
  });

  const result: BetterwareCatalogItem[] = [];

  grouped.forEach((productUnits, productId) => {
    const product = productUnits[0].catalogProduct;
    // Tomamos el precio de la primera unidad. (Podríamos buscar el mínimo si varían, pero asumimos consistencia)
    const priceData = calculateBwPrice(
      productUnits[0].customPrice,
      product.priceBetterware,
      product.compareAtPrice
    );

    let imageUrl = "/placeholder.jpg";
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      imageUrl = (product.images[0] as any).src || imageUrl;
    }

    result.push({
      sku: product.sku,
      title: product.title,
      productType: product.productType,
      image: imageUrl,
      price: priceData.price,
      originalPrice: priceData.originalPrice,
      stock: productUnits.length,
    });
  });

  return result;
}

export async function getAvailableCustomProducts(): Promise<CustomCatalogItem[]> {
  const products = await prisma.customProduct.findMany({
    where: {
      isActive: true,
      stock: {
        gt: 0,
      },
    },
  });

  return products.map((p) => {
    let imageUrl = "/placeholder.jpg";
    if (p.images && Array.isArray(p.images) && p.images.length > 0) {
      imageUrl = p.images[0] as string;
    }

    return {
      id: p.id.toString(),
      title: p.name,
      category: p.category,
      image: imageUrl,
      price: Number(p.price),
      stock: p.stock,
    };
  });
}

export async function getBetterwareProductDetails(sku: string) {
  const product = await prisma.catalogProduct.findUnique({
    where: { sku },
  });

  if (!product) return null;

  const units = await prisma.inventoryUnit.findMany({
    where: {
      catalogProductId: product.id,
      status: "available",
    },
  });

  if (units.length === 0) return null;

  const priceData = calculateBwPrice(
    units[0].customPrice,
    product.priceBetterware,
    product.compareAtPrice
  );

  return {
    ...product,
    price: priceData.price,
    originalPrice: priceData.originalPrice,
    stock: units.length,
    images: Array.isArray(product.images) ? product.images as any[] : [],
  };
}

export async function getCustomProductDetails(id: number) {
  const product = await prisma.customProduct.findUnique({
    where: { id },
  });

  if (!product || !product.isActive || product.stock <= 0) return null;

  return {
    ...product,
    images: Array.isArray(product.images) ? product.images as string[] : [],
  };
}

export async function getStoreConfig() {
  const configs = await prisma.appConfig.findMany({
    where: {
      key: {
        in: ["whatsapp_maru", "whatsapp_mosco", "store_name"],
      },
    },
  });

  const configMap = configs.reduce((acc, curr) => {
    acc[curr.key] = curr.value;
    return acc;
  }, {} as Record<string, string>);

  return {
    maru: configMap["whatsapp_maru"] || "524774499628",
    mosco: configMap["whatsapp_mosco"] || "524777240506",
    storeName: configMap["store_name"] || "Enhorabuena",
  };
}
