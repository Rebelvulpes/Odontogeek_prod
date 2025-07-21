import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("Missing Supabase environment variables")
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

// Parse user session from cookie header with improved validation
export const getUserSessionFromCookie = (cookieHeader: string | null) => {
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
  } catch (error) {
    console.error("❌ Error parsing session cookie:", error)
    return null
  }
}

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
