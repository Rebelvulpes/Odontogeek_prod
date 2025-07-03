"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, Database, CreditCard, Loader2, AlertTriangle } from "lucide-react"

interface TestResult {
  success: boolean
  message: string
  data?: any
}

export default function TestPage() {
  const [supabaseStatus, setSupabaseStatus] = useState<TestResult | null>(null)
  const [stripeStatus, setStripeStatus] = useState<TestResult | null>(null)
  const [loading, setLoading] = useState(false)

  // Test data
  const [testEmail, setTestEmail] = useState("test@ejemplo.com")
  const [testAmount, setTestAmount] = useState("299")

  // Test Supabase connection
  const testSupabase = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/test/supabase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "connection" }),
      })

      const result = await response.json()
      setSupabaseStatus(result)
    } catch (error) {
      setSupabaseStatus({
        success: false,
        message: "Error de conexión: " + (error as Error).message,
      })
    } finally {
      setLoading(false)
    }
  }

  // Test Stripe connection
  const testStripe = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/test/stripe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "connection" }),
      })

      const result = await response.json()
      setStripeStatus(result)
    } catch (error) {
      setStripeStatus({
        success: false,
        message: "Error de conexión: " + (error as Error).message,
      })
    } finally {
      setLoading(false)
    }
  }

  // Test creating a user in Supabase
  const testCreateUser = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/test/supabase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_user",
          email: testEmail,
          firstName: "Test",
          lastName: "User",
        }),
      })

      const result = await response.json()
      setSupabaseStatus(result)
    } catch (error) {
      setSupabaseStatus({
        success: false,
        message: "Error creando usuario: " + (error as Error).message,
      })
    } finally {
      setLoading(false)
    }
  }

  // Test creating a payment intent with Stripe
  const testCreatePayment = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/test/stripe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_payment",
          amount: Number.parseInt(testAmount),
          courseId: "test-course-1",
        }),
      })

      const result = await response.json()
      setStripeStatus(result)
    } catch (error) {
      setStripeStatus({
        success: false,
        message: "Error creando pago: " + (error as Error).message,
      })
    } finally {
      setLoading(false)
    }
  }

  // Check environment variables on load
  useEffect(() => {
    const checkEnvVars = () => {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      const stripeKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

      if (!supabaseUrl || !supabaseKey) {
        setSupabaseStatus({
          success: false,
          message: "Variables de entorno de Supabase no configuradas",
        })
      }

      if (!stripeKey) {
        setStripeStatus({
          success: false,
          message: "Variables de entorno de Stripe no configuradas",
        })
      }
    }

    checkEnvVars()
  }, [])

  // Agregar función para corregir la base de datos y mejorar las pruebas
  const fixDatabase = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/setup/fix-database", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })

      const result = await response.json()
      setSupabaseStatus({
        success: result.success,
        message: result.success
          ? "Base de datos corregida exitosamente"
          : "Error corrigiendo base de datos: " + result.error,
        data: result.results,
      })
    } catch (error) {
      setSupabaseStatus({
        success: false,
        message: "Error corrigiendo base de datos: " + (error as Error).message,
      })
    } finally {
      setLoading(false)
    }
  }

  // También agregar una función para limpiar usuarios de prueba:
  const cleanTestUsers = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/test/supabase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "clean_test_users" }),
      })

      const result = await response.json()
      setSupabaseStatus(result)
    } catch (error) {
      setSupabaseStatus({
        success: false,
        message: "Error limpiando usuarios de prueba: " + (error as Error).message,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Verificación de Servicios - OdontoGeek</h1>
          <img src="/images/odontogeek-logo-new.png" alt="OdontoGeek" className="h-8 w-auto" />
          <p className="text-gray-600">Prueba las conexiones con Supabase y Stripe</p>
        </div>

        {/* Status Overview */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="w-5 h-5 mr-2" />
                Supabase
                {supabaseStatus && (
                  <Badge
                    className={`ml-2 ${supabaseStatus.success ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                  >
                    {supabaseStatus.success ? (
                      <CheckCircle className="w-3 h-3 mr-1" />
                    ) : (
                      <XCircle className="w-3 h-3 mr-1" />
                    )}
                    {supabaseStatus.success ? "Conectado" : "Error"}
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>Base de datos y autenticación</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button onClick={testSupabase} disabled={loading} className="w-full">
                  {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Probar Conexión
                </Button>

                <Button onClick={fixDatabase} disabled={loading} variant="outline" className="w-full bg-transparent">
                  {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Corregir Base de Datos
                </Button>

                {supabaseStatus && (
                  <Alert
                    className={supabaseStatus.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}
                  >
                    <AlertDescription className={supabaseStatus.success ? "text-green-800" : "text-red-800"}>
                      {supabaseStatus.message}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="w-5 h-5 mr-2" />
                Stripe
                {stripeStatus && (
                  <Badge
                    className={`ml-2 ${stripeStatus.success ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                  >
                    {stripeStatus.success ? (
                      <CheckCircle className="w-3 h-3 mr-1" />
                    ) : (
                      <XCircle className="w-3 h-3 mr-1" />
                    )}
                    {stripeStatus.success ? "Conectado" : "Error"}
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>Procesamiento de pagos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button onClick={testStripe} disabled={loading} className="w-full">
                  {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Probar Conexión
                </Button>

                {stripeStatus && (
                  <Alert className={stripeStatus.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                    <AlertDescription className={stripeStatus.success ? "text-green-800" : "text-red-800"}>
                      {stripeStatus.message}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Tests */}
        <Tabs defaultValue="supabase" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="supabase">Pruebas Supabase</TabsTrigger>
            <TabsTrigger value="stripe">Pruebas Stripe</TabsTrigger>
          </TabsList>

          <TabsContent value="supabase" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Pruebas de Supabase</CardTitle>
                <CardDescription>Prueba operaciones básicas con la base de datos</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="testEmail">Email de prueba</Label>
                  <Input
                    id="testEmail"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    placeholder="test@ejemplo.com"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button onClick={testCreateUser} disabled={loading} variant="outline">
                    {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                    Crear Usuario de Prueba
                  </Button>

                  <Button onClick={testSupabase} disabled={loading} variant="outline">
                    {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                    Listar Cursos
                  </Button>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Variables de entorno requeridas:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• NEXT_PUBLIC_SUPABASE_URL</li>
                    <li>• NEXT_PUBLIC_SUPABASE_ANON_KEY</li>
                    <li>• SUPABASE_SERVICE_ROLE_KEY (para operaciones admin)</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stripe" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Pruebas de Stripe</CardTitle>
                <CardDescription>Prueba operaciones de pago y webhooks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="testAmount">Monto de prueba ($)</Label>
                  <Input
                    id="testAmount"
                    value={testAmount}
                    onChange={(e) => setTestAmount(e.target.value)}
                    placeholder="299"
                    type="number"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button onClick={testCreatePayment} disabled={loading} variant="outline">
                    {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                    Crear Payment Intent
                  </Button>

                  <Button onClick={testStripe} disabled={loading} variant="outline">
                    {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                    Verificar Webhooks
                  </Button>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h4 className="font-medium text-yellow-900 mb-2">Variables de entorno requeridas:</h4>
                  <ul className="text-sm text-yellow-800 space-y-1">
                    <li>• NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</li>
                    <li>• STRIPE_SECRET_KEY</li>
                    <li>• STRIPE_WEBHOOK_SECRET</li>
                  </ul>
                </div>

                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Usa las claves de test de Stripe para pruebas. Los números de tarjeta de prueba están disponibles en
                    la documentación de Stripe.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Environment Variables Check */}
        <Card>
          <CardHeader>
            <CardTitle>Estado de Variables de Entorno</CardTitle>
            <CardDescription>Verifica que todas las variables estén configuradas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium">Supabase</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center justify-between">
                    <span>NEXT_PUBLIC_SUPABASE_URL</span>
                    {process.env.NEXT_PUBLIC_SUPABASE_URL ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span>NEXT_PUBLIC_SUPABASE_ANON_KEY</span>
                    {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Stripe</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center justify-between">
                    <span>NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</span>
                    {process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span>STRIPE_SECRET_KEY</span>
                    <Badge variant="secondary">Server-side</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>STRIPE_WEBHOOK_SECRET</span>
                    <Badge variant="secondary">Server-side</Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
