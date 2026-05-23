import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { AppError } from "@/lib/api-error";

function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  return new Stripe(key, {
    apiVersion: "2026-04-22.dahlia",
  });
}

const PRICE_LOOKUP: Record<string, string> = {
  pro_monthly: process.env.STRIPE_PRO_PRICE_ID_MONTHLY || "",
  pro_yearly: process.env.STRIPE_PRO_PRICE_ID_YEARLY || "",
  teams_monthly: process.env.STRIPE_TEAMS_PRICE_ID_MONTHLY || "",
  teams_yearly: process.env.STRIPE_TEAMS_PRICE_ID_YEARLY || "",
};

export async function createCheckoutSession(userId: string, priceKey: string, successUrl?: string, cancelUrl?: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");

  const priceId = PRICE_LOOKUP[priceKey];
  if (!priceId) throw new Error("Invalid price key");

  const session = await getStripe().checkout.sessions.create({
    customer: user.stripeCustomerId || undefined,
    customer_email: user.email || undefined,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    metadata: { userId },
    success_url: successUrl || `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
    subscription_data: {
      metadata: { userId },
    },
  });

  return session;
}

export async function createPortalSession(userId: string, returnUrl?: string): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { subscription: true },
  });

  if (!user?.subscription?.stripeCustomerId) {
    throw new Error("No active subscription found");
  }

  const session = await getStripe().billingPortal.sessions.create({
    customer: user.subscription.stripeCustomerId,
    return_url: returnUrl || `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
  });

  return session.url;
}

export async function handleSubscriptionChange(event: Stripe.Event) {
  const object = event.data.object as any;

  if (event.type === "checkout.session.completed") {
    const session = object as Stripe.Checkout.Session;
    const userId = session.metadata?.userId;
    if (!userId) return;

    const subscriptionId = session.subscription as string;
    const subscription = await getStripe().subscriptions.retrieve(subscriptionId);

    const plan = subscription.items.data[0]?.price?.nickname?.toLowerCase().includes("pro")
      ? "PRO"
      : "TEAMS";

    await prisma.subscription.upsert({
      where: { userId },
      update: {
        stripeSubscriptionId: subscription.id,
        stripeCustomerId: session.customer as string,
        stripePriceId: subscription.items.data[0]?.price.id,
        stripeCurrentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
        plan,
        status: subscription.status,
        cancelAtPeriodEnd: (subscription as any).cancel_at_period_end,
      },
      create: {
        userId,
        stripeSubscriptionId: subscription.id,
        stripeCustomerId: session.customer as string,
        stripePriceId: subscription.items.data[0]?.price.id,
        stripeCurrentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
        plan,
        status: subscription.status,
      },
    });

    await prisma.user.update({
      where: { id: userId },
      data: { stripeCustomerId: session.customer as string },
    });
  }

  if (event.type === "invoice.payment_succeeded") {
    const invoice = object as Stripe.Invoice & { payment_intent?: string; subscription?: string };
    const subscriptionId = invoice.subscription;
    const customerId = invoice.customer as string;

    if (subscriptionId) {
      const subscription = await getStripe().subscriptions.retrieve(subscriptionId as string);
      const plan = subscription.items.data[0]?.price?.nickname?.toLowerCase().includes("pro")
        ? "PRO"
        : "TEAMS";

      await prisma.subscription.updateMany({
        where: { stripeSubscriptionId: subscriptionId as string },
        data: {
          stripeCurrentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
          status: subscription.status,
          plan,
        },
      });

      await prisma.paymentHistory.create({
        data: {
          userId: (await prisma.subscription.findFirst({
            where: { stripeSubscriptionId: subscriptionId as string },
            select: { userId: true },
          }))?.userId || "",
          stripePaymentIntentId: invoice.payment_intent || "",
          amount: invoice.amount_paid,
          currency: invoice.currency,
          status: "succeeded",
          plan,
        },
      });
    }

    if (!subscriptionId && customerId) {
      const user = await prisma.user.findFirst({
        where: { stripeCustomerId: customerId },
      });
      if (user) {
        await prisma.paymentHistory.create({
          data: {
            userId: user.id,
            stripePaymentIntentId: invoice.payment_intent || "",
            amount: invoice.amount_paid,
            currency: invoice.currency,
            status: "succeeded",
            plan: "unknown",
          },
        });
      }
    }
  }

  if (event.type === "customer.subscription.updated") {
    const subscription = object as Stripe.Subscription;
    const metadata = subscription.metadata as Record<string, string>;

    const userId = metadata?.userId || (
      await prisma.subscription.findFirst({
        where: { stripeSubscriptionId: subscription.id },
        select: { userId: true },
      })
    )?.userId;

    if (!userId) return;

    const plan = subscription.items.data[0]?.price?.nickname?.toLowerCase().includes("pro")
      ? "PRO"
      : "TEAMS";

    await prisma.subscription.updateMany({
      where: { stripeSubscriptionId: subscription.id },
      data: {
        status: subscription.status,
        stripePriceId: subscription.items.data[0]?.price.id,
        stripeCurrentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
        cancelAtPeriodEnd: (subscription as any).cancel_at_period_end,
        plan,
      },
    });
  }

  if (event.type === "customer.subscription.deleted") {
    const subscription = object as Stripe.Subscription;
    await prisma.subscription.updateMany({
      where: { stripeSubscriptionId: subscription.id },
      data: {
        status: "canceled",
        plan: "FREE",
        cancelAtPeriodEnd: false,
      },
    });
  }
}

export async function cancelSubscription(userId: string) {
  const sub = await prisma.subscription.findUnique({
    where: { userId },
  });

  if (!sub?.stripeSubscriptionId) {
    throw new Error("No active subscription found");
  }

  await getStripe().subscriptions.update(sub.stripeSubscriptionId, {
    cancel_at_period_end: true,
  });

  await prisma.subscription.update({
    where: { userId },
    data: { cancelAtPeriodEnd: true },
  });
}

export async function getPrices() {
  const prices = await getStripe().prices.list({
    active: true,
    expand: ["data.product"],
  });

  return prices.data.map((price) => ({
    id: price.id,
    nickname: price.nickname,
    currency: price.currency,
    unitAmount: price.unit_amount,
    recurring: price.recurring,
    product: price.product,
  }));
}

export async function getProducts() {
  const products = await getStripe().products.list({
    active: true,
  });

  return products.data.map((product) => ({
    id: product.id,
    name: product.name,
    description: product.description,
    features: (product as any).features?.map((f: { name: string }) => f.name) || [],
    metadata: product.metadata,
    images: product.images,
  }));
}

export function constructWebhookEvent(payload: string, signature: string): Stripe.Event {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    throw new AppError("STRIPE_WEBHOOK_SECRET is not configured", 500, "WEBHOOK_CONFIG_ERROR");
  }
  return getStripe().webhooks.constructEvent(payload, signature, webhookSecret);
}


