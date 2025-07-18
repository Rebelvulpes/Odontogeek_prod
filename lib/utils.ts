import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { createClient } from "@supabase/supabase-js"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

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
