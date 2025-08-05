import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
})

export async function POST(req: NextRequest) {
  try {
    const { courseId, userId, amount } = await req.json()

    // Crear Payment Intent con Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Stripe usa centavos
      currency: "usd",
      metadata: {
        course_id: courseId,
        user_id: userId,
      },
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    })
  } catch (error) {
    console.error("Error creando Payment Intent:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
