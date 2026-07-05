import { getStoreConfig } from "@/lib/data/public-catalog";
import { CartView } from "@/components/catalog/CartView";

export const dynamic = "force-dynamic";

export default async function CartPage() {
  const config = await getStoreConfig();

  return <CartView maruPhone={config.maru} moscoPhone={config.mosco} />;
}
