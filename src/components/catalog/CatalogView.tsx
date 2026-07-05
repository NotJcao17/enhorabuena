"use client";

import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { ProductCard } from "./ProductCard";
import { CategoryChips } from "./CategoryChips";
import { Tiles } from "@/components/ui/Tiles";
import { CartoonButton } from "@/components/ui/CartoonButton";
import type { BetterwareCatalogItem, CustomCatalogItem } from "@/lib/data/public-catalog";

interface CatalogViewProps {
  betterwareProducts: BetterwareCatalogItem[];
  customProducts: CustomCatalogItem[];
}

export function CatalogView({
  betterwareProducts,
  customProducts,
}: CatalogViewProps) {
  const { section, setSection } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBwCategory, setSelectedBwCategory] = useState<string | null>(null);
  const [selectedTpCategory, setSelectedTpCategory] = useState<string | null>(null);

  const isBetterware = section === "betterware";

  // Derive categories
  const bwCategories = useMemo(() => {
    const cats = new Set(betterwareProducts.map((p) => p.productType).filter(Boolean));
    return Array.from(cats).sort();
  }, [betterwareProducts]);

  const tpCategories = useMemo(() => {
    const cats = new Set(
      customProducts.map((p) => p.category).filter((c): c is string => Boolean(c))
    );
    return Array.from(cats).sort();
  }, [customProducts]);

  // Filter products
  const filteredBw = useMemo(() => {
    return betterwareProducts.filter((p) => {
      if (selectedBwCategory && p.productType !== selectedBwCategory) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          p.title.toLowerCase().includes(query) ||
          p.sku.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [betterwareProducts, selectedBwCategory, searchQuery]);

  const filteredTp = useMemo(() => {
    return customProducts.filter((p) => {
      if (selectedTpCategory && p.category !== selectedTpCategory) return false;
      if (searchQuery) {
        return p.title.toLowerCase().includes(searchQuery.toLowerCase());
      }
      return true;
    });
  }, [customProducts, selectedTpCategory, searchQuery]);

  return (
    <>
      <div className="fixed inset-0 z-0 grid-pattern-bg pointer-events-none"></div>
      <div className="flex flex-col gap-6 relative z-10">
        {/* Tabs */}
      <div className="flex gap-4 justify-center w-full max-w-sm mx-auto">
        <CartoonButton
          label="Betterware"
          onClick={() => setSection("betterware")}
          color={isBetterware ? "bg-[#1a4b8c] text-white" : "bg-white text-gray-700"}
          className="flex-1"
        />
        <CartoonButton
          label="Tienda"
          onClick={() => setSection("tienda")}
          color={!isBetterware ? "bg-[#019d71] text-white" : "bg-white text-gray-700"}
          className="flex-1"
        />
      </div>

      {/* Search */}
      <div className="searchbar-group mx-auto max-w-md w-full">
        <Search className="searchbar-icon transition-colors" />
        <input
          type="text"
          placeholder={
            isBetterware
              ? "Buscar por nombre o SKU..."
              : "Buscar por nombre..."
          }
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="searchbar-input"
        />
      </div>

      {/* Categories */}
      <div className="max-w-7xl mx-auto w-full">
        {isBetterware ? (
          <CategoryChips
            categories={bwCategories}
            selectedCategory={selectedBwCategory}
            onSelectCategory={setSelectedBwCategory}
          />
        ) : (
          <CategoryChips
            categories={tpCategories}
            selectedCategory={selectedTpCategory}
            onSelectCategory={setSelectedTpCategory}
          />
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 mt-4">
        {isBetterware ? (
          filteredBw.length > 0 ? (
            filteredBw.map((p, index) => (
              <ProductCard
                key={p.sku}
                id={p.sku}
                title={p.title}
                image={p.image}
                price={p.price}
                originalPrice={p.originalPrice}
                stock={p.stock}
                variant="betterware"
                priority={index < 6}
              />
            ))
          ) : (
            <div className="col-span-full py-12 flex flex-col items-center justify-center text-gray-500">
              <span className="text-4xl mb-4">🔍</span>
              <p className="text-lg font-medium">No se encontraron productos</p>
              <p className="text-sm">Intenta con otra búsqueda o categoría</p>
            </div>
          )
        ) : filteredTp.length > 0 ? (
          filteredTp.map((p, index) => (
            <ProductCard
              key={p.id}
              id={p.id.toString()}
              title={p.title}
              image={p.image}
              price={p.price}
              stock={p.stock}
              variant="tienda"
              priority={index < 6}
            />
          ))
        ) : (
          <div className="col-span-full py-12 flex flex-col items-center justify-center text-gray-500">
            <span className="text-4xl mb-4">🔍</span>
            <p className="text-lg font-medium">No se encontraron productos</p>
            <p className="text-sm">Intenta con otra búsqueda o categoría</p>
          </div>
        )}
      </div>
    </div>
    </>
  );
}
