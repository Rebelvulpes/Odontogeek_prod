import { type NextRequest, NextResponse } from "next/server"
import { getUserSessionFromCookie } from "@/lib/server-utils"

export async function GET(req: NextRequest) {
  try {
    console.log("=== AUTH ME REQUEST ===")

    // Get user session from cookie
    const cookieHeader = req.headers.get("cookie")
    const userSession = getUserSessionFromCookie(cookieHeader)

    if (!userSession) {
      console.log("❌ No valid session found")
      return NextResponse.json({ success: false, message: "No hay sesión válida" }, { status: 401 })
    }

    console.log("✅ Valid session found for user:", userSession.email)

    return NextResponse.json({
      success: true,
      user: {
        id: userSession.id,
        email: userSession.email,
        first_name: userSession.first_name,
        last_name: userSession.last_name,
        role: userSession.role,
      },
    })
  } catch (error) {
    console.error("❌ Auth me error:", error)
    return NextResponse.json({ success: false, message: "Error interno del servidor" }, { status: 500 })
  }
}
