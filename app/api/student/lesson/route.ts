import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Helper function to log student access attempts
async function logStudentAccess(
  studentId: string | null,
  email: string,
  action: string,
  success: boolean,
  errorCode: string | null,
  errorMessage: string,
  ipAddress: string,
  userAgent: string,
  sessionData?: any,
) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    await supabase.from("student_access_log").insert([
      {
        student_id: studentId,
        email: email,
        action: action,
        success: success,
        error_code: errorCode,
        error_message: errorMessage,
        ip_address: ipAddress,
        user_agent: userAgent,
        session_data: sessionData ? JSON.stringify(sessionData) : null,
      },
    ])
  } catch (logError) {
    console.error("Failed to log student access:", logError)
  }
}

export async function POST(req: NextRequest) {
  const clientIP = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown"
  const userAgent = req.headers.get("user-agent") || "unknown"
  let userSession: any = null

  try {
    console.log("=== STUDENT LESSON ACCESS ATTEMPT ===")
    const { courseId, lessonId } = await req.json()

    // 1. Get session from cookie
    const sessionCookie = req.cookies.get("user-session")
    if (!sessionCookie) {
      console.log("❌ NO SESSION COOKIE")
      return NextResponse.json(
        { success: false, message: "No hay sesión activa", error: "NO_SESSION" },
        { status: 401 },
      )
    }

    try {
      userSession = JSON.parse(sessionCookie.value)
    } catch (e) {
      console.log("❌ INVALID SESSION COOKIE")
      return NextResponse.json(
        { success: false, message: "Sesión inválida", error: "INVALID_SESSION" },
        { status: 401 },
      )
    }

    // 2. Validate session and role
    if (userSession.role !== "student") {
      console.log("❌ UNAUTHORIZED ROLE:", userSession.role)
      await logStudentAccess(
        userSession.id,
        userSession.email,
        "lesson_access_denied",
        false,
        "UNAUTHORIZED_ROLE",
        `User role is not student: ${userSession.role}`,
        clientIP,
        userAgent,
        { courseId, lessonId },
      )
      return NextResponse.json(
        { success: false, message: "Acceso denegado", error: "UNAUTHORIZED_ROLE" },
        { status: 403 },
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // 3. Verify enrollment
    console.log(`Verifying enrollment for student ${userSession.id} in course ${courseId}`)
    const { data: enrollment, error: enrollmentError } = await supabase
      .from("enrollments")
      .select("id")
      .eq("user_id", userSession.id)
      .eq("course_id", courseId)
      .single()

    if (enrollmentError || !enrollment) {
      console.log("❌ NOT ENROLLED")
      await logStudentAccess(
        userSession.id,
        userSession.email,
        "lesson_access_denied",
        false,
        "NOT_ENROLLED",
        "Student not enrolled in course",
        clientIP,
        userAgent,
        { courseId, lessonId },
      )
      return NextResponse.json(
        { success: false, message: "No estás inscrito en este curso", error: "NOT_ENROLLED" },
        { status: 403 },
      )
    }
    console.log("✅ Enrollment verified")

    // 4. Fetch lesson and course data
    const { data: lesson, error: lessonError } = await supabase
      .from("lessons")
      .select("*")
      .eq("id", lessonId)
      .eq("course_id", courseId)
      .single()

    if (lessonError || !lesson) {
      console.log("❌ LESSON NOT FOUND")
      await logStudentAccess(
        userSession.id,
        userSession.email,
        "lesson_access_failed",
        false,
        "LESSON_NOT_FOUND",
        "Lesson not found in DB",
        clientIP,
        userAgent,
        { courseId, lessonId },
      )
      return NextResponse.json(
        { success: false, message: "Lección no encontrada", error: "LESSON_NOT_FOUND" },
        { status: 404 },
      )
    }

    const { data: course, error: courseError } = await supabase
      .from("courses")
      .select("*, lessons(*)")
      .eq("id", courseId)
      .single()

    if (courseError || !course) {
      console.log("❌ COURSE NOT FOUND")
      return NextResponse.json(
        { success: false, message: "Curso no encontrado", error: "COURSE_NOT_FOUND" },
        { status: 404 },
      )
    }

    // 5. Calculate navigation
    course.lessons.sort((a: any, b: any) => a.order_index - b.order_index)
    const currentIndex = course.lessons.findIndex((l: any) => l.id === lesson.id)
    const previousLesson = currentIndex > 0 ? course.lessons[currentIndex - 1] : null
    const nextLesson = currentIndex < course.lessons.length - 1 ? course.lessons[currentIndex + 1] : null

    // 6. Log successful access
    await logStudentAccess(
      userSession.id,
      userSession.email,
      "lesson_access_success",
      true,
      null,
      "Lesson accessed successfully",
      clientIP,
      userAgent,
      { courseId, lessonId, lessonTitle: lesson.title },
    )

    // 7. Return data
    return NextResponse.json({
      success: true,
      data: {
        lesson,
        course,
        previousLesson,
        nextLesson,
        currentIndex,
        totalLessons: course.lessons.length,
      },
    })
  } catch (error) {
    console.error("=== LESSON ACCESS API ERROR ===", error)
    const email = userSession ? userSession.email : "unknown"
    const id = userSession ? userSession.id : null
    await logStudentAccess(
      id,
      email,
      "lesson_access_error",
      false,
      "INTERNAL_SERVER_ERROR",
      error.message,
      clientIP,
      userAgent,
    )
    return NextResponse.json(
      { success: false, message: "Error interno del servidor", error: "INTERNAL_SERVER_ERROR" },
      { status: 500 },
    )
  }
}
