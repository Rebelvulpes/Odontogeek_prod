"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"
import Link from "next/link"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      console.log("🔄 Attempting login for:", email)

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      console.log("📡 Response status:", response.status)
      console.log("📡 Response headers:", Object.fromEntries(response.headers.entries()))

      // Check if response is actually JSON
      const contentType = response.headers.get("content-type")
      console.log("📡 Content-Type:", contentType)

      if (!contentType || !contentType.includes("application/json")) {
        console.error("❌ Response is not JSON, content-type:", contentType)

        // Try to get the text response for debugging
        const textResponse = await response.text()
        console.error("❌ Non-JSON response body:", textResponse.substring(0, 500))

        setError("Error del servidor - respuesta inválida. Revisa la consola para más detalles.")
        return
      }

      let data
      try {
        data = await response.json()
        console.log("📦 Response data:", data)
      } catch (jsonError) {
        console.error("❌ JSON parsing error:", jsonError)

        // Try to get the text response for debugging
        const textResponse = await response.text()
        console.error("❌ Raw response that failed to parse:", textResponse.substring(0, 500))

        setError("Error parseando respuesta del servidor. Revisa la consola para más detalles.")
        return
      }

      if (data.success) {
        console.log("✅ Login successful, redirecting to:", data.redirectTo)
        // Force a full page reload to ensure cookie is properly set
        window.location.assign(data.redirectTo || "/dashboard")
      } else {
        console.log("❌ Login failed:", data.message)
        setError(data.message || "Error al iniciar sesión")

        // Show hint if available
        if (data.hint) {
          console.log("💡 Hint:", data.hint)
        }
      }
    } catch (error) {
      console.error("❌ Network/fetch error:", error)

      if (error instanceof TypeError && error.message.includes("Failed to fetch")) {
        setError("Error de conexión. Verifica tu conexión a internet.")
      } else if (error instanceof SyntaxError && error.message.includes("JSON")) {
        setError("Error de formato en la respuesta del servidor.")
      } else {
        setError("Error de conexión. Por favor, intenta de nuevo.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Iniciar Sesión</CardTitle>
          <CardDescription className="text-center">Ingresa tus credenciales para acceder a tu cuenta</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="Tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                "Iniciar Sesión"
              )}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm">
            <span className="text-gray-600">¿No tienes cuenta? </span>
            <Link href="/auth/register" className="text-blue-600 hover:text-blue-500 font-medium">
              Regístrate aquí
            </Link>
          </div>

          <div className="mt-2 text-center text-xs text-gray-500">
            <p>Usuarios de prueba:</p>
            <p>paying.student@test.com / test123</p>
            <p>mendozaij88@gmail.com / admin123</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
