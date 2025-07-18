import { type NextRequest, NextResponse } from "next/server"
import { getUserSessionFromCookie, logStudentAccess } from "@/lib/server-utils"

export async function POST(req: NextRequest) {
  const clientIP = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown"
  const userAgent = req.headers.get("user-agent") || "unknown"

  try {
    console.log("=== LOGOUT REQUEST ===")

    // Get user session from cookie before clearing it
    const cookieHeader = req.headers.get("cookie")
    const userSession = getUserSessionFromCookie(cookieHeader)

    // Create response
    const response = NextResponse.json({
      success: true,
      message: "Logout exitoso",
    })

    // Clear session cookie
    response.cookies.set("user-session", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0, // Expire immediately
      path: "/",
    })

    // Log logout if we had a valid session
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
      console.log("✅ User logged out:", userSession.email)
    } else {
      console.log("⚠️ Logout attempt without valid session")
    }

    return response
  } catch (error) {
    console.error("❌ Logout error:", error)

    // Still clear the cookie even if logging fails
    const response = NextResponse.json({
      success: true,
      message: "Logout exitoso",
    })

    response.cookies.set("user-session", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
      path: "/",
    })

    return response
  }
}
