import { loadStripe } from "@stripe/stripe-js"

const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!

if (!stripePublishableKey) {
  throw new Error("Missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY")
}

export const stripePromise = loadStripe(stripePublishableKey)

// Helper functions for Stripe operations
export const stripeHelpers = {
  // Create payment intent
  async createPaymentIntent(amount: number, courseId: string, userId?: string) {
    const response = await fetch("/api/create-payment-intent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount,
        courseId,
        userId,
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to create payment intent")
    }

    return response.json()
  },

  // Confirm payment
  async confirmPayment(clientSecret: string, paymentMethod: any) {
    const stripe = await stripePromise

    if (!stripe) {
      throw new Error("Stripe not loaded")
    }

    return stripe.confirmCardPayment(clientSecret, {
      payment_method: paymentMethod,
    })
  },
}
