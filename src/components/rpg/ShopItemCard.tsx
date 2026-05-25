"use client";

import { motion } from "framer-motion";
import { Coins, ShoppingCart, Check, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GlassCard } from "@/components/ui/card";
import type { ShopItem, ItemRarity } from "@/types";

const rarityConfig: Record<
  ItemRarity,
  { label: string; color: string; borderGlow: string; textColor: string }
> = {
  COMMON: {
    label: "Common",
    color: "#9ca3af",
    borderGlow: "glow-blue",
    textColor: "text-gray-300",
  },
  UNCOMMON: {
    label: "Uncommon",
    color: "#22c55e",
    borderGlow: "glow-green",
    textColor: "text-green-400",
  },
  RARE: {
    label: "Rare",
    color: "#3b82f6",
    borderGlow: "glow-blue",
    textColor: "text-blue-400",
  },
  EPIC: {
    label: "Epic",
    color: "#a855f7",
    borderGlow: "glow-purple",
    textColor: "text-purple-400",
  },
  LEGENDARY: {
    label: "Legendary",
    color: "#ef4444",
    borderGlow: "glow-red",
    textColor: "text-red-400",
  },
  MYTHIC: {
    label: "Mythic",
    color: "#d946ef",
    borderGlow: "glow-purple",
    textColor: "text-fuchsia-400",
  },
};

const typeIcons: Record<string, string> = {
  COSMETIC: "🎨",
  BOOSTER: "⚡",
  THEME: "🎭",
  AVATAR: "👤",
  SKILL_BOOK: "📖",
  TITLE: "🏆",
  CONSUMABLE: "🧪",
};

export interface ShopItemCardProps {
  item: ShopItem;
  coins?: number;
  owned?: boolean;
  equipped?: boolean;
  onBuy?: (id: string) => void;
  onEquip?: (id: string) => void;
}

export function ShopItemCard({
  item,
  coins = 0,
  owned = false,
  equipped = false,
  onBuy,
  onEquip,
}: ShopItemCardProps) {
  const rarity = rarityConfig[item.rarity] ?? rarityConfig.COMMON;
  const canAfford = coins >= item.price;
  const typeIcon = typeIcons[item.type] ?? "📦";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <GlassCard
        glow
        className={cn(
          "relative overflow-hidden transition-all duration-200 hover:border-white/20",
          rarity.borderGlow
        )}
        style={{
          borderColor: `${rarity.color}30`,
        }}
      >
        <div
          className="absolute top-0 right-0 h-24 w-24 -translate-y-1/2 translate-x-1/2 rounded-full opacity-10"
          style={{ background: rarity.color }}
        />

        <div className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-lg text-lg"
                style={{
                  background: `${rarity.color}15`,
                }}
                aria-hidden="true"
              >
                {typeIcon}
              </div>
              <div className="min-w-0">
                <h4
                  className={cn(
                    "font-semibold truncate",
                    rarity.textColor
                  )}
                >
                  {item.name}
                </h4>
                <p className="mt-0.5 text-xs text-gray-400 line-clamp-2">
                  {item.description}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-2">
            <Badge
              size="sm"
              className="text-[10px]"
              style={{
                background: `${rarity.color}20`,
                color: rarity.color,
              }}
            >
              <Sparkles className="mr-1 h-3 w-3" />
              {rarity.label}
            </Badge>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <span className="flex items-center gap-1 text-sm text-yellow-400">
              <Coins className="h-4 w-4" />
              {item.price.toLocaleString()}
            </span>

            {owned ? (
              equipped ? (
                <Badge variant="success" size="sm">
                  <Check className="mr-1 h-3 w-3" />
                  Equipped
                </Badge>
              ) : (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => onEquip?.(item.id)}
                >
                  Equip
                </Button>
              )
            ) : (
              <Button
                size="sm"
                variant="primary"
                disabled={!canAfford}
                onClick={() => onBuy?.(item.id)}
              >
                <ShoppingCart className="h-3.5 w-3.5" />
                Buy
              </Button>
            )}
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}
