import { createClient } from "@supabase/supabase-js"

// Server-side utilities - ONLY for API routes
export async function logStudentAccess(
  studentId: string | null,
  email: string,
  action: string,
  success: boolean,
  errorCode: string | null,
  errorMessage: string,
  ipAddress: string,
  userAgent: string,
  sessionData?: any,
) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    if (!supabaseServiceKey) {
      console.error("❌ SUPABASE_SERVICE_ROLE_KEY not available")
      return
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    await supabase.from("student_access_log").insert([
      {
        student_id: studentId,
        email: email,
        action: action,
        success: success,
        error_code: errorCode,
        error_message: errorMessage,
        ip_address: ipAddress,
        user_agent: userAgent,
        session_data: sessionData ? JSON.stringify(sessionData) : null,
      },
    ])
  } catch (logError) {
    console.error("Failed to log student access:", logError)
  }
}

export function getServerSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  return createClient(supabaseUrl, supabaseServiceKey)
}

export function getUserSessionFromCookie(cookieHeader: string | null) {
  if (!cookieHeader) return null

  try {
    const cookies = cookieHeader.split(";").reduce(
      (acc, cookie) => {
        const [key, value] = cookie.trim().split("=")
        acc[key] = value
        return acc
      },
      {} as Record<string, string>,
    )

    const sessionCookie = cookies["user-session"]
    if (!sessionCookie) return null

    return JSON.parse(decodeURIComponent(sessionCookie))
  } catch (error) {
    console.error("Error parsing session cookie:", error)
    return null
  }
}

// Enhanced cookie settings for different environments
export function getCookieSettings(isProduction: boolean = process.env.NODE_ENV === "production") {
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax" as const,
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: "/",
    // Add domain setting for production if needed
    ...(isProduction &&
      process.env.VERCEL_URL && {
        domain: `.${process.env.VERCEL_URL.replace("https://", "")}`,
      }),
  }
}
