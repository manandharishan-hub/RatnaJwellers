import Stripe from "stripe";

const stripeSecret = process.env.STRIPE_SECRET_KEY;

if (!stripeSecret) {
  throw new Error("STRIPE_SECRET_KEY is not defined in environment variables");
}

export const stripe = new Stripe(stripeSecret, {
  apiVersion: "2022-11-15",
});

export async function createPaymentIntent(amount: number, metadata: Record<string, string> = {}) {
  return stripe.paymentIntents.create({
    amount,
    currency: "usd",
    automatic_payment_methods: { enabled: true },
    metadata,
  });
}
