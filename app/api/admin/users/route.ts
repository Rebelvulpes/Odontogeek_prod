import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET(req: NextRequest) {
  try {
    console.log("=== GET ADMIN USERS ===")
    console.log("Timestamp:", new Date().toISOString())

    // Get user session
    const sessionCookie = req.cookies.get("user-session")
    if (!sessionCookie) {
      console.log("❌ NO SESSION COOKIE")
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
      console.log("Session user ID:", userSession.id)
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

    // Verify user is admin
    if (userSession.role !== "admin") {
      console.log("❌ USER IS NOT ADMIN")
      return NextResponse.json(
        {
          success: false,
          message: "Acceso denegado - Se requieren permisos de administrador",
          error: "ACCESS_DENIED",
        },
        { status: 403 },
      )
    }

    console.log("=== FETCHING USERS ===")
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get all users with enrollment counts
    const { data: users, error: usersError } = await supabase
      .from("users")
      .select(`
        id,
        email,
        first_name,
        last_name,
        role,
        avatar_url,
        is_test_user,
        created_at,
        updated_at
      `)
      .order("created_at", { ascending: false })

    console.log("Users query result:")
    console.log("- Success:", !usersError)
    console.log("- Error:", usersError)
    console.log("- Count:", users?.length || 0)

    if (usersError) {
      console.error("❌ USERS QUERY ERROR:", usersError)
      return NextResponse.json(
        {
          success: false,
          message: "Error obteniendo usuarios",
          error: "QUERY_ERROR",
        },
        { status: 500 },
      )
    }

    // Get enrollment counts for each user
    const { data: enrollmentCounts, error: enrollmentError } = await supabase.from("enrollments").select("user_id")

    console.log("Enrollments query result:")
    console.log("- Success:", !enrollmentError)
    console.log("- Error:", enrollmentError)
    console.log("- Count:", enrollmentCounts?.length || 0)

    // Count enrollments per user
    const enrollmentCountMap = new Map()
    if (enrollmentCounts) {
      enrollmentCounts.forEach((enrollment) => {
        const count = enrollmentCountMap.get(enrollment.user_id) || 0
        enrollmentCountMap.set(enrollment.user_id, count + 1)
      })
    }

    // Add enrollment counts to users
    const usersWithCounts = (users || []).map((user) => ({
      ...user,
      enrollment_count: enrollmentCountMap.get(user.id) || 0,
    }))

    console.log("✅ USERS FETCHED SUCCESSFULLY")
    console.log("Users returned:", usersWithCounts.length)
    console.log("Users by role:")
    const roleCount = usersWithCounts.reduce(
      (acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )
    console.log(roleCount)

    return NextResponse.json({
      success: true,
      users: usersWithCounts,
      count: usersWithCounts.length,
      stats: {
        total: usersWithCounts.length,
        admins: roleCount.admin || 0,
        students: roleCount.student || 0,
        test_users: usersWithCounts.filter((u) => u.is_test_user).length,
      },
    })
  } catch (error) {
    console.error("=== GET USERS ERROR ===")
    console.error("Error details:", error)
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace")

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
