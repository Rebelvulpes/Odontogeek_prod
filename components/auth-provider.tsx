"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Navigation } from "@/components/navigation"

interface User {
  id: string
  email: string
  name: string
  role: string
}

interface AuthContextType {
  user: User | null
  login: (userData: User) => void
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  // Rutas que requieren autenticación obligatoria
  const protectedRoutes = ["/dashboard", "/admin", "/settings"]

  // Rutas que requieren rol admin
  const adminRoutes = ["/admin"]

  // Rutas de autenticación (no mostrar navegación)
  const authRoutes = ["/auth/login", "/auth/register", "/setup", "/setup-admin", "/test"]

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/me", {
        credentials: "include",
      })

      if (response.ok) {
        const userData = await response.json()
        setUser(userData.user)
      } else {
        setUser(null)
        // Solo redirigir al login si está en una ruta protegida
        if (protectedRoutes.some((route) => pathname.startsWith(route))) {
          router.push("/auth/login")
        }
      }
    } catch (error) {
      console.error("Error checking auth:", error)
      setUser(null)
      // Solo redirigir al login si está en una ruta protegida
      if (protectedRoutes.some((route) => pathname.startsWith(route))) {
        router.push("/auth/login")
      }
    } finally {
      setLoading(false)
    }
  }

  const login = (userData: User) => {
    setUser(userData)
  }

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      })
    } catch (error) {
      console.error("Error logging out:", error)
    } finally {
      setUser(null)
      // Solo redirigir al login si está en una ruta protegida
      if (protectedRoutes.some((route) => pathname.startsWith(route))) {
        router.push("/auth/login")
      } else {
        // Si está en una página pública, simplemente recargar para actualizar la UI
        window.location.reload()
      }
    }
  }

  // Verificar permisos de rutas
  useEffect(() => {
    if (!loading) {
      // Si está en una ruta protegida y no está autenticado
      if (protectedRoutes.some((route) => pathname.startsWith(route)) && !user) {
        router.push("/auth/login")
        return
      }

      // Si está en una ruta de admin y no es admin
      if (user && adminRoutes.some((route) => pathname.startsWith(route)) && user.role !== "admin") {
        router.push("/dashboard")
        return
      }
    }
  }, [user, pathname, loading])

  // Mostrar loading solo en rutas protegidas
  if (loading && protectedRoutes.some((route) => pathname.startsWith(route))) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  // No mostrar navegación en rutas de autenticación y setup
  const showNavigation = !authRoutes.some((route) => pathname.startsWith(route))

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {showNavigation && <Navigation user={user} />}
      <main>{children}</main>
    </AuthContext.Provider>
  )
}
