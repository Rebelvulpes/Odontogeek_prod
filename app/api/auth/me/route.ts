import { type NextRequest, NextResponse } from "next/server"
import { logStudentAccess, getServerSupabaseClient } from "@/lib/server-utils"

export async function GET(req: NextRequest) {
  try {
    console.log("=== GET USER SESSION ===")
    console.log("Timestamp:", new Date().toISOString())
    console.log("Environment:", process.env.NODE_ENV)
    console.log("Host:", req.headers.get("host"))

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
    const supabase = getServerSupabaseClient()

    const { data: user, error: userError } = await supabase.from("users").select("*").eq("id", userSession.id).single()

    console.log("User verification result:")
    console.log("- User found:", !!user)
    console.log("- Error:", userError)

    if (userError || !user) {
      console.log("❌ USER NOT FOUND IN DATABASE")

      // Log the session verification failure
      try {
        await logStudentAccess(
          userSession.id,
          userSession.email || "unknown",
          "session_verification_failed",
          false,
          "USER_NOT_FOUND",
          "User not found during session verification",
          req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown",
          req.headers.get("user-agent") || "unknown",
        )
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
      await logStudentAccess(
        user.id,
        user.email,
        "session_verified",
        true,
        null,
        "Session verified successfully",
        req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown",
        req.headers.get("user-agent") || "unknown",
      )
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
      await logStudentAccess(
        null,
        "unknown",
        "session_verification_error",
        false,
        "INTERNAL_SERVER_ERROR",
        error instanceof Error ? error.message : "Unknown error",
        req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown",
        req.headers.get("user-agent") || "unknown",
      )
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
