import {
  getAvailableBetterwareProducts,
  getAvailableCustomProducts,
} from "@/lib/data/public-catalog";
import { CatalogView } from "@/components/catalog/CatalogView";

export const dynamic = "force-dynamic";

export default async function PublicCatalogPage() {
  const [betterwareProducts, customProducts] = await Promise.all([
    getAvailableBetterwareProducts(),
    getAvailableCustomProducts(),
  ]);

  return (
    <CatalogView
      betterwareProducts={betterwareProducts}
      customProducts={customProducts}
    />
  );
}
