"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Database, CreditCard, AlertCircle } from "lucide-react"
import { initializeDatabase } from "@/lib/supabase"

export default function SetupPage() {
  const [setupStatus, setSetupStatus] = useState({
    database: false,
    stripe: false,
    loading: false,
  })

  const checkStripeConfig = () => {
    const hasPublishableKey = !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    const hasSecretKey = !!process.env.STRIPE_SECRET_KEY
    const hasWebhookSecret = !!process.env.STRIPE_WEBHOOK_SECRET

    return hasPublishableKey && hasSecretKey && hasWebhookSecret
  }

  const handleDatabaseSetup = async () => {
    setSetupStatus((prev) => ({ ...prev, loading: true }))

    try {
      await initializeDatabase()
      setSetupStatus((prev) => ({ ...prev, database: true, loading: false }))
    } catch (error) {
      console.error("Error configurando base de datos:", error)
      setSetupStatus((prev) => ({ ...prev, loading: false }))
    }
  }

  const handleStripeCheck = () => {
    const isConfigured = checkStripeConfig()
    setSetupStatus((prev) => ({ ...prev, stripe: isConfigured }))
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="text-center mb-8">
          <img src="/images/odontogeek-logo-new.png" alt="OdontoGeek" className="h-12 w-auto mx-auto mb-2" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Configuración de DentalAcademy</h1>
          <p className="text-gray-600">Completa estos pasos para configurar tu plataforma</p>
        </div>

        <div className="space-y-6">
          {/* Configuración de Base de Datos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="w-5 h-5 mr-2" />
                Base de Datos
                {setupStatus.database && (
                  <Badge className="ml-2 bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Configurado
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>Inicializar las tablas y datos de ejemplo en Supabase</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Antes de continuar:</h4>
                  <ol className="text-sm text-blue-800 space-y-1">
                    <li>
                      1. Crea un proyecto en{" "}
                      <a href="https://supabase.com" className="underline" target="_blank" rel="noreferrer">
                        supabase.com
                      </a>
                    </li>
                    <li>2. Ve a Settings → API y copia las claves</li>
                    <li>3. Añade las variables de entorno en Vercel:</li>
                    <li className="ml-4">• NEXT_PUBLIC_SUPABASE_URL</li>
                    <li className="ml-4">• NEXT_PUBLIC_SUPABASE_ANON_KEY</li>
                  </ol>
                </div>

                <Button onClick={handleDatabaseSetup} disabled={setupStatus.loading} className="w-full">
                  {setupStatus.loading ? "Configurando..." : "Configurar Base de Datos"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Configuración de Stripe */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="w-5 h-5 mr-2" />
                Stripe (Pagos)
                {setupStatus.stripe && (
                  <Badge className="ml-2 bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Configurado
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>Configurar las claves de Stripe para procesar pagos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h4 className="font-medium text-yellow-900 mb-2">Pasos para configurar Stripe:</h4>
                  <ol className="text-sm text-yellow-800 space-y-1">
                    <li>
                      1. Crea una cuenta en{" "}
                      <a href="https://stripe.com" className="underline" target="_blank" rel="noreferrer">
                        stripe.com
                      </a>
                    </li>
                    <li>2. Ve a Developers → API keys</li>
                    <li>3. Copia las claves y añádelas en Vercel:</li>
                    <li className="ml-4">• STRIPE_SECRET_KEY (sk_test_...)</li>
                    <li className="ml-4">• NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY (pk_test_...)</li>
                    <li>4. Ve a Developers → Webhooks</li>
                    <li>5. Crea un endpoint con tu URL de Vercel</li>
                    <li>6. Añade: STRIPE_WEBHOOK_SECRET (whsec_...)</li>
                  </ol>
                </div>

                <Button onClick={handleStripeCheck} variant="outline" className="w-full bg-transparent">
                  Verificar Configuración de Stripe
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Estado General */}
          <Card>
            <CardHeader>
              <CardTitle>Estado de la Configuración</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Base de Datos</span>
                  {setupStatus.database ? (
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Listo
                    </Badge>
                  ) : (
                    <Badge variant="secondary">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Pendiente
                    </Badge>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <span>Stripe</span>
                  {setupStatus.stripe ? (
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Listo
                    </Badge>
                  ) : (
                    <Badge variant="secondary">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Pendiente
                    </Badge>
                  )}
                </div>
              </div>

              {setupStatus.database && setupStatus.stripe && (
                <div className="mt-6 p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                    <span className="font-medium text-green-900">¡Configuración completa!</span>
                  </div>
                  <p className="text-sm text-green-700 mt-1">
                    Tu plataforma está lista para usar. Puedes ir al{" "}
                    <a href="/dashboard" className="underline">
                      dashboard
                    </a>{" "}
                    o{" "}
                    <a href="/admin" className="underline">
                      panel de administrador
                    </a>
                    .
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
