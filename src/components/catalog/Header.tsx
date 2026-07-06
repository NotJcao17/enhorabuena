"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useTheme } from "./ThemeProvider";
import { useEffect, useState } from "react";

export function Header() {
  const { section } = useTheme();
  const items = useCartStore((state) => state.items);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-surface-tint backdrop-blur transition-colors duration-300">
      <div className="flex h-16 items-center justify-between px-4 max-w-7xl mx-auto">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-3xl font-[family-name:var(--font-playfair)] tracking-wider text-primary transition-colors duration-300">
            Enhorabuena
          </span>
        </Link>
        <nav className="flex items-center gap-4">
          <Link
            href="/carrito"
            className="relative p-2 text-foreground hover:text-primary transition-colors"
          >
            <ShoppingCart className="h-6 w-6" />
            {mounted && totalItems > 0 && (
              <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-primary rounded-full">
                {totalItems}
              </span>
            )}
          </Link>
        </nav>
      </div>
    </header>
  );
}
