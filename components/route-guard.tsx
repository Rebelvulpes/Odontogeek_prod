"use client"

import type React from "react"

import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

interface RouteGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
  requiredRole?: "admin" | "student"
  redirectTo?: string
}

export function RouteGuard({
  children,
  requireAuth = false,
  requiredRole,
  redirectTo = "/auth/login",
}: RouteGuardProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return

    // Si requiere autenticación y no hay usuario
    if (requireAuth && !user) {
      router.push(redirectTo)
      return
    }

    // Si requiere un rol específico y el usuario no lo tiene
    if (requiredRole && user && user.role !== requiredRole) {
      if (user.role === "admin") {
        router.push("/admin")
      } else if (user.role === "student") {
        router.push("/dashboard")
      } else {
        router.push("/")
      }
      return
    }
  }, [user, loading, requireAuth, requiredRole, redirectTo, router])

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    )
  }

  // Si requiere autenticación y no hay usuario, no mostrar nada (se redirige)
  if (requireAuth && !user) {
    return null
  }

  // Si requiere un rol específico y el usuario no lo tiene, no mostrar nada (se redirige)
  if (requiredRole && user && user.role !== requiredRole) {
    return null
  }

  return <>{children}</>
}
