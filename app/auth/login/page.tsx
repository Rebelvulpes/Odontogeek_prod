"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, LogIn, AlertCircle } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    console.log("=== CLIENT LOGIN ATTEMPT ===")
    console.log("Email:", email)
    console.log("Password length:", password.length)
    console.log("Timestamp:", new Date().toISOString())

    try {
      console.log("Sending login request...")

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password: password,
        }),
      })

      console.log("Response received:")
      console.log("Status:", response.status)
      console.log("Status Text:", response.statusText)
      console.log("Content-Type:", response.headers.get("content-type"))

      // Check if response is JSON
      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        console.error("❌ Response is not JSON")
        console.error("Content-Type:", contentType)

        // Try to get the text response for debugging
        const textResponse = await response.text()
        console.error("Response text:", textResponse.substring(0, 500))

        setError("Error del servidor - respuesta no válida")
        return
      }

      let result
      try {
        result = await response.json()
        console.log("Parsed JSON result:", result)
      } catch (jsonError) {
        console.error("❌ JSON parsing failed:", jsonError)

        // Try to get the text response for debugging
        const textResponse = await response.text()
        console.error("Response text that failed to parse:", textResponse.substring(0, 500))

        setError("Error del servidor - respuesta JSON inválida")
        return
      }

      if (result.success) {
        console.log("✅ Login successful")
        console.log("User:", result.user)
        console.log("Redirect to:", result.redirectTo)

        // Redirect based on user role
        if (result.redirectTo) {
          router.push(result.redirectTo)
        } else if (result.user?.role === "admin") {
          router.push("/admin")
        } else {
          router.push("/dashboard")
        }
      } else {
        console.log("❌ Login failed:", result.message)
        setError(result.message || "Error de login")

        // Show hint if available
        if (result.hint) {
          console.log("💡 Hint:", result.hint)
        }
      }
    } catch (error) {
      console.error("❌ Login error:", error)
      setError("Error de conexión. Verifica tu conexión a internet.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Iniciar Sesión</CardTitle>
          <CardDescription className="text-center">Ingresa tus credenciales para acceder a tu cuenta</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  Iniciando sesión...
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4 mr-2" />
                  Iniciar Sesión
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <p className="text-gray-600">
              ¿No tienes una cuenta?{" "}
              <Link href="/auth/register" className="text-blue-600 hover:underline">
                Regístrate aquí
              </Link>
            </p>
          </div>

          {/* Debug info for development */}
          {process.env.NODE_ENV === "development" && (
            <div className="mt-4 p-3 bg-gray-100 rounded-md text-xs">
              <p className="font-semibold mb-2">Cuentas de prueba:</p>
              <p>• mendozaij88@gmail.com / test123 (estudiante)</p>
              <p>• paying.student@test.com / test123 (estudiante)</p>
              <p className="mt-2 text-gray-600">Contraseñas de recuperación: test123, password123, admin123</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
