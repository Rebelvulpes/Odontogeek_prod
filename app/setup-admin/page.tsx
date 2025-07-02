"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Eye, EyeOff, Shield, User, Mail, Lock, CheckCircle, Database, Settings } from "lucide-react"

export default function SetupAdminPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const [setupStep, setSetupStep] = useState(1)
  const [dbConfigured, setDbConfigured] = useState(false)
  const router = useRouter()

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  // Paso 1: Configurar base de datos
  const setupDatabase = async () => {
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/setup/supabase-admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const result = await response.json()

      if (result.success) {
        setDbConfigured(true)
        setSetupStep(2)
      } else {
        setError(result.message || "Error configurando base de datos")
      }
    } catch (err) {
      setError("Error de conexión. Verifica que Supabase esté configurado correctamente.")
    } finally {
      setLoading(false)
    }
  }

  // Paso 2: Crear cuenta de administrador
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    // Validaciones
    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden")
      setLoading(false)
      return
    }

    if (formData.password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres")
      setLoading(false)
      return
    }

    try {
      const response = await fetch("/api/setup/create-admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
        }),
      })

      const result = await response.json()

      if (result.success) {
        setSuccess(true)
        setTimeout(() => {
          router.push("/auth/login?admin=true")
        }, 3000)
      } else {
        setError(result.message || "Error creando cuenta de administrador")
      }
    } catch (err) {
      setError("Error de conexión. Intenta nuevamente.")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Todo Listo! 🎉</h2>
            <p className="text-gray-600 mb-4">
              Tu cuenta de administrador ha sido creada exitosamente y la base de datos está configurada.
            </p>
            <p className="text-sm text-gray-500 mb-4">Serás redirigido al login de administrador en unos segundos...</p>
            <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <img src="/images/odontogeek-logo.png" alt="OdontoGeek" className="max-w-md max-h-56 -m-64" />
          </div>
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Shield className="w-6 h-6 text-blue-600" />
            <CardTitle className="text-2xl">Configuración Inicial de OdontoGeek</CardTitle>
          </div>
          <CardDescription>Configura tu plataforma de cursos dentales paso a paso</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={setupStep.toString()} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="1" disabled={setupStep < 1}>
                <Database className="w-4 h-4 mr-2" />
                Base de Datos
              </TabsTrigger>
              <TabsTrigger value="2" disabled={setupStep < 2}>
                <User className="w-4 h-4 mr-2" />
                Cuenta Admin
              </TabsTrigger>
            </TabsList>

            <TabsContent value="1" className="space-y-6 mt-6">
              <div className="text-center space-y-4">
                <Database className="w-16 h-16 text-blue-500 mx-auto" />
                <h3 className="text-xl font-semibold">Configurar Base de Datos</h3>
                <p className="text-gray-600">
                  Primero necesitamos configurar las tablas de administración en tu base de datos de Supabase.
                </p>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">¿Qué se va a crear?</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>✓ Tabla de logs de administración (para auditoría)</li>
                  <li>✓ Tabla de sesiones de administrador (para seguridad)</li>
                  <li>✓ Tabla de permisos (para control de acceso)</li>
                  <li>✓ Índices para optimizar el rendimiento</li>
                </ul>
              </div>

              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-800">{error}</AlertDescription>
                </Alert>
              )}

              <Button onClick={setupDatabase} disabled={loading || dbConfigured} className="w-full" size="lg">
                {loading ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    Configurando Base de Datos...
                  </>
                ) : dbConfigured ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Base de Datos Configurada
                  </>
                ) : (
                  <>
                    <Settings className="w-4 h-4 mr-2" />
                    Configurar Base de Datos
                  </>
                )}
              </Button>
            </TabsContent>

            <TabsContent value="2" className="space-y-6 mt-6">
              <div className="text-center space-y-4">
                <User className="w-16 h-16 text-green-500 mx-auto" />
                <h3 className="text-xl font-semibold">Crear tu Cuenta de Administrador</h3>
                <p className="text-gray-600">
                  Ahora crea tu cuenta personal de administrador con acceso completo a la plataforma.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">
                      <User className="w-4 h-4 inline mr-1" />
                      Nombre
                    </Label>
                    <Input
                      id="firstName"
                      type="text"
                      placeholder="Tu nombre"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Apellido</Label>
                    <Input
                      id="lastName"
                      type="text"
                      placeholder="Tu apellido"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">
                    <Mail className="w-4 h-4 inline mr-1" />
                    Email Administrativo
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@tudominio.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">
                    <Lock className="w-4 h-4 inline mr-1" />
                    Contraseña
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Mínimo 8 caracteres"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Repite tu contraseña"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    required
                  />
                </div>

                {error && (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertDescription className="text-red-800">{error}</AlertDescription>
                  </Alert>
                )}

                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-2">Permisos de Administrador:</h4>
                  <ul className="text-sm text-green-800 space-y-1">
                    <li>✓ Gestión completa de cursos y lecciones</li>
                    <li>✓ Administración de usuarios y estudiantes</li>
                    <li>✓ Crear y gestionar otros administradores</li>
                    <li>✓ Acceso a reportes y analytics</li>
                    <li>✓ Configuración de pagos y webhooks</li>
                  </ul>
                </div>

                <Button type="submit" className="w-full" disabled={loading} size="lg">
                  {loading ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                      Creando Cuenta...
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4 mr-2" />
                      Crear Cuenta de Administrador
                    </>
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
