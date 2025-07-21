import { type NextRequest, NextResponse } from "next/server"
import { getUserSessionFromCookie, getServerSupabaseClient } from "@/lib/server-utils"

export async function GET(request: NextRequest) {
  try {
    console.log("=== ADMIN STATS API REQUEST ===")

    // Get user session
    const cookieHeader = request.headers.get("cookie")
    const userSession = getUserSessionFromCookie(cookieHeader)

    if (!userSession) {
      console.log("❌ No valid session found")
      return NextResponse.json({ success: false, message: "No autenticado" }, { status: 401 })
    }

    if (userSession.role !== "admin") {
      console.log("❌ User is not admin:", userSession.role)
      return NextResponse.json({ success: false, message: "No autorizado" }, { status: 403 })
    }

    console.log("✅ Admin user authenticated:", userSession.email)

    // Get Supabase client
    const supabase = getServerSupabaseClient()

    // Get stats with error handling
    console.log("📊 Fetching dashboard stats...")

    // Get total courses
    const { data: coursesData, error: coursesError } = await supabase.from("courses").select("id, status")

    if (coursesError) {
      console.error("❌ Error fetching courses:", coursesError)
    }

    const totalCourses = coursesData?.length || 0
    const publishedCourses = coursesData?.filter((c) => c.status === "published").length || 0

    // Get total users
    const { data: usersData, error: usersError } = await supabase.from("users").select("id, role")

    if (usersError) {
      console.error("❌ Error fetching users:", usersError)
    }

    const totalUsers = usersData?.length || 0
    const totalStudents = usersData?.filter((u) => u.role === "student").length || 0

    // Get total enrollments
    const { data: enrollmentsData, error: enrollmentsError } = await supabase.from("enrollments").select("id, status")

    if (enrollmentsError) {
      console.error("❌ Error fetching enrollments:", enrollmentsError)
    }

    const totalEnrollments = enrollmentsData?.length || 0
    const activeEnrollments = enrollmentsData?.filter((e) => e.status === "active").length || 0

    // Get total lessons
    const { data: lessonsData, error: lessonsError } = await supabase.from("lessons").select("id")

    if (lessonsError) {
      console.error("❌ Error fetching lessons:", lessonsError)
    }

    const totalLessons = lessonsData?.length || 0

    const stats = {
      totalCourses,
      publishedCourses,
      totalUsers,
      totalStudents,
      totalEnrollments,
      activeEnrollments,
      totalLessons,
    }

    console.log("✅ Stats calculated:", stats)

    return NextResponse.json({
      success: true,
      stats,
    })
  } catch (error) {
    console.error("❌ Unexpected error in stats API:", error)
    return NextResponse.json({ success: false, message: "Error interno del servidor" }, { status: 500 })
  }
}
