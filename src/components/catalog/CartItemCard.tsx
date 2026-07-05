"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCartStore, CartItem } from "@/store/cartStore";
import { formatCurrency } from "@/lib/utils";

export function CartItemCard({ item }: { item: CartItem }) {
  const { updateQuantity, removeItem } = useCartStore();

  const handleDecrease = () => {
    if (item.quantity > 1) {
      updateQuantity(item.id, item.quantity - 1);
    }
  };

  const handleIncrease = () => {
    if (item.quantity < item.maxQuantity) {
      updateQuantity(item.id, item.quantity + 1);
    }
  };

  const href =
    item.type === "betterware"
      ? `/producto/bw/${item.id}`
      : `/producto/tp/${item.id}`;

  return (
    <div className="flex gap-4 py-4 border-b border-gray-100 last:border-0 bg-white p-4 rounded-xl shadow-sm mb-4">
      <Link href={href} className="shrink-0 relative w-24 h-24 bg-gray-50 rounded-lg overflow-hidden border border-gray-100">
        <Image
          src={item.image}
          alt={item.title}
          fill
          sizes="96px"
          className="object-cover"
        />
      </Link>

      <div className="flex flex-col flex-1 gap-1">
        <div className="flex justify-between items-start gap-2">
          <Link href={href} className="font-bold text-gray-900 leading-tight hover:text-primary transition-colors line-clamp-2">
            {item.title}
          </Link>
          <button
            onClick={() => removeItem(item.id)}
            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            aria-label="Eliminar del carrito"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-2 mb-1">
          <span
            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
              item.type === "betterware"
                ? "bg-[#eef4fb] text-[#1a4b8c]"
                : "bg-[#edf9f5] text-[#019d71]"
            }`}
          >
            {item.type === "betterware" ? "BW" : "Personal"}
          </span>
          {item.type === "betterware" && (
            <span className="text-xs text-gray-500 font-medium">SKU: {item.id}</span>
          )}
        </div>

        <div className="flex flex-wrap justify-between items-end mt-auto pt-2 gap-2">
          <div className="flex items-center bg-gray-100 rounded-lg overflow-hidden border border-gray-200 shrink-0">
            <button
              onClick={handleDecrease}
              disabled={item.quantity <= 1}
              className="p-1.5 text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-8 text-center text-sm font-bold text-gray-900">
              {item.quantity}
            </span>
            <button
              onClick={handleIncrease}
              disabled={item.quantity >= item.maxQuantity}
              className="p-1.5 text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="text-right">
            <div className="text-lg font-black text-primary">
              {formatCurrency(item.price * item.quantity)}
            </div>
            {item.quantity > 1 && (
              <div className="text-xs text-gray-500">
                {formatCurrency(item.price)} c/u
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
