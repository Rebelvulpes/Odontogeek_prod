import { type NextRequest, NextResponse } from "next/server"
import { getUserSessionFromCookie, getServerSupabaseClient } from "@/lib/server-utils"

export async function GET(req: NextRequest) {
  try {
    const cookieHeader = req.headers.get("cookie")
    const userSession = getUserSessionFromCookie(cookieHeader)

    if (!userSession) {
      return NextResponse.json({ success: false, message: "No session found", error: "NO_SESSION" }, { status: 401 })
    }

    // Verify user still exists in database
    const supabase = getServerSupabaseClient()
    const { data: user, error } = await supabase
      .from("users")
      .select("id, email, first_name, last_name, role, created_at")
      .eq("id", userSession.id)
      .single()

    if (error || !user) {
      return NextResponse.json({ success: false, message: "User not found", error: "USER_NOT_FOUND" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        created_at: user.created_at,
      },
    })
  } catch (error) {
    console.error("Auth me error:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error", error: "INTERNAL_ERROR" },
      { status: 500 },
    )
  }
}
