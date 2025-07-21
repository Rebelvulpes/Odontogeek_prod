import { createClient } from "@supabase/supabase-js"
import jwt from "jsonwebtoken"

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

// Cookie configuration - 30 days for better session persistence
export const getCookieSettings = () => {
  const isProduction = process.env.NODE_ENV === "production"
  const isVercel = !!process.env.VERCEL_URL

  // 30 days = 30 * 24 * 60 * 60 seconds
  const THIRTY_DAYS_IN_SECONDS = 30 * 24 * 60 * 60

  return {
    httpOnly: true,
    secure: isProduction || isVercel, // Secure in production or Vercel
    sameSite: "lax" as const,
    maxAge: THIRTY_DAYS_IN_SECONDS, // 30 days for better persistence
    path: "/",
  }
}

// User session interface
export interface UserSession {
  id: string
  email: string
  role: string
  first_name?: string
  last_name?: string
  created_at?: string
}

// Parse user session from cookie header with improved validation
export const getUserSessionFromCookie = (cookieHeader: string | null): UserSession | null => {
  if (!cookieHeader) {
    console.log("❌ No cookie header provided")
    return null
  }

  try {
    const cookies = cookieHeader.split(";").reduce(
      (acc, cookie) => {
        const [key, value] = cookie.trim().split("=")
        if (key && value) {
          acc[key] = decodeURIComponent(value)
        }
        return acc
      },
      {} as Record<string, string>,
    )

    const sessionCookie = cookies["user-session"]
    if (!sessionCookie) {
      console.log("❌ No user-session cookie found")
      return null
    }

    // Try to parse as JWT first
    try {
      const decoded = jwt.verify(sessionCookie, jwtSecret) as any
      console.log("✅ JWT session decoded successfully")
      return {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
        first_name: decoded.first_name,
        last_name: decoded.last_name,
        created_at: decoded.created_at,
      }
    } catch (jwtError) {
      console.log("⚠️ JWT decode failed, trying JSON parse")
      // Fallback to JSON parsing
      const userSession = JSON.parse(sessionCookie)

      // Validate session structure
      if (!userSession.id || !userSession.email) {
        console.log("❌ Invalid session structure - missing id or email")
        return null
      }

      // Check if session is expired (30 days from creation)
      if (userSession.created_at) {
        const sessionCreated = new Date(userSession.created_at).getTime()
        const now = Date.now()
        const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000 // 30 days in milliseconds

        if (now - sessionCreated > thirtyDaysInMs) {
          console.log("❌ Session expired - older than 30 days")
          return null
        }
      }

      console.log("✅ Valid session found for user:", userSession.email)
      return userSession
    }
  } catch (error) {
    console.error("❌ Error parsing session cookie:", error)
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

// Generate secure session data with creation timestamp
export const generateSessionData = (user: any) => {
  return {
    id: user.id,
    email: user.email,
    first_name: user.first_name,
    last_name: user.last_name,
    role: user.role,
    created_at: new Date().toISOString(), // Track when session was created
  }
}
