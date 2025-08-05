import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
})

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get("stripe-signature")!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret)
  } catch (err) {
    console.error("Webhook signature verification failed:", err)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  // Manejar el evento de pago completado
  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object as Stripe.PaymentIntent

    try {
      // Aquí implementarías la lógica para:
      // 1. Actualizar el estado del pago en la base de datos
      // 2. Inscribir automáticamente al usuario en el curso
      // 3. Enviar email de confirmación

      console.log("Pago completado:", paymentIntent.id)

      // Ejemplo de lógica de inscripción automática
      const courseId = paymentIntent.metadata.course_id
      const userId = paymentIntent.metadata.user_id

      if (courseId && userId) {
        // Actualizar pago en base de datos
        // await updatePaymentStatus(paymentIntent.id, 'completed')

        // Inscribir usuario en el curso
        // await enrollUserInCourse(userId, courseId)

        console.log(`Usuario ${userId} inscrito en curso ${courseId}`)
      }
    } catch (error) {
      console.error("Error procesando pago:", error)
      return NextResponse.json({ error: "Error interno" }, { status: 500 })
    }
  }

  return NextResponse.json({ received: true })
}
