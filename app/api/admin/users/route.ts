import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET(req: NextRequest) {
  try {
    console.log("=== GET ADMIN USERS ===")
    console.log("Timestamp:", new Date().toISOString())
    console.log("Request headers:", Object.fromEntries(req.headers.entries()))

    // Get user session from cookie
    const cookieHeader = req.headers.get("cookie")
    console.log("Cookie header:", cookieHeader)

    if (!cookieHeader) {
      console.log("❌ NO COOKIE HEADER")
      return NextResponse.json(
        {
          success: false,
          message: "No hay sesión activa - sin cookies",
          error: "NO_COOKIES",
        },
        { status: 401 },
      )
    }

    // Parse cookies manually
    const cookies = cookieHeader.split(";").reduce(
      (acc, cookie) => {
        const [key, value] = cookie.trim().split("=")
        if (key && value) {
          acc[key] = decodeURIComponent(value)
        }
        return acc
      },
      {} as Record<string, string>,
    )

    console.log("Parsed cookies:", Object.keys(cookies))

    const sessionCookie = cookies["user-session"]
    if (!sessionCookie) {
      console.log("❌ NO SESSION COOKIE")
      console.log("Available cookies:", Object.keys(cookies))
      return NextResponse.json(
        {
          success: false,
          message: "No hay sesión activa - sin cookie de sesión",
          error: "NO_SESSION_COOKIE",
        },
        { status: 401 },
      )
    }

    let userSession
    try {
      userSession = JSON.parse(sessionCookie)
      console.log("Session user ID:", userSession.id)
      console.log("Session email:", userSession.email)
      console.log("Session role:", userSession.role)
    } catch (parseError) {
      console.error("❌ SESSION PARSE ERROR:", parseError)
      return NextResponse.json(
        {
          success: false,
          message: "Sesión inválida - no se puede parsear",
          error: "INVALID_SESSION_FORMAT",
        },
        { status: 401 },
      )
    }

    // Validate session structure
    if (!userSession.id || !userSession.email || !userSession.role) {
      console.log("❌ INCOMPLETE SESSION DATA")
      console.log("Session data:", userSession)
      return NextResponse.json(
        {
          success: false,
          message: "Sesión incompleta",
          error: "INCOMPLETE_SESSION",
        },
        { status: 401 },
      )
    }

    // Verify user is admin
    if (userSession.role !== "admin") {
      console.log("❌ USER IS NOT ADMIN")
      console.log("User role:", userSession.role)
      return NextResponse.json(
        {
          success: false,
          message: "Acceso denegado - Se requieren permisos de administrador",
          error: "ACCESS_DENIED",
          userRole: userSession.role,
        },
        { status: 403 },
      )
    }

    console.log("✅ ADMIN ACCESS VERIFIED")
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
          message: "Error obteniendo usuarios de la base de datos",
          error: "DATABASE_ERROR",
          details: usersError.message,
        },
        { status: 500 },
      )
    }

    // Get enrollment counts for each user
    const { data: enrollmentCounts, error: enrollmentError } = await supabase
      .from("enrollments")
      .select("user_id, course_id")

    console.log("Enrollments query result:")
    console.log("- Success:", !enrollmentError)
    console.log("- Error:", enrollmentError)
    console.log("- Count:", enrollmentCounts?.length || 0)

    // Get course prices for revenue calculation
    const { data: courses, error: coursesError } = await supabase.from("courses").select("id, price")

    console.log("Courses query result:")
    console.log("- Success:", !coursesError)
    console.log("- Error:", coursesError)
    console.log("- Count:", courses?.length || 0)

    // Create course price map
    const coursePriceMap = new Map()
    if (courses) {
      courses.forEach((course) => {
        coursePriceMap.set(course.id, course.price || 0)
      })
    }

    // Count enrollments and calculate spending per user
    const userStatsMap = new Map()
    if (enrollmentCounts) {
      enrollmentCounts.forEach((enrollment) => {
        const userId = enrollment.user_id
        const coursePrice = coursePriceMap.get(enrollment.course_id) || 0

        if (!userStatsMap.has(userId)) {
          userStatsMap.set(userId, { courses: 0, spent: 0 })
        }

        const stats = userStatsMap.get(userId)
        stats.courses += 1
        stats.spent += coursePrice
      })
    }

    // Format users data for the admin dashboard
    const formattedUsers = (users || []).map((user) => {
      const stats = userStatsMap.get(user.id) || { courses: 0, spent: 0 }
      const fullName = [user.first_name, user.last_name].filter(Boolean).join(" ") || "Sin nombre"

      return {
        id: user.id,
        name: fullName,
        email: user.email,
        role: user.role,
        courses: stats.courses,
        spent: stats.spent,
        joinDate: user.created_at ? new Date(user.created_at).toLocaleDateString("es-ES") : "N/A",
        avatar_url: user.avatar_url,
        is_test_user: user.is_test_user || false,
        enrollment_count: stats.courses,
        total_spent: stats.spent,
        created_at: user.created_at,
        updated_at: user.updated_at,
      }
    })

    console.log("✅ USERS FETCHED SUCCESSFULLY")
    console.log("Users returned:", formattedUsers.length)
    console.log("Users by role:")
    const roleCount = formattedUsers.reduce(
      (acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )
    console.log(roleCount)

    // Log sample user data for debugging
    if (formattedUsers.length > 0) {
      console.log("Sample user data:", {
        id: formattedUsers[0].id,
        name: formattedUsers[0].name,
        email: formattedUsers[0].email,
        courses: formattedUsers[0].courses,
        spent: formattedUsers[0].spent,
      })
    }

    return NextResponse.json({
      success: true,
      data: formattedUsers,
      users: formattedUsers, // Keep both for compatibility
      count: formattedUsers.length,
      stats: {
        total: formattedUsers.length,
        admins: roleCount.admin || 0,
        students: roleCount.student || 0,
        test_users: formattedUsers.filter((u) => u.is_test_user).length,
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
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
