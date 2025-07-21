import { createClient } from "@supabase/supabase-js"
import jwt from "jsonwebtoken"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const jwtSecret = process.env.JWT_SECRET!

export function getServerSupabaseClient() {
  return createClient(supabaseUrl, supabaseServiceKey)
}

export interface UserSession {
  id: string
  email: string
  role: string
  first_name?: string
  last_name?: string
  created_at?: string
}

export function getUserSessionFromCookie(cookieHeader: string | null): UserSession | null {
  if (!cookieHeader) {
    console.log("❌ No cookie header provided")
    return null
  }

  try {
    // Parse cookies
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
      const sessionData = JSON.parse(sessionCookie)
      return {
        id: sessionData.id,
        email: sessionData.email,
        role: sessionData.role,
        first_name: sessionData.first_name,
        last_name: sessionData.last_name,
        created_at: sessionData.created_at,
      }
    }
  } catch (error) {
    console.error("❌ Error parsing session cookie:", error)
    return null
  }
}

export async function logStudentAccess(
  userId: string | null,
  email: string,
  action: string,
  success: boolean,
  errorCode: string | null,
  errorMessage: string,
  ipAddress: string,
  userAgent: string,
) {
  try {
    const supabase = getServerSupabaseClient()

    const logData = {
      student_id: userId,
      email: email,
      action: action,
      success: success,
      error_code: errorCode,
      error_message: errorMessage,
      ip_address: ipAddress,
      user_agent: userAgent,
      session_data: JSON.stringify({
        timestamp: new Date().toISOString(),
        action: action,
        success: success,
      }),
    }

    const { error } = await supabase.from("student_access_log").insert([logData])

    if (error) {
      console.error("Failed to log student access:", error)
    }
  } catch (error) {
    console.error("Exception while logging student access:", error)
  }
}
