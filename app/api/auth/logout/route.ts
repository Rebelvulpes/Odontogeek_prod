import { type NextRequest, NextResponse } from "next/server"
import { getCookieSettings } from "@/lib/server-utils"

export async function POST(req: NextRequest) {
  try {
    console.log("=== LOGOUT REQUEST ===")
    console.log("Timestamp:", new Date().toISOString())
    console.log("Environment:", process.env.NODE_ENV)
    console.log("Host:", req.headers.get("host"))

    // Get current session for logging
    const sessionCookie = req.cookies.get("user-session")
    let userEmail = "unknown"

    if (sessionCookie) {
      try {
        const userSession = JSON.parse(sessionCookie.value)
        userEmail = userSession.email || "unknown"
        console.log("Logging out user:", userEmail)
      } catch (parseError) {
        console.log("Could not parse session for logging:", parseError)
      }
    }

    const response = NextResponse.json({
      success: true,
      message: "Sesión cerrada exitosamente",
    })

    // Clear session cookie with proper settings
    const cookieSettings = getCookieSettings()
    response.cookies.set("user-session", "", {
      ...cookieSettings,
      maxAge: 0, // Expire immediately
    })

    console.log("✅ LOGOUT SUCCESSFUL")
    console.log("User logged out:", userEmail)

    return response
  } catch (error) {
    console.error("=== LOGOUT ERROR ===")
    console.error("Error details:", error)

    return NextResponse.json(
      {
        success: false,
        message: "Error cerrando sesión",
        error: "LOGOUT_ERROR",
      },
      { status: 500 },
    )
  }
}
