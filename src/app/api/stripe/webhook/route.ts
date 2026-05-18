import { NextRequest, NextResponse } from "next/server";
import { handleSubscriptionChange, constructWebhookEvent } from "@/lib/stripe";

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
