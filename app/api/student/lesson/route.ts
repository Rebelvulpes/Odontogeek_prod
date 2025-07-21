import { type NextRequest, NextResponse } from "next/server"
import { getUserSessionFromCookie } from "@/lib/server-utils"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(req: NextRequest) {
  try {
    console.log("=== STUDENT LESSON ACCESS REQUEST ===")

    const { searchParams } = new URL(req.url)
    const lessonId = searchParams.get("lessonId")
    const courseId = searchParams.get("courseId")

    if (!lessonId || !courseId) {
      return NextResponse.json(
        {
          success: false,
          message: "ID de lección y curso requeridos",
        },
        { status: 400 },
      )
    }

    const cookieHeader = req.headers.get("cookie")
    const userSession = getUserSessionFromCookie(cookieHeader)

    if (!userSession) {
      console.log("❌ NO VALID SESSION FOUND")
      return NextResponse.json(
        {
          success: false,
          message: "No autenticado",
          redirect: "/auth/login",
        },
        { status: 401 },
      )
    }

    console.log("✅ VALID SESSION FOUND for user:", userSession.email)
    console.log("🎯 Checking access for lesson:", lessonId, "in course:", courseId)

    // Get lesson details
    const { data: lesson, error: lessonError } = await supabase
      .from("lessons")
      .select("*")
      .eq("id", lessonId)
      .eq("course_id", courseId)
      .single()

    if (lessonError || !lesson) {
      console.error("❌ Lesson not found:", lessonError)
      return NextResponse.json(
        {
          success: false,
          message: "Lección no encontrada",
        },
        { status: 404 },
      )
    }

    // Check lesson access using the database function
    const { data: accessResult, error: accessError } = await supabase.rpc("check_lesson_access", {
      user_id: userSession.id,
      lesson_id: Number.parseInt(lessonId),
      course_id: Number.parseInt(courseId),
    })

    if (accessError) {
      console.error("❌ Error checking access:", accessError)
      return NextResponse.json(
        {
          success: false,
          message: "Error verificando acceso",
        },
        { status: 500 },
      )
    }

    console.log("🔍 Access check result:", accessResult)

    // Determine access type and log it
    let accessType = "denied"
    const logDetails: any = { lesson_id: lessonId, course_id: courseId }

    if (accessResult?.has_access) {
      if (accessResult.is_admin) {
        accessType = "admin"
        logDetails.admin_access = true
      } else if (accessResult.is_free) {
        accessType = "free"
        logDetails.free_lesson = true
      } else if (accessResult.is_enrolled) {
        accessType = "enrolled"
        logDetails.enrollment_active = true
      }
    }

    // Log the access attempt
    await supabase.from("student_access_logs").insert({
      user_id: userSession.id,
      course_id: Number.parseInt(courseId),
      lesson_id: Number.parseInt(lessonId),
      access_type: accessType,
      success: accessResult?.has_access || false,
      details: logDetails,
    })

    if (!accessResult?.has_access) {
      console.log("❌ ACCESS DENIED")

      // If it's a free lesson but user is not logged in, redirect to login
      if (lesson.is_free) {
        return NextResponse.json(
          {
            success: false,
            message: "Inicia sesión para acceder a esta lección gratuita",
            redirect: "/auth/login",
          },
          { status: 401 },
        )
      }

      // If it's a premium lesson, redirect to course page for enrollment
      return NextResponse.json(
        {
          success: false,
          message: "Necesitas inscribirte al curso para acceder a esta lección",
          redirect: `/courses/${courseId}`,
        },
        { status: 403 },
      )
    }

    console.log("✅ ACCESS GRANTED")

    return NextResponse.json({
      success: true,
      lesson: lesson,
      access_type: accessType,
      access_details: {
        is_admin: accessResult.is_admin,
        is_free: accessResult.is_free,
        is_enrolled: accessResult.is_enrolled,
        has_access: accessResult.has_access,
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
