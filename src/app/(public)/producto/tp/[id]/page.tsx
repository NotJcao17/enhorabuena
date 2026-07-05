import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, MessageCircle } from "lucide-react";
import { getCustomProductDetails, getStoreConfig } from "@/lib/data/public-catalog";
import { ImageCarousel } from "@/components/catalog/ImageCarousel";
import { AddToCartButton } from "@/components/catalog/AddToCartButton";
import { CartoonButton } from "@/components/ui/CartoonButton";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function CustomProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const idNum = parseInt(resolvedParams.id, 10);
  
  if (isNaN(idNum)) {
    notFound();
  }

  const product = await getCustomProductDetails(idNum);
  const config = await getStoreConfig();

  if (!product) {
    notFound();
  }

  const imageUrls = product.images && product.images.length > 0 
    ? product.images 
    : ["/placeholder.jpg"];

  const wpMessage = encodeURIComponent(
    `Hola, me interesa el producto ${product.name} (${formatCurrency(
      Number(product.price)
    )}) de ${config.storeName}`
  );

  const cartItem = {
    id: product.id.toString(),
    type: "tienda" as const,
    title: product.name,
    price: Number(product.price),
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
          <ImageCarousel images={imageUrls} altPrefix={product.name} />
        </div>

        {/* Detalles */}
        <div className="flex flex-col gap-6">
          <div>
            {product.category && (
              <div className="mb-2">
                <span className="bg-surface-tint text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  {product.category}
                </span>
              </div>
            )}
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 leading-tight mb-4">
              {product.name}
            </h1>

            <div className="flex items-baseline gap-3 mb-4">
              <span className="text-4xl font-black text-primary">
                {formatCurrency(Number(product.price))}
              </span>
            </div>

            <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 flex items-center justify-between mb-6">
              <span className="font-semibold text-gray-700">Disponibilidad</span>
              <span className="bg-green-100 text-green-800 font-bold px-3 py-1 rounded-full text-sm">
                {product.stock} en stock
              </span>
            </div>
          </div>

          {product.description && (
            <div className="prose-container">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Descripción</h3>
              <p className="text-gray-600 whitespace-pre-wrap">{product.description}</p>
            </div>
          )}

          <div className="mt-auto pt-6 border-t border-gray-100 flex flex-col gap-4">
            <AddToCartButton item={cartItem} />
            
            <div className="mt-4">
              <CartoonButton
                href={`https://wa.me/${config.maru}?text=${wpMessage}`}
                target="_blank"
                label={<><MessageCircle className="w-5 h-5" /> Preguntar a Maru</>}
                color="bg-[#25D366] text-white border-[#128C7E]"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
