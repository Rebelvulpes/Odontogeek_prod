import { type NextRequest, NextResponse } from "next/server"
import { getUserSessionFromCookie, logStudentAccess, getCookieSettings } from "@/lib/server-utils"

export async function POST(req: NextRequest) {
  const clientIP = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown"
  const userAgent = req.headers.get("user-agent") || "unknown"

  try {
    console.log("=== LOGOUT REQUEST ===")

    const cookieHeader = req.headers.get("cookie")
    const userSession = getUserSessionFromCookie(cookieHeader)

    const response = NextResponse.json({
      success: true,
      message: "Logout exitoso",
    })

    // Clear session cookie
    const cookieSettings = getCookieSettings()
    response.cookies.set("user-session", "", {
      ...cookieSettings,
      maxAge: 0, // Expire immediately
    })

    // Log logout
    if (userSession) {
      await logStudentAccess(
        userSession.id,
        userSession.email,
        "logout",
        true,
        null,
        "User logged out successfully",
        clientIP,
        userAgent,
      )
      console.log("✅ LOGOUT SUCCESSFUL for:", userSession.email)
    } else {
      console.log("⚠️ LOGOUT without valid session")
    }

    return response
  } catch (error) {
    console.error("❌ LOGOUT ERROR:", error)

    // Still clear the cookie even if logging fails
    const response = NextResponse.json({
      success: true,
      message: "Logout exitoso",
    })

    const cookieSettings = getCookieSettings()
    response.cookies.set("user-session", "", {
      ...cookieSettings,
      maxAge: 0,
    })

    return response
  }
}
