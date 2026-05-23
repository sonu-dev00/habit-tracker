import { NextRequest, NextResponse } from "next/server";
import { handleSubscriptionChange, constructWebhookEvent } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing stripe-signature header" },
        { status: 400 }
      );
    }

    const event = constructWebhookEvent(body, signature);

    const eventId = event.id;
    const existing = await prisma.auditLog.findFirst({
      where: { action: "STRIPE_WEBHOOK", entityId: eventId },
    });
    if (existing) {
      return NextResponse.json({ received: true, duplicate: true });
    }

    await prisma.auditLog.create({
      data: {
        action: "STRIPE_WEBHOOK",
        entity: "Stripe",
        entityId: eventId,
        metadata: { type: event.type },
      },
    });

    await handleSubscriptionChange(event);

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook error:", error);
    return NextResponse.json(
      { error: "Webhook error" },
      { status: 400 }
    );
  }
}
