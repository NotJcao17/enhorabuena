"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ShoppingBag, MessageCircle } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { CartItemCard } from "./CartItemCard";
import { formatCurrency } from "@/lib/utils";
import { CartoonButton } from "@/components/ui/CartoonButton";

interface CartViewProps {
  maruPhone: string;
  moscoPhone: string;
}

export function CartView({ maruPhone, moscoPhone }: CartViewProps) {
  const [mounted, setMounted] = useState(false);
  const { items, clearCart } = useCartStore();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) return null; // Wait for client hydration

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6 text-gray-400">
          <ShoppingBag className="w-12 h-12" />
        </div>
        <h2 className="text-2xl font-black text-gray-900 mb-2">
          Tu carrito está vacío
        </h2>
        <p className="text-gray-500 mb-8 text-center max-w-sm">
          Aún no has agregado ningún producto. Descubre lo que tenemos para ti.
        </p>
        <Link
          href="/"
          className="bg-primary text-white font-bold py-3 px-8 rounded-xl hover:bg-primary-hover transition-colors shadow-md transform hover:-translate-y-0.5"
        >
          Explorar catálogo
        </Link>
      </div>
    );
  }

  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  // Logic for WhatsApp buttons
  const hasCustomProduct = items.some((item) => item.type === "tienda");
  
  const generateMessage = () => {
    let msg = "¡Hola! Me interesan estos productos de Enhorabuena:\n\n";
    items.forEach((item) => {
      const isBw = item.type === "betterware";
      msg += `• ${item.title} ${isBw ? `(${item.id}) ` : ""}- ${item.quantity}x ${formatCurrency(item.price)}\n`;
    });
    msg += `\nTotal: ${formatCurrency(subtotal)}`;
    return encodeURIComponent(msg);
  };

  const wpMessage = generateMessage();

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6 pb-24">
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center text-primary font-semibold hover:underline"
        >
          <ArrowLeft className="w-5 h-5 mr-1" />
          Volver
        </Link>
        <h1 className="text-2xl font-black text-gray-900">Tu Carrito</h1>
      </div>

      <div className="flex flex-col gap-4">
        <div className="bg-gray-50/50 rounded-2xl p-2 md:p-6 shadow-sm border border-gray-100">
          {items.map((item) => (
            <CartItemCard key={item.id} item={item} />
          ))}

          <div className="mt-6 flex justify-between items-center px-4">
            <button
              onClick={clearCart}
              className="text-sm font-semibold text-gray-400 hover:text-red-500 transition-colors"
            >
              Vaciar carrito
            </button>
            <div className="text-right">
              <p className="text-sm text-gray-500 font-medium">Subtotal</p>
              <p className="text-3xl font-black text-gray-900">
                {formatCurrency(subtotal)}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3">
          <p className="text-center text-sm font-medium text-gray-500 mb-2">
            Envía tu pedido por WhatsApp para acordar la entrega y el pago.
          </p>
          
          <CartoonButton
            href={`https://wa.me/${maruPhone}?text=${wpMessage}`}
            target="_blank"
            label={<><MessageCircle className="w-5 h-5" /> Enviar pedido a Maru</>}
            color="bg-[#25D366] text-white border-[#128C7E]"
          />

          {!hasCustomProduct && (
            <CartoonButton
              href={`https://wa.me/${moscoPhone}?text=${wpMessage}`}
              target="_blank"
              label={<><MessageCircle className="w-5 h-5" /> Enviar pedido a Mosco</>}
              color="bg-[#25D366] text-white border-[#128C7E]"
            />
          )}
        </div>
      </div>
    </div>
  );
}
