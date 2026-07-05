import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, MessageCircle } from "lucide-react";
import { getBetterwareProductDetails, getStoreConfig } from "@/lib/data/public-catalog";
import { ImageCarousel } from "@/components/catalog/ImageCarousel";
import { SanitizedHTML } from "@/components/catalog/SanitizedHTML";
import { AddToCartButton } from "@/components/catalog/AddToCartButton";
import { CartoonButton } from "@/components/ui/CartoonButton";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function BetterwareProductPage({
  params,
}: {
  params: Promise<{ sku: string }>;
}) {
  const resolvedParams = await params;
  const sku = resolvedParams.sku;
  
  const product = await getBetterwareProductDetails(sku);
  const config = await getStoreConfig();

  if (!product) {
    notFound();
  }

  const imageUrls = product.images.map((img) => img.src).filter(Boolean);
  if (imageUrls.length === 0) {
    imageUrls.push("/placeholder.jpg");
  }

  const wpMessage = encodeURIComponent(
    `Hola, me interesa el producto ${product.title} - ${product.sku} (${formatCurrency(
      product.price
    )}) de ${config.storeName}`
  );

  const cartItem = {
    id: product.sku,
    type: "betterware" as const,
    title: product.title,
    price: product.price,
    originalPrice: product.originalPrice,
    image: imageUrls[0],
    maxQuantity: product.stock,
  };

  return (
    <div className="flex flex-col gap-6 pb-24">
      <Link
        href="/"
        className="inline-flex items-center text-primary font-semibold hover:underline"
      >
        <ChevronLeft className="w-5 h-5 mr-1" />
        Volver al catálogo
      </Link>

      <div className="grid md:grid-cols-2 gap-8 md:gap-12">
        {/* Imágenes */}
        <div className="w-full">
          <ImageCarousel images={imageUrls} altPrefix={product.title} />
        </div>

        {/* Detalles */}
        <div className="flex flex-col gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="bg-surface-tint text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                {product.productType}
              </span>
              <span className="text-sm font-semibold text-gray-500">
                SKU: {product.sku}
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 leading-tight mb-4">
              {product.title}
            </h1>

            <div className="flex items-baseline gap-3 mb-4">
              <span className="text-4xl font-black text-primary">
                {formatCurrency(product.price)}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-xl text-red-500 line-through font-medium">
                  {formatCurrency(product.originalPrice)}
                </span>
              )}
            </div>

            <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 flex items-center justify-between mb-6">
              <span className="font-semibold text-gray-700">Disponibilidad</span>
              <span className="bg-green-100 text-green-800 font-bold px-3 py-1 rounded-full text-sm">
                {product.stock} en stock
              </span>
            </div>
          </div>

          <div className="prose-container">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Descripción</h3>
            <SanitizedHTML html={product.bodyHtml} />
          </div>

          <div className="mt-auto pt-6 border-t border-gray-100 flex flex-col gap-4">
            <AddToCartButton item={cartItem} />
            
            <div className="grid grid-cols-2 gap-3 mt-4">
              <CartoonButton
                href={`https://wa.me/${config.maru}?text=${wpMessage}`}
                target="_blank"
                label={<><MessageCircle className="w-5 h-5" /> Maru</>}
                color="bg-[#25D366] text-white border-[#128C7E]"
              />
              <CartoonButton
                href={`https://wa.me/${config.mosco}?text=${wpMessage}`}
                target="_blank"
                label={<><MessageCircle className="w-5 h-5" /> Mosco</>}
                color="bg-[#25D366] text-white border-[#128C7E]"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
