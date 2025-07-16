import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET(req: NextRequest) {
  try {
    console.log("=== GET USER SESSION ===")
    console.log("Timestamp:", new Date().toISOString())

    // Get session from cookie
    const sessionCookie = req.cookies.get("user-session")
    console.log("Session cookie exists:", !!sessionCookie)

    if (!sessionCookie) {
      console.log("❌ NO SESSION COOKIE FOUND")
      return NextResponse.json(
        {
          success: false,
          message: "No hay sesión activa",
          error: "NO_SESSION",
        },
        { status: 401 },
      )
    }

    let userSession
    try {
      userSession = JSON.parse(sessionCookie.value)
      console.log("Session parsed successfully")
      console.log("Session user ID:", userSession.id)
      console.log("Session email:", userSession.email)
      console.log("Session role:", userSession.role)
    } catch (parseError) {
      console.error("❌ SESSION PARSE ERROR:", parseError)
      return NextResponse.json(
        {
          success: false,
          message: "Sesión inválida",
          error: "INVALID_SESSION",
        },
        { status: 401 },
      )
    }

    // Verify user still exists in database
    console.log("=== VERIFYING USER IN DATABASE ===")
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { data: user, error: userError } = await supabase.from("users").select("*").eq("id", userSession.id).single()

    console.log("User verification result:")
    console.log("- User found:", !!user)
    console.log("- Error:", userError)

    if (userError || !user) {
      console.log("❌ USER NOT FOUND IN DATABASE")

      // Log the session verification failure
      try {
        await supabase.from("student_access_log").insert([
          {
            student_id: userSession.id,
            email: userSession.email || "unknown",
            action: "session_verification_failed",
            success: false,
            error_code: "USER_NOT_FOUND",
            error_message: "User not found during session verification",
            ip_address: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown",
            user_agent: req.headers.get("user-agent") || "unknown",
          },
        ])
      } catch (logError) {
        console.error("Failed to log session verification failure:", logError)
      }

      return NextResponse.json(
        {
          success: false,
          message: "Usuario no encontrado",
          error: "USER_NOT_FOUND",
        },
        { status: 401 },
      )
    }

    console.log("✅ USER SESSION VALID")
    console.log("User details:")
    console.log("- ID:", user.id)
    console.log("- Email:", user.email)
    console.log("- Name:", user.first_name, user.last_name)
    console.log("- Role:", user.role)

    // Log successful session verification
    try {
      await supabase.from("student_access_log").insert([
        {
          student_id: user.id,
          email: user.email,
          action: "session_verified",
          success: true,
          error_message: "Session verified successfully",
          ip_address: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown",
          user_agent: req.headers.get("user-agent") || "unknown",
        },
      ])
    } catch (logError) {
      console.error("Failed to log session verification:", logError)
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        avatar_url: user.avatar_url,
        created_at: user.created_at,
      },
    })
  } catch (error) {
    console.error("=== GET SESSION ERROR ===")
    console.error("Error details:", error)
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace")

    // Log error
    try {
      const supabase = createClient(supabaseUrl, supabaseServiceKey)
      await supabase.from("student_access_log").insert([
        {
          email: "unknown",
          action: "session_verification_error",
          success: false,
          error_code: "INTERNAL_SERVER_ERROR",
          error_message: error instanceof Error ? error.message : "Unknown error",
          ip_address: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown",
          user_agent: req.headers.get("user-agent") || "unknown",
        },
      ])
    } catch (logError) {
      console.error("Failed to log session error:", logError)
    }

    return NextResponse.json(
      {
        success: false,
        message: "Error interno del servidor",
        error: "INTERNAL_SERVER_ERROR",
      },
      { status: 500 },
    )
  }
}
