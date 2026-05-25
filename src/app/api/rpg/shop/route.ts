import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const prisma = getPrisma();
    const userId = session.user.id;

    const [items, inventory] = await Promise.all([
      prisma.shopItem.findMany({ where: { isActive: true }, orderBy: { createdAt: "desc" } }),
      prisma.playerInventory.findMany({
        where: { userId },
        include: { item: true },
      }),
    ]);

    const itemsWithOwnership = items.map((item) => {
      const inv = inventory.find((i) => i.itemId === item.id);
      return {
        ...item,
        owned: !!inv,
        quantity: inv?.quantity ?? 0,
        isEquipped: inv?.isEquipped ?? false,
        inventoryId: inv?.id ?? null,
      };
    });

    return NextResponse.json({ success: true, data: { items: itemsWithOwnership, inventory } });
  } catch (error) {
    console.error("Error fetching shop:", error);
    return NextResponse.json({ error: "Failed to fetch shop" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const prisma = getPrisma();
    const userId = session.user.id;
    const body = await request.json();
    const { itemId } = body;

    if (!itemId) {
      return NextResponse.json({ error: "itemId is required" }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const item = await tx.shopItem.findUnique({ where: { id: itemId } });
      if (!item || !item.isActive) {
        throw new Error("Item not found");
      }

      const profile = await tx.playerProfile.findUnique({ where: { userId } });
      if (!profile) {
        throw new Error("Player profile not found");
      }

      if (profile.coins < item.price) {
        throw new Error("Not enough coins");
      }

      const existing = await tx.playerInventory.findUnique({
        where: { userId_itemId: { userId, itemId } },
      });

      if (existing) {
        throw new Error("Item already owned");
      }

      const inventoryEntry = await tx.playerInventory.create({
        data: { userId, itemId },
      });

      const updatedProfile = await tx.playerProfile.update({
        where: { userId, coins: { gte: item.price } },
        data: { coins: { decrement: item.price } },
      });

      return { inventory: inventoryEntry, coins: updatedProfile.coins };
    });

    return NextResponse.json(
      { success: true, data: result },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Error buying item:", error);
    const err = error as { message?: string; code?: string };
    if (err?.message === "Item not found") {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }
    if (err?.message === "Player profile not found") {
      return NextResponse.json({ error: "Player profile not found" }, { status: 404 });
    }
    if (err?.message === "Not enough coins") {
      return NextResponse.json({ error: "Not enough coins" }, { status: 400 });
    }
    if (err?.message === "Item already owned") {
      return NextResponse.json({ error: "Item already owned" }, { status: 400 });
    }
    if (err?.code === "P2002") {
      return NextResponse.json({ error: "Item already owned" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to buy item" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const prisma = getPrisma();
    const userId = session.user.id;
    const body = await request.json();
    const { itemId, action } = body;

    if (!itemId || action !== "equip") {
      return NextResponse.json({ error: "itemId and action='equip' are required" }, { status: 400 });
    }

    const inventory = await prisma.playerInventory.findUnique({
      where: { userId_itemId: { userId, itemId } },
    });

    if (!inventory) {
      return NextResponse.json({ error: "Item not owned" }, { status: 404 });
    }

    const result = await prisma.$transaction(async (tx) => {
      await tx.playerInventory.updateMany({
        where: { userId, isEquipped: true },
        data: { isEquipped: false },
      });

      return tx.playerInventory.update({
        where: { id: inventory.id },
        data: { isEquipped: true },
      });
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Error equipping item:", error);
    return NextResponse.json({ error: "Failed to equip item" }, { status: 500 });
  }
}
