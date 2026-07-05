"use client";

import { useState } from "react";
import { ShoppingCart, Check, Plus, Minus } from "lucide-react";
import { useCartStore, CartItem } from "@/store/cartStore";
import { CartoonButton } from "@/components/ui/CartoonButton";
import toast from "react-hot-toast";

interface AddToCartButtonProps {
  item: Omit<CartItem, "quantity">;
}

export function AddToCartButton({ item }: AddToCartButtonProps) {
  const { items, addItem, removeItem, updateQuantity } = useCartStore();
  
  const cartItem = items.find((i) => i.id === item.id);
  const quantity = cartItem?.quantity || 0;

  const handleAdd = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    if (quantity === 0) {
      addItem({ ...item, quantity: 1 });
      toast.success("Agregado al carrito", { position: "bottom-center" });
    } else if (quantity < item.maxQuantity) {
      updateQuantity(item.id, quantity + 1);
    } else {
      toast.error("Stock máximo alcanzado", { position: "bottom-center" });
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (quantity > 1) {
      updateQuantity(item.id, quantity - 1);
    } else {
      removeItem(item.id);
    }
  };

  if (quantity > 0) {
    return (
      <CartoonButton
        label={
          <div className="flex items-center gap-4 w-full justify-between px-2">
            <div role="button" onClick={handleRemove} className="p-2 -ml-2 rounded-lg hover:bg-black/10 transition-colors active:scale-95 cursor-pointer" title="Quitar 1">
              <Minus className="w-5 h-5" />
            </div>
            <span className="text-lg">{quantity} en carrito</span>
            <div role="button" onClick={handleAdd} className="p-2 -mr-2 rounded-lg hover:bg-black/10 transition-colors active:scale-95 cursor-pointer" title="Agregar 1">
              <Plus className="w-5 h-5" />
            </div>
          </div>
        }
        color="bg-emerald-500 text-white border-emerald-600"
        hasHighlight={false}
      />
    );
  }

  return (
    <CartoonButton
      label={
        <>
          <ShoppingCart className="w-5 h-5" /> Añadir Al Carrito
        </>
      }
      color="bg-[#ff6c00] text-white border-[#cc5500]"
      onClick={handleAdd}
    />
  );
}
