import type { NextRequest } from "next/server"
import jwt from "jsonwebtoken"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const jwtSecret = process.env.JWT_SECRET!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export interface User {
  id: string
  email: string
  role: string
  first_name?: string
  last_name?: string
  name?: string
  avatar_url?: string
  created_at: string
}

export async function getUserFromRequest(request: NextRequest): Promise<User | null> {
  try {
    // Intentar obtener token de la cookie
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      console.log("🔍 No se encontró token en cookies")
      return null
    }

    // Verificar y decodificar el token
    const decoded = jwt.verify(token, jwtSecret) as any
    console.log("🎫 Token decodificado:", { userId: decoded.userId, email: decoded.email })

    // Obtener usuario actualizado de la base de datos
    const { data: user, error } = await supabase
      .from("users")
      .select("id, email, role, first_name, last_name, name, avatar_url, created_at")
      .eq("id", decoded.userId)
      .single()

    if (error || !user) {
      console.log("❌ Usuario no encontrado en BD:", error?.message)
      return null
    }

    console.log("✅ Usuario autenticado:", user.email)
    return user as User
  } catch (error: any) {
    console.error("❌ Error verificando usuario:", error.message)
    return null
  }
}

export async function requireAuth(request: NextRequest): Promise<User> {
  const user = await getUserFromRequest(request)

  if (!user) {
    throw new Error("No autorizado")
  }

  return user
}

export async function requireAdmin(request: NextRequest): Promise<User> {
  const user = await requireAuth(request)

  if (user.role !== "admin") {
    throw new Error("Acceso denegado - Se requieren permisos de administrador")
  }

  return user
}

// Función para obtener sesión del usuario desde cookies (solo servidor)
export function getUserSessionFromCookie(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return null
    }

    const decoded = jwt.verify(token, jwtSecret) as any
    return {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    }
  } catch (error) {
    console.error("Error decodificando token:", error)
    return null
  }
}

// Utilidades para validación
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validatePassword(password: string): { valid: boolean; message?: string } {
  if (password.length < 6) {
    return { valid: false, message: "La contraseña debe tener al menos 6 caracteres" }
  }
  return { valid: true }
}

// Función para formatear errores de Supabase
export function formatSupabaseError(error: any): string {
  if (error?.code === "23505") {
    return "Este email ya está registrado"
  }

  if (error?.code === "23503") {
    return "Error de referencia en la base de datos"
  }

  return error?.message || "Error desconocido"
}

// Función para logging seguro (sin datos sensibles)
export function logSafely(message: string, data?: any) {
  const safeData = data
    ? {
        ...data,
        password: data.password ? "[REDACTED]" : undefined,
        password_hash: data.password_hash ? "[REDACTED]" : undefined,
        token: data.token ? "[REDACTED]" : undefined,
      }
    : undefined

  console.log(message, safeData)
}
