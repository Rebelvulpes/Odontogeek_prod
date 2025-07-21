import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET(req: NextRequest) {
  try {
    console.log("=== STUDENT LESSON ACCESS REQUEST ===")

    const { searchParams } = new URL(req.url)
    const lessonId = searchParams.get("lessonId")
    const courseId = searchParams.get("courseId")

    console.log("Request params:", { lessonId, courseId })

    if (!lessonId || !courseId) {
      console.log("❌ Missing required parameters")
      return NextResponse.json(
        {
          success: false,
          message: "ID de lección y curso requeridos",
        },
        { status: 400 },
      )
    }

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

    // Convert IDs to integers for database queries
    const lessonIdInt = Number.parseInt(lessonId, 10)
    const courseIdInt = Number.parseInt(courseId, 10)

    if (isNaN(lessonIdInt) || isNaN(courseIdInt)) {
      console.log("❌ Invalid ID format:", { lessonId, courseId })
      return NextResponse.json(
        {
          success: false,
          message: "IDs de lección o curso inválidos",
        },
        { status: 400 },
      )
    }

    console.log("=== FETCHING LESSON DETAILS ===")
    console.log("Looking for lesson ID:", lessonIdInt, "in course ID:", courseIdInt)

    // Get lesson details with course information
    const { data: lesson, error: lessonError } = await supabase
      .from("lessons")
      .select(`
        id,
        title,
        description,
        content,
        video_url,
        duration_minutes,
        order_index,
        is_free,
        course_id,
        courses!inner (
          id,
          title,
          description,
          instructor,
          status
        )
      `)
      .eq("id", lessonIdInt)
      .eq("course_id", courseIdInt)
      .single()

    if (lessonError) {
      console.error("❌ LESSON QUERY ERROR:", lessonError)

      // Check if lesson exists with different course_id
      const { data: lessonCheck, error: checkError } = await supabase
        .from("lessons")
        .select("id, course_id, title")
        .eq("id", lessonIdInt)
        .single()

      if (lessonCheck) {
        console.log("❌ LESSON EXISTS BUT IN DIFFERENT COURSE:", lessonCheck)
        return NextResponse.json(
          {
            success: false,
            message: `La lección ${lessonIdInt} pertenece al curso ${lessonCheck.course_id}, no al curso ${courseIdInt}`,
          },
          { status: 404 },
        )
      }

      return NextResponse.json(
        {
          success: false,
          message: "Lección no encontrada",
        },
        { status: 404 },
      )
    }

    if (!lesson) {
      console.log("❌ LESSON NOT FOUND")
      return NextResponse.json(
        {
          success: false,
          message: "Lección no encontrada",
        },
        { status: 404 },
      )
    }

    console.log("✅ LESSON FOUND:", lesson.title)
    console.log("Lesson details:", {
      id: lesson.id,
      title: lesson.title,
      is_free: lesson.is_free,
      course_id: lesson.course_id,
      course_title: lesson.courses.title,
    })

    // Check access permissions
    let hasAccess = false
    let accessType = "denied"
    let accessReason = ""

    console.log("=== CHECKING ACCESS PERMISSIONS ===")

    // 1. Admin users have access to ALL lessons
    if (user.role === "admin") {
      hasAccess = true
      accessType = "admin"
      accessReason = "Administrator access"
      console.log("✅ ADMIN ACCESS GRANTED")
    }
    // 2. Free lessons are accessible to ALL logged-in users
    else if (lesson.is_free) {
      hasAccess = true
      accessType = "free"
      accessReason = "Free lesson access"
      console.log("✅ FREE LESSON ACCESS GRANTED")
    }
    // 3. For paid lessons, check enrollment
    else {
      console.log("=== CHECKING ENROLLMENT FOR PAID LESSON ===")
      const { data: enrollment, error: enrollmentError } = await supabase
        .from("enrollments")
        .select("id, status, progress")
        .eq("user_id", user.id)
        .eq("course_id", courseIdInt)
        .single()

      console.log("Enrollment query result:", { enrollment, enrollmentError })

      if (enrollment && !enrollmentError && enrollment.status === "active") {
        hasAccess = true
        accessType = "enrolled"
        accessReason = "Enrolled in course"
        console.log("✅ ENROLLMENT ACCESS GRANTED")
      } else {
        hasAccess = false
        accessType = "denied"
        accessReason = "Not enrolled in course"
        console.log("❌ NO ENROLLMENT FOUND OR INACTIVE")
      }
    }

    // Log the access attempt
    try {
      const logData = {
        student_id: user.id,
        email: user.email,
        action: "lesson_access",
        success: hasAccess,
        error_code: hasAccess ? null : "ACCESS_DENIED",
        error_message: `Lesson access ${hasAccess ? "granted" : "denied"} - ${accessReason}`,
        ip_address: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown",
        user_agent: req.headers.get("user-agent") || "unknown",
        session_data: {
          lessonId: lessonIdInt,
          courseId: courseIdInt,
          lessonTitle: lesson.title,
          accessType,
          isFree: lesson.is_free,
        },
      }

      console.log("Logging access attempt:", logData)

      const { error: logError } = await supabase.from("student_access_log").insert([logData])

      if (logError) {
        console.error("Failed to log lesson access:", logError)
      } else {
        console.log("✅ Access attempt logged successfully")
      }
    } catch (logError) {
      console.error("Exception while logging lesson access:", logError)
    }

    if (!hasAccess) {
      console.log("❌ ACCESS DENIED - Returning 403")
      return NextResponse.json(
        {
          success: false,
          message: lesson.is_free
            ? "Inicia sesión para acceder a esta lección gratuita"
            : "Necesitas inscribirte al curso para acceder a esta lección",
          redirect: lesson.is_free ? "/auth/login" : `/courses/${courseId}`,
        },
        { status: 403 },
      )
    }

    console.log("✅ ACCESS GRANTED - Returning lesson data")

    return NextResponse.json({
      success: true,
      lesson: {
        id: lesson.id,
        title: lesson.title,
        description: lesson.description,
        content: lesson.content,
        video_url: lesson.video_url,
        duration_minutes: lesson.duration_minutes,
        order_index: lesson.order_index,
        is_free: lesson.is_free,
        course_id: lesson.course_id,
        courses: lesson.courses,
      },
      access_type: accessType,
      access_details: {
        is_admin: user.role === "admin",
        is_free: lesson.is_free,
        is_enrolled: accessType === "enrolled",
        has_access: hasAccess,
        access_reason: accessReason,
      },
    })
  } catch (error) {
    console.error("❌ STUDENT LESSON ERROR:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Error interno del servidor",
      },
      { status: 500 },
    )
  }
}
