import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
})

export async function POST(req: NextRequest) {
  try {
    const { action, amount, courseId } = await req.json()

    // Check if environment variables are set
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({
        success: false,
        message: "STRIPE_SECRET_KEY no configurada"
      })
    }

    switch (action) {
      case "connection":
        // Test basic connection by retrieving account info
        try {
          const account = await stripe.accounts.retrieve()
          
          return NextResponse.json({
            success: true,
            message: "Conexión exitosa con Stripe",
            data: {
              accountId: account.id,
              country: account.country,
              defaultCurrency: account.default_currency,
              chargesEnabled: account.charges_enabled
            }
          })
        } catch (error) {
          return NextResponse.json({
            success: false,
            message: `Error de conexión con Stripe: ${(error as Error).message}`
          })
        }

      case "create_payment":
        // Test creating a payment intent
        try {
          const paymentIntent = await stripe.paymentIntents.create({
            amount: amount * 100, // Convert to cents
            currency: "usd",
            metadata: {
              course_id: courseId,
              test: "true"
            },
          })

          return NextResponse.json({
            success: true,
            message: "Payment Intent creado exitosamente",
            data: {
              id: paymentIntent.id,
              amount: paymentIntent.amount,
              currency: paymentIntent.currency,
              status: paymentIntent.status,
              clientSecret: paymentIntent.client_secret
            }
          })
        } catch (error) {
          return NextResponse.json({
            success: false,
            message: `Error creando Payment Intent: ${(error as Error).message}`
          })
        }

      case "list_products":
        // Test listing products
        try {
          const products = await stripe.products.list({ limit: 5 })
          
          return NextResponse.json({
            success
