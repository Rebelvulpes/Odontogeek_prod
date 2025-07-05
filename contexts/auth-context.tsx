"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"

interface User {
  id: string
  email: string
  name: string
  role: "admin" | "student"
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<{ success: boolean; message: string; redirectTo?: string }>
  logout: () => Promise<void>
  loading: boolean
  checkAuth: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/me", {
        credentials: "include",
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success && result.user) {
          setUser(result.user)
        } else {
          setUser(null)
        }
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error("Error checking auth:", error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      })

      const result = await response.json()

      if (result.success && result.user) {
        setUser(result.user)

        // Determinar redirección basada en el rol
        let redirectTo = "/dashboard"
        if (result.user.role === "admin") {
          redirectTo = "/admin"
        }

        return {
          success: true,
          message: result.message,
          redirectTo: redirectTo,
        }
      } else {
        return {
          success: false,
          message: result.message || "Error en el login",
        }
      }
    } catch (error) {
      console.error("Login error:", error)
      return {
        success: false,
        message: "Error de conexión",
      }
    }
  }

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      })
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      setUser(null)
      window.location.href = "/"
    }
  }

  useEffect(() => {
    checkAuth()
  }, [])

  return <AuthContext.Provider value={{ user, login, logout, loading, checkAuth }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
