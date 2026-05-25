"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { ShoppingBag, Coins, Filter } from "lucide-react";
import { ShopItemCard } from "@/components/rpg/ShopItemCard";
import { GlassCard } from "@/components/ui/card";
import { useShop, useBuyItem } from "@/lib/hooks/use-rpg";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRPGProfileStore } from "@/store";
import { cn } from "@/lib/utils";
import type { ItemType, ItemRarity } from "@/types";

const CATEGORIES: { label: string; value: ItemType | "ALL" }[] = [
  { label: "All", value: "ALL" },
  { label: "Cosmetics", value: "COSMETIC" },
  { label: "Boosters", value: "BOOSTER" },
  { label: "Themes", value: "THEME" },
  { label: "Avatars", value: "AVATAR" },
  { label: "Skill Books", value: "SKILL_BOOK" },
  { label: "Titles", value: "TITLE" },
];

const RARITIES: { label: string; value: ItemRarity | "ALL" }[] = [
  { label: "All", value: "ALL" },
  { label: "Common", value: "COMMON" },
  { label: "Uncommon", value: "UNCOMMON" },
  { label: "Rare", value: "RARE" },
  { label: "Epic", value: "EPIC" },
  { label: "Legendary", value: "LEGENDARY" },
  { label: "Mythic", value: "MYTHIC" },
];

const stagger = {
  container: { animate: { transition: { staggerChildren: 0.04 } } },
  item: {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
  },
};

export default function ShopPage() {
  const [category, setCategory] = useState<ItemType | "ALL">("ALL");
  const [rarity, setRarity] = useState<ItemRarity | "ALL">("ALL");
  const { data, isLoading, error } = useShop();
  const buyItem = useBuyItem();
  const queryClient = useQueryClient();
  const equipItem = useMutation({
    mutationFn: async (itemId: string) => {
      const res = await fetch("/api/rpg/shop", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, action: "equip" }),
      });
      if (!res.ok) throw new Error("Failed to equip item");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["rpg", "shop"] }),
  });
  const coins = useRPGProfileStore((s) => s.coins);

  const ownedItemIds = useMemo(() => {
    return new Set(data?.inventory?.map((inv) => inv.itemId) ?? []);
  }, [data?.inventory]);

  const equippedItemIds = useMemo(() => {
    return new Set(
      data?.inventory?.filter((inv) => inv.isEquipped).map((inv) => inv.itemId) ?? []
    );
  }, [data?.inventory]);

  const filteredItems = useMemo(() => {
    const items = data?.items;
    if (!items) return [];
    return items.filter((item) => {
      if (category !== "ALL" && item.type !== category) return false;
      if (rarity !== "ALL" && item.rarity !== rarity) return false;
      return true;
    });
  }, [data?.items, category, rarity]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <GlassCard className="p-8 text-center max-w-md">
          <p className="text-red-400 text-lg font-semibold">Failed to load shop</p>
          <p className="text-gray-400 text-sm mt-2">{(error as Error).message}</p>
        </GlassCard>
      </div>
    );
  }

  return (
    <motion.div
      variants={stagger.container}
      initial="initial"
      animate="animate"
      className="space-y-6"
    >
      <motion.div
        variants={stagger.item}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-100 flex items-center gap-2">
            <ShoppingBag className="h-6 w-6 text-yellow-400" />
            Shop
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Spend your hard-earned coins on boosts, cosmetics, and more
          </p>
        </div>
        <GlassCard className="flex items-center gap-3 px-5 py-3">
          <Coins className="h-5 w-5 text-yellow-400" />
          <span className="text-lg font-bold text-gray-100">
            {coins.toLocaleString()}
          </span>
          <span className="text-sm text-gray-500">coins</span>
        </GlassCard>
      </motion.div>

      <motion.div variants={stagger.item} className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setCategory(cat.value)}
              className={cn(
                "rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200",
                category === cat.value
                  ? "bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/20 text-white"
                  : "text-gray-400 hover:text-gray-200 hover:bg-white/5 border border-transparent"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          {RARITIES.map((r) => (
            <button
              key={r.value}
              onClick={() => setRarity(r.value)}
              className={cn(
                "rounded-lg px-3 py-1 text-xs font-medium transition-all duration-200",
                rarity === r.value
                  ? "bg-white/10 text-white border border-white/20"
                  : "text-gray-500 hover:text-gray-300 hover:bg-white/5 border border-transparent"
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
      </motion.div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rpg-panel h-48 animate-pulse">
              <div className="h-full w-full bg-white/5 rounded-lg" />
            </div>
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-500">
          <ShoppingBag className="h-12 w-12 mb-3 opacity-30" />
          <p className="text-lg font-medium">No items found</p>
          <p className="text-sm mt-1">Try changing your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredItems.map((item) => (
            <ShopItemCard
              key={item.id}
              item={item}
              coins={coins}
              owned={ownedItemIds.has(item.id)}
              equipped={equippedItemIds.has(item.id)}
              onBuy={(id) => buyItem.mutate(id)}
              onEquip={(id) => equipItem.mutate(id)}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}
