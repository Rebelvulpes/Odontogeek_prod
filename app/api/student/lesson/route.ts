import { type NextRequest, NextResponse } from "next/server"
import { getUserSessionFromCookie, getServerSupabaseClient, logStudentAccess } from "@/lib/server-utils"

export async function GET(req: NextRequest) {
  const startTime = Date.now()
  const clientIP = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown"
  const userAgent = req.headers.get("user-agent") || "unknown"

  try {
    console.log("=== LESSON ACCESS REQUEST ===")
    console.log("Timestamp:", new Date().toISOString())

    // Get parameters from URL
    const { searchParams } = new URL(req.url)
    const courseId = searchParams.get("courseId")
    const lessonId = searchParams.get("lessonId")

    console.log("Request params:", { courseId, lessonId })

    // Validate parameters
    if (!courseId || !lessonId) {
      console.log("❌ Missing parameters")
      return NextResponse.json(
        {
          success: false,
          message: "Parámetros courseId y lessonId son requeridos",
        },
        { status: 400 },
      )
    }

    // Validate UUID format for both IDs
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

    if (!uuidRegex.test(courseId) || !uuidRegex.test(lessonId)) {
      console.log("❌ Invalid UUID format:", { courseId, lessonId })
      return NextResponse.json(
        {
          success: false,
          message: "IDs de curso y lección deben ser UUIDs válidos",
        },
        { status: 400 },
      )
    }

    console.log("✅ Valid UUID format for both IDs")

    // Get user session from cookie with better error handling
    const cookieHeader = req.headers.get("cookie")
    console.log("Cookie header present:", !!cookieHeader)

    const userSession = getUserSessionFromCookie(cookieHeader)
    console.log("User session found:", !!userSession)

    if (userSession) {
      console.log("User details:", {
        id: userSession.id,
        email: userSession.email,
        role: userSession.role,
        sessionAge: userSession.created_at
          ? Math.floor((Date.now() - new Date(userSession.created_at).getTime()) / (1000 * 60 * 60 * 24)) + " days"
          : "unknown",
      })
    }

    if (!userSession) {
      console.log("❌ No valid session found")
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

    // Connect to database
    const supabase = getServerSupabaseClient()

    // First, let's check if the lesson exists at all
    console.log("=== CHECKING LESSON EXISTENCE ===")
    const { data: lessonCheck, error: lessonCheckError } = await supabase
      .from("lessons")
      .select("id, title, course_id, is_free")
      .eq("id", lessonId)
      .single()

    console.log("Lesson check result:", { lessonCheck, lessonCheckError })

    if (lessonCheckError || !lessonCheck) {
      console.log("❌ Lesson not found in database")

      // Let's see what lessons exist for debugging
      const { data: allLessons } = await supabase.from("lessons").select("id, title, course_id, is_free").limit(10)

      console.log("Available lessons:", allLessons)

      // Also check lessons for this specific course
      const { data: courseLessons } = await supabase
        .from("lessons")
        .select("id, title, order_index, is_free")
        .eq("course_id", courseId)
        .order("order_index")

      console.log("Lessons for course", courseId, ":", courseLessons)

      return NextResponse.json(
        {
          success: false,
          message: `Lección ${lessonId} no encontrada`,
          debug: {
            searchedLessonId: lessonId,
            searchedCourseId: courseId,
            availableLessons: allLessons?.map((l) => ({
              id: l.id,
              title: l.title,
              course_id: l.course_id,
              is_free: l.is_free,
            })),
            courseLessons: courseLessons?.map((l) => ({
              id: l.id,
              title: l.title,
              order_index: l.order_index,
              is_free: l.is_free,
            })),
          },
        },
        { status: 404 },
      )
    }

    // Check if lesson belongs to the specified course
    if (lessonCheck.course_id !== courseId) {
      console.log("❌ Lesson doesn't belong to specified course")
      console.log("Lesson course_id:", lessonCheck.course_id, "Requested course_id:", courseId)

      return NextResponse.json(
        {
          success: false,
          message: "La lección no pertenece al curso especificado",
          debug: {
            lessonCourseId: lessonCheck.course_id,
            requestedCourseId: courseId,
          },
        },
        { status: 400 },
      )
    }

    // Now get the full lesson with course information
    console.log("=== FETCHING FULL LESSON DATA ===")
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
          instructor
        )
      `)
      .eq("id", lessonId)
      .eq("course_id", courseId)
      .single()

    console.log("Full lesson query result:", { lesson, lessonError })

    if (lessonError || !lesson) {
      console.log("❌ Error fetching full lesson data:", lessonError)
      return NextResponse.json(
        {
          success: false,
          message: "Error al cargar los datos de la lección",
        },
        { status: 500 },
      )
    }

    console.log("✅ Lesson found:", lesson.title)

    // Check access using database function
    console.log("=== CHECKING ACCESS PERMISSIONS ===")
    const { data: accessResult, error: accessError } = await supabase.rpc("check_lesson_access", {
      user_id_param: userSession.id,
      lesson_id_param: lessonId,
      course_id_param: courseId,
    })

    console.log("Access check result:", { accessResult, accessError })

    let enrollment = null

    if (accessError) {
      console.log("❌ Error checking access:", accessError)

      // Fallback to manual access check
      console.log("🔄 Falling back to manual access check")

      let hasAccess = false
      let accessType = "no_access"
      let accessReason = "Error verificando acceso"

      // Check if user is admin
      if (userSession.role === "admin") {
        hasAccess = true
        accessType = "admin"
        accessReason = "Acceso de administrador"
      }
      // Check if lesson is free
      else if (lesson.is_free) {
        hasAccess = true
        accessType = "free"
        accessReason = "Lección gratuita"
      }
      // Check if user is enrolled
      else {
        const { data: enrollmentData } = await supabase
          .from("enrollments")
          .select("id")
          .eq("user_id", userSession.id)
          .eq("course_id", courseId)
          .eq("status", "active")
          .single()

        enrollment = enrollmentData

        if (enrollmentData) {
          hasAccess = true
          accessType = "enrolled"
          accessReason = "Usuario inscrito en el curso"
        }
      }

      const accessDetails = {
        is_admin: userSession.role === "admin",
        is_free: lesson.is_free,
        is_enrolled: !!enrollment,
        has_access: hasAccess,
        access_reason: accessReason,
      }

      console.log("Manual access check result:", accessDetails)

      if (!hasAccess) {
        await logStudentAccess(
          userSession.id,
          userSession.email,
          "lesson_access_denied",
          false,
          "NO_ACCESS",
          `Access denied to lesson ${lessonId} in course ${courseId}: ${accessReason}`,
          clientIP,
          userAgent,
        )

        return NextResponse.json(
          {
            success: false,
            message: "No tienes acceso a esta lección",
            access_details: accessDetails,
          },
          { status: 403 },
        )
      }

      // Log successful access
      await logStudentAccess(
        userSession.id,
        userSession.email,
        "lesson_access_granted",
        true,
        null,
        `Access granted to lesson ${lessonId} (${lesson.title}) via ${accessType}`,
        clientIP,
        userAgent,
      )

      const endTime = Date.now()
      console.log("✅ LESSON ACCESS GRANTED (manual)")
      console.log("Processing time:", endTime - startTime, "ms")
      console.log("Access type:", accessType)

      return NextResponse.json({
        success: true,
        lesson,
        access_type: accessType,
        access_details: accessDetails,
      })
    }

    // Process RPC result
    const access = accessResult[0]
    if (!access.has_access) {
      console.log("❌ Access denied:", access.access_reason)

      await logStudentAccess(
        userSession.id,
        userSession.email,
        "lesson_access_denied",
        false,
        "NO_ACCESS",
        `Access denied to lesson ${lessonId}: ${access.access_reason}`,
        clientIP,
        userAgent,
      )

      return NextResponse.json(
        {
          success: false,
          message: "No tienes acceso a esta lección",
          access_details: {
            is_admin: access.is_admin,
            is_free: access.is_free,
            is_enrolled: access.is_enrolled,
            has_access: access.has_access,
            access_reason: access.access_reason,
          },
        },
        { status: 403 },
      )
    }

    // Log successful access
    await logStudentAccess(
      userSession.id,
      userSession.email,
      "lesson_access_granted",
      true,
      null,
      `Access granted to lesson ${lessonId} (${lesson.title}) via ${access.access_type}`,
      clientIP,
      userAgent,
    )

    const endTime = Date.now()
    console.log("✅ LESSON ACCESS GRANTED")
    console.log("Processing time:", endTime - startTime, "ms")
    console.log("Access type:", access.access_type)
    console.log("User:", userSession.email)
    console.log("Lesson:", lesson.title)

    return NextResponse.json({
      success: true,
      lesson,
      access_type: access.access_type,
      access_details: {
        is_admin: access.is_admin,
        is_free: access.is_free,
        is_enrolled: access.is_enrolled,
        has_access: access.has_access,
        access_reason: access.access_reason,
      },
    })
  } catch (error) {
    const endTime = Date.now()
    console.error("=== LESSON ACCESS ERROR ===")
    console.error("Processing time:", endTime - startTime, "ms")
    console.error("Error details:", error)

    return NextResponse.json(
      {
        success: false,
        message: "Error interno del servidor",
      },
      { status: 500 },
    )
  }
}
