import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET(req: NextRequest) {
  try {
    console.log("=== STUDENT COURSES REQUEST ===")

    // Get session from cookie
    const sessionCookie = req.cookies.get("user-session")
    console.log("Session cookie exists:", !!sessionCookie)

    if (!sessionCookie) {
      console.log("❌ NO SESSION COOKIE FOUND")
      return NextResponse.json(
        {
          success: false,
          message: "No autenticado",
          redirect: "/auth/login",
        },
        { status: 401 },
      )
    }

    let userSession
    try {
      userSession = JSON.parse(sessionCookie.value)
      console.log("✅ Session parsed successfully")
      console.log("User ID:", userSession.id)
      console.log("User email:", userSession.email)
      console.log("User role:", userSession.role)
    } catch (parseError) {
      console.error("❌ SESSION PARSE ERROR:", parseError)
      return NextResponse.json(
        {
          success: false,
          message: "Sesión inválida",
          redirect: "/auth/login",
        },
        { status: 401 },
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Verify user still exists in database
    console.log("=== VERIFYING USER IN DATABASE ===")
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, email, role")
      .eq("id", userSession.id)
      .single()

    if (userError || !user) {
      console.log("❌ USER NOT FOUND IN DATABASE:", userError)
      return NextResponse.json(
        {
          success: false,
          message: "Usuario no encontrado",
          redirect: "/auth/login",
        },
        { status: 401 },
      )
    }

    console.log("✅ USER VERIFIED:", user.email, "Role:", user.role)

    // Get courses with lessons
    console.log("=== FETCHING COURSES WITH LESSONS ===")

    const { data: courses, error: coursesError } = await supabase
      .from("courses")
      .select(`
        id,
        title,
        description,
        instructor,
        price,
        thumbnail_url,
        difficulty_level,
        status,
        created_at,
        lessons (
          id,
          title,
          description,
          duration_minutes,
          order_index,
          is_free
        )
      `)
      .eq("status", "published")
      .order("created_at", { ascending: false })

    if (coursesError) {
      console.error("❌ COURSES QUERY ERROR:", coursesError)
      return NextResponse.json(
        {
          success: false,
          message: "Error al cargar cursos",
        },
        { status: 500 },
      )
    }

    console.log(`✅ FOUND ${courses?.length || 0} COURSES`)

    // Get user's enrollments
    const { data: enrollments, error: enrollmentsError } = await supabase
      .from("enrollments")
      .select("course_id, status, progress, enrolled_at")
      .eq("user_id", user.id)

    if (enrollmentsError) {
      console.error("❌ ENROLLMENTS QUERY ERROR:", enrollmentsError)
    }

    console.log(`✅ FOUND ${enrollments?.length || 0} ENROLLMENTS`)

    // Process courses with enrollment status
    const processedCourses =
      courses?.map((course) => {
        const enrollment = enrollments?.find((e) => e.course_id === course.id)
        const isAdmin = user.role === "admin"

        // Count lessons
        const totalLessons = course.lessons?.length || 0
        const freeLessons = course.lessons?.filter((l) => l.is_free).length || 0

        return {
          ...course,
          enrollment_status: enrollment?.status || "not_enrolled",
          enrollment_progress: enrollment?.progress || 0,
          enrolled_at: enrollment?.enrolled_at || null,
          has_access: isAdmin || enrollment?.status === "active" || freeLessons > 0,
          access_type: isAdmin
            ? "admin"
            : enrollment?.status === "active"
              ? "enrolled"
              : freeLessons > 0
                ? "partial"
                : "none",
          total_lessons: totalLessons,
          free_lessons: freeLessons,
          lessons: course.lessons?.sort((a, b) => a.order_index - b.order_index) || [],
        }
      }) || []

    console.log("✅ PROCESSED COURSES WITH ACCESS INFO")

    return NextResponse.json({
      success: true,
      courses: processedCourses,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        is_admin: user.role === "admin",
      },
    })
  } catch (error) {
    console.error("❌ STUDENT COURSES ERROR:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Error interno del servidor",
      },
      { status: 500 },
    )
  }
}
