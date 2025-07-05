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

  // Rutas que no requieren autenticación
  const publicRoutes = ["/auth/login", "/auth/register", "/setup", "/setup-admin", "/test"]

  // Rutas que requieren rol admin
  const adminRoutes = ["/admin"]

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
        // Si no está autenticado y no está en una ruta pública, redirigir al login
        if (!publicRoutes.some((route) => pathname.startsWith(route))) {
          router.push("/auth/login")
        }
      }
    } catch (error) {
      console.error("Error checking auth:", error)
      setUser(null)
      if (!publicRoutes.some((route) => pathname.startsWith(route))) {
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
      router.push("/auth/login")
    }
  }

  // Verificar permisos de rutas
  useEffect(() => {
    if (!loading && user) {
      // Verificar si el usuario tiene permisos para la ruta actual
      if (adminRoutes.some((route) => pathname.startsWith(route)) && user.role !== "admin") {
        router.push("/dashboard")
      }
    }
  }, [user, pathname, loading])

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  // No mostrar navegación en rutas de autenticación y setup
  const showNavigation = !publicRoutes.some((route) => pathname.startsWith(route))

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {showNavigation && <Navigation user={user} />}
      <main className={showNavigation ? "pt-16" : ""}>{children}</main>
    </AuthContext.Provider>
  )
}
