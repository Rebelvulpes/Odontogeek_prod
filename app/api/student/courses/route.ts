import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET(req: NextRequest) {
  try {
    console.log("=== STUDENT COURSES ACCESS ===")
    console.log("Timestamp:", new Date().toISOString())

    // Get session from cookie
    const sessionCookie = req.cookies.get("user-session")
    console.log("Session cookie exists:", !!sessionCookie)

    if (!sessionCookie) {
      console.log("❌ NO SESSION COOKIE FOUND")
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
      console.log("Session parsed successfully")
      console.log("Session user ID:", userSession.id)
      console.log("Session email:", userSession.email)
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

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Verify user still exists
    console.log("=== VERIFYING USER IN DATABASE ===")
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, email, role")
      .eq("id", userSession.id)
      .single()

    if (userError || !user) {
      console.log("❌ USER NOT FOUND IN DATABASE")
      return NextResponse.json(
        {
          success: false,
          message: "Usuario no encontrado",
          error: "USER_NOT_FOUND",
        },
        { status: 401 },
      )
    }

    // Admin users get access to ALL courses automatically
    if (user.role === "admin") {
      console.log("=== ADMIN USER - FETCHING ALL COURSES ===")

      const { data: allCourses, error: coursesError } = await supabase
        .from("courses")
        .select(`
          id,
          title,
          description,
          thumbnail_url,
          price,
          duration_hours,
          level,
          instructor,
          created_at,
          updated_at,
          status
        `)
        .order("created_at", { ascending: false })

      if (coursesError) {
        console.error("❌ ERROR FETCHING COURSES FOR ADMIN:", coursesError)
        return NextResponse.json(
          {
            success: false,
            message: "Error cargando cursos",
            error: "COURSES_FETCH_ERROR",
          },
          { status: 500 },
        )
      }

      // Transform courses data for admin (full access)
      const courses = (allCourses || []).map((course) => ({
        id: course.id,
        title: course.title,
        description: course.description,
        thumbnail_url: course.thumbnail_url || "/placeholder.svg",
        price: course.price || 0,
        duration_hours: course.duration_hours || 0,
        level: course.level || "Principiante",
        instructor: course.instructor || "Instructor",
        progress: 100, // Admin has full access
        enrolled_at: new Date().toISOString(),
        completed_at: null,
        last_accessed_at: null,
        enrollment_id: `admin-${course.id}`,
        status: "admin_access",
        is_admin_access: true,
      }))

      console.log("✅ Admin courses loaded:", courses.length)

      // Log admin access
      try {
        await supabase.from("student_access_log").insert([
          {
            student_id: user.id,
            email: user.email,
            action: "admin_courses_access",
            success: true,
            error_message: `Admin accessed all courses - ${courses.length} courses available`,
            ip_address: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown",
            user_agent: req.headers.get("user-agent") || "unknown",
            session_data: JSON.stringify({ coursesCount: courses.length, adminAccess: true }),
          },
        ])
      } catch (logError) {
        console.error("Failed to log admin access:", logError)
      }

      return NextResponse.json({
        success: true,
        courses: courses,
        message: `Acceso de administrador - ${courses.length} cursos disponibles`,
        isAdmin: true,
      })
    }

    // For students, verify they have student role
    if (user.role !== "student") {
      console.log("❌ USER IS NOT A STUDENT")
      return NextResponse.json(
        {
          success: false,
          message: "Acceso no autorizado - solo estudiantes",
          error: "UNAUTHORIZED_ROLE",
        },
        { status: 403 },
      )
    }

    // Get student's enrolled courses with comprehensive data
    console.log("=== FETCHING STUDENT COURSES ===")
    const { data: enrollments, error: enrollmentsError } = await supabase
      .from("enrollments")
      .select(`
        id,
        progress,
        status,
        enrolled_at,
        completed_at,
        last_accessed_at,
        courses (
          id,
          title,
          description,
          thumbnail_url,
          price,
          duration_hours,
          level,
          instructor,
          created_at,
          updated_at
        )
      `)
      .eq("user_id", user.id)
      .order("enrolled_at", { ascending: false })

    console.log("Enrollments query result:")
    console.log("- Success:", !enrollmentsError)
    console.log("- Error:", enrollmentsError)
    console.log("- Enrollments found:", enrollments?.length || 0)

    if (enrollmentsError) {
      console.error("❌ ERROR FETCHING ENROLLMENTS:", enrollmentsError)

      // Log the error
      try {
        await supabase.from("student_access_log").insert([
          {
            student_id: user.id,
            email: user.email,
            action: "courses_fetch_error",
            success: false,
            error_code: "ENROLLMENTS_FETCH_ERROR",
            error_message: `Error fetching enrollments: ${enrollmentsError.message}`,
            ip_address: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown",
            user_agent: req.headers.get("user-agent") || "unknown",
          },
        ])
      } catch (logError) {
        console.error("Failed to log enrollments error:", logError)
      }

      return NextResponse.json(
        {
          success: false,
          message: "Error cargando cursos del estudiante",
          error: "ENROLLMENTS_FETCH_ERROR",
        },
        { status: 500 },
      )
    }

    // Transform enrollments data with comprehensive information
    const courses = (enrollments || []).map((enrollment) => {
      const course = enrollment.courses
      return {
        id: course.id,
        title: course.title,
        description: course.description,
        thumbnail_url: course.thumbnail_url || "/placeholder.svg",
        price: course.price || 0,
        duration_hours: course.duration_hours || 0,
        level: course.level || "Principiante",
        instructor: course.instructor || "Instructor",
        progress: enrollment.progress || 0,
        enrolled_at: enrollment.enrolled_at,
        completed_at: enrollment.completed_at,
        last_accessed_at: enrollment.last_accessed_at,
        enrollment_id: enrollment.id,
        status: enrollment.status,
        is_admin_access: false,
      }
    })

    console.log("Transformed courses:", courses.length)

    // If no courses found, create a default enrollment
    if (courses.length === 0) {
      console.log("=== NO COURSES FOUND - CREATING DEFAULT ENROLLMENT ===")

      try {
        // Get the first available course
        const { data: availableCourse, error: courseError } = await supabase
          .from("courses")
          .select("*")
          .limit(1)
          .single()

        if (availableCourse && !courseError) {
          console.log("Creating default enrollment for course:", availableCourse.title)

          const { data: newEnrollment, error: enrollmentError } = await supabase
            .from("enrollments")
            .insert([
              {
                user_id: user.id,
                course_id: availableCourse.id,
                enrolled_at: new Date().toISOString(),
                progress: 0,
                status: "active",
              },
            ])
            .select(`
              id,
              progress,
              status,
              enrolled_at,
              completed_at,
              courses (
                id,
                title,
                description,
                thumbnail_url,
                price,
                duration_hours,
                level,
                instructor
              )
            `)
            .single()

          if (newEnrollment && !enrollmentError) {
            console.log("✅ Default enrollment created successfully")

            courses.push({
              id: newEnrollment.courses.id,
              title: newEnrollment.courses.title,
              description: newEnrollment.courses.description,
              thumbnail_url: newEnrollment.courses.thumbnail_url || "/placeholder.svg",
              price: newEnrollment.courses.price || 0,
              duration_hours: newEnrollment.courses.duration_hours || 0,
              level: newEnrollment.courses.level || "Principiante",
              instructor: newEnrollment.courses.instructor || "Instructor",
              progress: 0,
              enrolled_at: newEnrollment.enrolled_at,
              completed_at: null,
              last_accessed_at: null,
              enrollment_id: newEnrollment.id,
              status: "active",
              is_admin_access: false,
            })
          } else {
            console.log("❌ Failed to create default enrollment:", enrollmentError)
          }
        } else {
          console.log("❌ No available courses found for default enrollment")
        }
      } catch (defaultEnrollmentError) {
        console.error("❌ Error creating default enrollment:", defaultEnrollmentError)
      }
    }

    console.log("=== COURSES DATA PREPARED ===")
    console.log("User:", user.email)
    console.log("Total courses:", courses.length)

    // Log successful courses access
    try {
      await supabase.from("student_access_log").insert([
        {
          student_id: user.id,
          email: user.email,
          action: "courses_access",
          success: true,
          error_message: `Courses accessed successfully - ${courses.length} courses found`,
          ip_address: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown",
          user_agent: req.headers.get("user-agent") || "unknown",
          session_data: JSON.stringify({ coursesCount: courses.length }),
        },
      ])
    } catch (logError) {
      console.error("Failed to log courses access:", logError)
    }

    return NextResponse.json({
      success: true,
      courses: courses,
      message: courses.length > 0 ? "Cursos cargados exitosamente" : "No tienes cursos inscritos aún",
      isAdmin: false,
    })
  } catch (error) {
    console.error("=== COURSES ACCESS ERROR ===")
    console.error("Error details:", error)
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace")

    // Log error
    try {
      const supabase = createClient(supabaseUrl, supabaseServiceKey)
      await supabase.from("student_access_log").insert([
        {
          email: "unknown",
          action: "courses_access",
          success: false,
          error_code: "INTERNAL_SERVER_ERROR",
          error_message: error instanceof Error ? error.message : "Unknown error",
          ip_address: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown",
          user_agent: req.headers.get("user-agent") || "unknown",
        },
      ])
    } catch (logError) {
      console.error("Failed to log courses error:", logError)
    }

    return NextResponse.json(
      {
        success: false,
        message: "Error interno del servidor",
        error: "INTERNAL_SERVER_ERROR",
        courses: [],
      },
      { status: 500 },
    )
  }
}
