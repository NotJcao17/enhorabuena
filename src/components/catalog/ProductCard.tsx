import Image from "next/image";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";

interface ProductCardProps {
  id: string; // SKU or ID
  title: string;
  image: string;
  price: number;
  originalPrice?: number | null;
  stock: number;
  variant: "betterware" | "tienda";
  priority?: boolean;
}

export function ProductCard({
  id,
  title,
  image,
  price,
  originalPrice,
  stock,
  variant,
  priority = false,
}: ProductCardProps) {
  const href =
    variant === "betterware" ? `/producto/bw/${id}` : `/producto/tp/${id}`;

  const isBetterware = variant === "betterware";

  return (
    <Link href={href} className="group flex flex-col h-full bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
      <div className="relative aspect-square w-full bg-gray-50 overflow-hidden">
        <Image
          src={image}
          alt={title}
          fill
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          priority={priority}
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {stock > 1 && (
          <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-bold text-gray-700 shadow-sm">
            {stock} disp.
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1 gap-2">
        {isBetterware && (
          <span className="text-xs font-semibold tracking-wider text-gray-400 uppercase">
            SKU: {id}
          </span>
        )}

        <h3 className="font-bold text-gray-900 leading-tight line-clamp-2">
          {title}
        </h3>

        <div className="mt-auto pt-2 flex items-baseline gap-2 flex-wrap">
          <span className="text-lg font-black text-primary">
            {formatCurrency(price)}
          </span>
          {originalPrice && originalPrice > price && (
            <span className="text-sm text-red-500 line-through font-medium">
              {formatCurrency(originalPrice)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
