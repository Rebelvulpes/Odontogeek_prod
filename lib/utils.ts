import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { createClient } from "@supabase/supabase-js"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Server-side logging function - ONLY for API routes
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
    // This function should ONLY be called from server-side API routes
    if (typeof window !== "undefined") {
      console.error("❌ SECURITY ERROR: logStudentAccess called from client-side")
      return
    }

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
