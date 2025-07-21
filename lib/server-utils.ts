import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const jwtSecret = process.env.JWT_SECRET!

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("Missing Supabase environment variables")
}

if (!jwtSecret) {
  throw new Error("Missing JWT_SECRET environment variable")
}

// Server-side Supabase client with service role key
export const getServerSupabaseClient = () => {
  if (typeof window !== "undefined") {
    throw new Error("❌ SECURITY ERROR: getServerSupabaseClient called from client-side")
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

// Cookie configuration - 7 days for better session persistence
export function getCookieSettings() {
  const isProduction = process.env.NODE_ENV === "production"
  const maxAge = 7 * 24 * 60 * 60 // 7 days in seconds

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax" as const,
    maxAge,
    path: "/",
  }
}

// User session interface
export interface UserSession {
  id: string
  email: string
  first_name: string
  last_name: string
  role: string
  loginTime: number
  expiresAt: number
}

// Generate secure session data with creation timestamp
export function generateSessionData(user: any): UserSession {
  const now = Date.now()
  return {
    id: user.id,
    email: user.email,
    first_name: user.first_name,
    last_name: user.last_name,
    role: user.role,
    loginTime: now,
    expiresAt: now + 7 * 24 * 60 * 60 * 1000, // 7 days
  }
}

// Parse user session from cookie header with improved validation
export async function getUserSessionFromCookie(): Promise<UserSession | null> {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get("user-session")

    if (!sessionCookie?.value) {
      return null
    }

    const session = JSON.parse(sessionCookie.value) as UserSession

    // Check if session is expired
    if (Date.now() > session.expiresAt) {
      return null
    }

    return session
  } catch (error) {
    console.error("Error parsing session cookie:", error)
    return null
  }
}

// Export getUserFromSession as named export (alias for getUserSessionFromCookie)
export const getUserFromSession = getUserSessionFromCookie

// Log student access for monitoring and security
export const logStudentAccess = async (
  userId: string | null,
  email: string,
  action: string,
  success: boolean,
  errorCode: string | null = null,
  details: string | null = null,
  ipAddress = "unknown",
  userAgent = "unknown",
) => {
  if (typeof window !== "undefined") {
    throw new Error("❌ SECURITY ERROR: logStudentAccess called from client-side")
  }

  try {
    const supabase = getServerSupabaseClient()

    // Check if student_access_log table exists
    const { data: tableExists } = await supabase
      .from("information_schema.tables")
      .select("table_name")
      .eq("table_name", "student_access_log")
      .single()

    if (!tableExists) {
      console.log("⚠️ student_access_log table does not exist, skipping log")
      return
    }

    const logEntry = {
      student_id: userId,
      email,
      action,
      success,
      error_code: errorCode,
      error_message: details,
      ip_address: ipAddress,
      user_agent: userAgent,
      created_at: new Date().toISOString(),
    }

    const { error } = await supabase.from("student_access_log").insert([logEntry])

    if (error) {
      console.error("❌ Failed to log student access:", error)
    } else {
      console.log(`📝 Logged: ${action} for ${email} - ${success ? "SUCCESS" : "FAILED"}`)
    }
  } catch (error) {
    console.error("❌ Error in logStudentAccess:", error)
  }
}

// Validate password strength
export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []

  if (password.length < 6) {
    errors.push("La contraseña debe tener al menos 6 caracteres")
  }

  if (!/[A-Za-z]/.test(password)) {
    errors.push("La contraseña debe contener al menos una letra")
  }

  if (!/[0-9]/.test(password)) {
    errors.push("La contraseña debe contener al menos un número")
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

// Function to check if a session is valid
export function isValidSession(session: UserSession | null): boolean {
  if (!session) return false
  return Date.now() < session.expiresAt
}
