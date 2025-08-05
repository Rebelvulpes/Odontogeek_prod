"use client"

import type React from "react"

import { useState } from "react"
import { loadStripe } from "@stripe/stripe-js"
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface CheckoutFormProps {
  courseId: string
  userId: string
  amount: number
  onSuccess: () => void
}

function CheckoutForm({ courseId, userId, amount, onSuccess }: CheckoutFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Crear Payment Intent
      const response = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          courseId,
          userId,
          amount,
        }),
      })

      const { clientSecret } = await response.json()

      // Confirmar el pago
      const { error: stripeError } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
        },
      })

      if (stripeError) {
        setError(stripeError.message || "Error procesando el pago")
      } else {
        onSuccess()
      }
    } catch (err) {
      setError("Error procesando el pago")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Información de Pago</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-4 border rounded-md">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: "16px",
                    color: "#424770",
                    "::placeholder": {
                      color: "#aab7c4",
                    },
                  },
                },
              }}
            />
          </div>

          {error && <div className="text-red-600 text-sm">{error}</div>}

          <Button type="submit" disabled={!stripe || isLoading} className="w-full">
            {isLoading ? "Procesando..." : `Pagar $${amount}`}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

interface StripeCheckoutProps {
  courseId: string
  userId: string
  amount: number
  onSuccess: () => void
}

export function StripeCheckout({ courseId, userId, amount, onSuccess }: StripeCheckoutProps) {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm courseId={courseId} userId={userId} amount={amount} onSuccess={onSuccess} />
    </Elements>
  )
}
