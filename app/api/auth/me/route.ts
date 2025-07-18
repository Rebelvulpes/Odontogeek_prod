import { type NextRequest, NextResponse } from "next/server"
import { getUserSessionFromCookie } from "@/lib/server-utils"

export async function GET(req: NextRequest) {
  try {
    console.log("=== AUTH CHECK REQUEST ===")

    const cookieHeader = req.headers.get("cookie")
    const userSession = getUserSessionFromCookie(cookieHeader)

    if (!userSession) {
      console.log("❌ NO VALID SESSION FOUND")
      return NextResponse.json({ success: false, message: "No autenticado" }, { status: 401 })
    }

    console.log("✅ VALID SESSION FOUND for user:", userSession.email)
    console.log("Session created:", userSession.created_at)

    // Calculate session age
    if (userSession.created_at) {
      const sessionAge = Date.now() - new Date(userSession.created_at).getTime()
      const daysOld = Math.floor(sessionAge / (1000 * 60 * 60 * 24))
      console.log("Session age:", daysOld, "days")
    }

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
    console.error("❌ AUTH CHECK ERROR:", error)
    return NextResponse.json({ success: false, message: "Error interno del servidor" }, { status: 500 })
  }
}
