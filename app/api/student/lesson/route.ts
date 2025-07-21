import { type NextRequest, NextResponse } from "next/server"
import { getUserSessionFromCookie, getServerSupabaseClient, logStudentAccess } from "@/lib/server-utils"

export async function GET(req: NextRequest) {
  const startTime = Date.now()
  const clientIP = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown"
  const userAgent = req.headers.get("user-agent") || "unknown"

  try {
    console.log("=== LESSON ACCESS REQUEST START ===")
    console.log("Timestamp:", new Date().toISOString())

    // Get parameters from URL
    const { searchParams } = new URL(req.url)
    const courseId = searchParams.get("courseId")
    const lessonId = searchParams.get("lessonId")

    console.log("🔍 Request params:", { courseId, lessonId })

    // Validate parameters exist
    if (!courseId || !lessonId) {
      console.log("❌ Missing required parameters")
      return NextResponse.json(
        {
          success: false,
          message: "Parámetros courseId y lessonId son requeridos",
          debug: { courseId, lessonId },
        },
        { status: 400 },
      )
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

    if (!uuidRegex.test(courseId)) {
      console.log("❌ Invalid courseId UUID format:", courseId)
      return NextResponse.json(
        {
          success: false,
          message: "courseId debe ser un UUID válido",
          debug: { courseId, isValidUUID: false },
        },
        { status: 400 },
      )
    }

    if (!uuidRegex.test(lessonId)) {
      console.log("❌ Invalid lessonId UUID format:", lessonId)
      return NextResponse.json(
        {
          success: false,
          message: "lessonId debe ser un UUID válido",
          debug: { lessonId, isValidUUID: false },
        },
        { status: 400 },
      )
    }

    console.log("✅ Valid UUID formats confirmed")

    // Get user session
    const cookieHeader = req.headers.get("cookie")
    console.log("🍪 Cookie header present:", !!cookieHeader)

    const userSession = getUserSessionFromCookie(cookieHeader)
    console.log("👤 User session found:", !!userSession)

    if (!userSession) {
      console.log("❌ No valid session - redirecting to login")
      await logStudentAccess(
        null,
        "anonymous",
        "lesson_access_denied",
        false,
        "NO_SESSION",
        `Attempted to access lesson ${lessonId} in course ${courseId}`,
        clientIP,
        userAgent,
      )

      return NextResponse.json(
        {
          success: false,
          message: "Debes iniciar sesión para acceder a las lecciones",
          redirect: "/auth/login",
        },
        { status: 401 },
      )
    }

    console.log("✅ User authenticated:", {
      id: userSession.id,
      email: userSession.email,
      role: userSession.role,
    })

    // Connect to database
    const supabase = getServerSupabaseClient()

    // STEP 1: Check if course exists
    console.log("=== STEP 1: CHECKING COURSE EXISTENCE ===")
    const { data: courseCheck, error: courseError } = await supabase
      .from("courses")
      .select("id, title, status")
      .eq("id", courseId)
      .single()

    console.log("📚 Course check result:", { courseCheck, courseError })

    if (courseError || !courseCheck) {
      console.log("❌ Course not found")
      return NextResponse.json(
        {
          success: false,
          message: `Curso ${courseId} no encontrado`,
          debug: { courseId, error: courseError?.message },
        },
        { status: 404 },
      )
    }

    console.log("✅ Course found:", courseCheck.title)

    // STEP 2: Check if lesson exists
    console.log("=== STEP 2: CHECKING LESSON EXISTENCE ===")
    const { data: lessonCheck, error: lessonError } = await supabase
      .from("lessons")
      .select("id, title, course_id, is_free, order_index")
      .eq("id", lessonId)
      .single()

    console.log("📖 Lesson check result:", { lessonCheck, lessonError })

    if (lessonError || !lessonCheck) {
      console.log("❌ Lesson not found - getting available lessons for debug")

      // Get all lessons for this course for debugging
      const { data: courseLessons } = await supabase
        .from("lessons")
        .select("id, title, order_index, is_free")
        .eq("course_id", courseId)
        .order("order_index")

      console.log("📋 Available lessons for course:", courseLessons)

      // Get some random lessons for comparison
      const { data: allLessons } = await supabase.from("lessons").select("id, title, course_id, is_free").limit(10)

      console.log("📋 Sample lessons in database:", allLessons)

      return NextResponse.json(
        {
          success: false,
          message: `Lección ${lessonId} no encontrada`,
          debug: {
            searchedLessonId: lessonId,
            searchedCourseId: courseId,
            courseLessons: courseLessons?.map((l) => ({
              id: l.id,
              title: l.title,
              order_index: l.order_index,
              is_free: l.is_free,
            })),
            sampleLessons: allLessons?.map((l) => ({
              id: l.id,
              title: l.title,
              course_id: l.course_id,
              is_free: l.is_free,
            })),
            error: lessonError?.message,
          },
        },
        { status: 404 },
      )
    }

    console.log("✅ Lesson found:", lessonCheck.title)

    // STEP 3: Verify lesson belongs to course
    console.log("=== STEP 3: VERIFYING LESSON-COURSE RELATIONSHIP ===")
    if (lessonCheck.course_id !== courseId) {
      console.log("❌ Lesson doesn't belong to specified course")
      console.log("Lesson course_id:", lessonCheck.course_id)
      console.log("Requested course_id:", courseId)

      return NextResponse.json(
        {
          success: false,
          message: "La lección no pertenece al curso especificado",
          debug: {
            lessonCourseId: lessonCheck.course_id,
            requestedCourseId: courseId,
            lessonTitle: lessonCheck.title,
          },
        },
        { status: 400 },
      )
    }

    console.log("✅ Lesson belongs to correct course")

    // STEP 4: Get full lesson data
    console.log("=== STEP 4: FETCHING FULL LESSON DATA ===")
    const { data: fullLesson, error: fullLessonError } = await supabase
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
          instructor
        )
      `)
      .eq("id", lessonId)
      .single()

    console.log("📚 Full lesson query result:", {
      success: !!fullLesson,
      error: fullLessonError?.message,
      lessonTitle: fullLesson?.title,
    })

    if (fullLessonError || !fullLesson) {
      console.log("❌ Error fetching full lesson data")
      return NextResponse.json(
        {
          success: false,
          message: "Error al cargar los datos completos de la lección",
          debug: { error: fullLessonError?.message },
        },
        { status: 500 },
      )
    }

    console.log("✅ Full lesson data loaded:", fullLesson.title)

    // STEP 5: Check access permissions
    console.log("=== STEP 5: CHECKING ACCESS PERMISSIONS ===")

    let hasAccess = false
    let accessType = "no_access"
    let accessReason = "Sin acceso"

    // Check admin access
    if (userSession.role === "admin") {
      hasAccess = true
      accessType = "admin"
      accessReason = "Acceso de administrador"
      console.log("✅ ADMIN ACCESS GRANTED")
    }
    // Check free lesson access
    else if (fullLesson.is_free) {
      hasAccess = true
      accessType = "free"
      accessReason = "Lección gratuita"
      console.log("✅ FREE LESSON ACCESS GRANTED")
    }
    // Check enrollment access
    else {
      console.log("🔍 Checking enrollment for premium lesson...")
      const { data: enrollment, error: enrollmentError } = await supabase
        .from("enrollments")
        .select("id, status")
        .eq("user_id", userSession.id)
        .eq("course_id", courseId)
        .eq("status", "active")
        .single()

      console.log("📝 Enrollment check:", { enrollment, enrollmentError })

      if (enrollment && !enrollmentError) {
        hasAccess = true
        accessType = "enrolled"
        accessReason = "Usuario inscrito en el curso"
        console.log("✅ ENROLLMENT ACCESS GRANTED")
      } else {
        hasAccess = false
        accessType = "no_access"
        accessReason = "Requiere inscripción al curso"
        console.log("❌ NO ENROLLMENT - ACCESS DENIED")
      }
    }

    const accessDetails = {
      is_admin: userSession.role === "admin",
      is_free: fullLesson.is_free,
      is_enrolled: accessType === "enrolled",
      has_access: hasAccess,
      access_reason: accessReason,
    }

    console.log("🔐 Final access decision:", accessDetails)

    // STEP 6: Log access attempt
    await logStudentAccess(
      userSession.id,
      userSession.email,
      hasAccess ? "lesson_access_granted" : "lesson_access_denied",
      hasAccess,
      hasAccess ? null : "NO_ACCESS",
      `${hasAccess ? "Access granted" : "Access denied"} to lesson ${fullLesson.title} via ${accessType}`,
      clientIP,
      userAgent,
    )

    // STEP 7: Return result
    if (!hasAccess) {
      console.log("❌ FINAL RESULT: ACCESS DENIED")
      return NextResponse.json(
        {
          success: false,
          message: "No tienes acceso a esta lección",
          access_details: accessDetails,
          lesson_info: {
            title: fullLesson.title,
            is_free: fullLesson.is_free,
            course_title: fullLesson.courses.title,
          },
        },
        { status: 403 },
      )
    }

    const endTime = Date.now()
    console.log("✅ FINAL RESULT: ACCESS GRANTED")
    console.log("Processing time:", endTime - startTime, "ms")
    console.log("Access type:", accessType)
    console.log("User:", userSession.email)
    console.log("Lesson:", fullLesson.title)

    return NextResponse.json({
      success: true,
      lesson: fullLesson,
      access_type: accessType,
      access_details: accessDetails,
    })
  } catch (error) {
    const endTime = Date.now()
    console.error("=== LESSON ACCESS ERROR ===")
    console.error("Processing time:", endTime - startTime, "ms")
    console.error("Error details:", error)
    console.error("Stack trace:", error instanceof Error ? error.stack : "No stack trace")

    return NextResponse.json(
      {
        success: false,
        message: "Error interno del servidor",
        debug: {
          error: error instanceof Error ? error.message : "Unknown error",
          timestamp: new Date().toISOString(),
        },
      },
      { status: 500 },
    )
  }
}
