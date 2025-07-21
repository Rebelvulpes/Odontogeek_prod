import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

// Helper function to get user session from cookies
function getUserFromCookies(cookieHeader: string | null): { id: string; email: string; role: string } | null {
  if (!cookieHeader) return null

  try {
    const sessionCookie = cookieHeader
      .split(";")
      .find((c) => c.trim().startsWith("session="))
      ?.split("=")[1]

    if (!sessionCookie) return null

    const decoded = decodeURIComponent(sessionCookie)
    const sessionData = JSON.parse(decoded)

    if (sessionData && sessionData.id && sessionData.email) {
      return {
        id: sessionData.id,
        email: sessionData.email,
        role: sessionData.role || "student",
      }
    }

    return null
  } catch (error) {
    console.error("Error parsing session cookie:", error)
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    const headers = {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache",
    }

    console.log("🔍 Starting lesson fetch request")

    const { searchParams } = new URL(request.url)
    const lessonId = searchParams.get("lessonId")

    console.log("📝 Request params:", { lessonId })

    if (!lessonId) {
      console.log("❌ Missing lessonId parameter")
      return NextResponse.json(
        {
          success: false,
          error: "Lesson ID is required",
        },
        { status: 400, headers },
      )
    }

    // Get user session from cookies
    const cookieHeader = request.headers.get("cookie")
    const userSession = getUserFromCookies(cookieHeader)

    console.log("👤 User session:", userSession ? `${userSession.email} (${userSession.role})` : "No session")

    // First check if lesson exists at all (including archived/draft)
    console.log("🔍 Checking if lesson exists...")
    const { data: lessonCheck, error: checkError } = await supabase
      .from("lessons")
      .select("id, title, status, archived")
      .eq("id", lessonId)
      .single()

    if (checkError || !lessonCheck) {
      console.log("❌ Lesson does not exist in database:", checkError?.message)
      return NextResponse.json(
        {
          success: false,
          error: "Lesson not found",
          debug: `Lesson ID ${lessonId} does not exist`,
        },
        { status: 404, headers },
      )
    }

    console.log("✅ Lesson exists:", lessonCheck.title, "Status:", lessonCheck.status)

    // Now fetch full lesson data with proper status filtering
    console.log("🔍 Fetching full lesson data...")
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
        status,
        archived,
        course_id,
        courses!inner (
          id,
          title,
          description,
          status,
          archived
        )
      `)
      .eq("id", lessonId)
      .eq("status", "published")
      .eq("archived", false)
      .eq("courses.status", "published")
      .eq("courses.archived", false)
      .single()

    if (lessonError || !lesson) {
      console.log("❌ Lesson not available (may be draft/archived):", lessonError?.message)
      return NextResponse.json(
        {
          success: false,
          error: "Lesson not found or not available",
          debug: `Lesson exists but is not published or is archived. Status: ${lessonCheck.status}, Archived: ${lessonCheck.archived}`,
        },
        { status: 404, headers },
      )
    }

    console.log("✅ Lesson found and available:", lesson.title)

    // Check access permissions
    let hasAccess = false
    let accessReason = ""

    if (!userSession) {
      if (lesson.is_free) {
        hasAccess = true
        accessReason = "free_lesson_no_auth"
        console.log("✅ Free lesson, no auth required")
      } else {
        hasAccess = false
        accessReason = "auth_required"
        console.log("❌ Authentication required for paid lesson")
        return NextResponse.json(
          {
            success: false,
            error: "Authentication required",
            lesson: {
              id: lesson.id,
              title: lesson.title,
              description: lesson.description,
              is_free: lesson.is_free,
              course: {
                id: lesson.courses.id,
                title: lesson.courses.title,
              },
            },
          },
          { status: 401, headers },
        )
      }
    } else {
      if (userSession.role === "admin") {
        hasAccess = true
        accessReason = "admin_access"
        console.log("✅ Admin access granted")
      } else if (lesson.is_free) {
        hasAccess = true
        accessReason = "free_lesson"
        console.log("✅ Free lesson access granted")
      } else {
        console.log("🔍 Checking user enrollment...")
        const { data: enrollment, error: enrollmentError } = await supabase
          .from("enrollments")
          .select("id, status")
          .eq("user_id", userSession.id)
          .eq("course_id", lesson.course_id)
          .eq("status", "active")
          .single()

        if (enrollment) {
          console.log("✅ User has active enrollment")
          hasAccess = true
          accessReason = "enrolled"
        } else {
          console.log("❌ No active enrollment found")
          hasAccess = false
          accessReason = "not_enrolled"
        }
      }
    }

    if (!hasAccess && userSession) {
      console.log("❌ Access denied")
      return NextResponse.json(
        {
          success: false,
          error: "Access denied - enrollment required",
          lesson: {
            id: lesson.id,
            title: lesson.title,
            description: lesson.description,
            is_free: lesson.is_free,
            course: {
              id: lesson.courses.id,
              title: lesson.courses.title,
            },
          },
        },
        { status: 403, headers },
      )
    }

    const responseData = {
      success: true,
      lesson: {
        id: lesson.id,
        title: lesson.title,
        description: lesson.description,
        content: hasAccess ? lesson.content : null,
        video_url: hasAccess ? lesson.video_url : null,
        duration_minutes: lesson.duration_minutes,
        order_index: lesson.order_index,
        is_free: lesson.is_free,
        course: {
          id: lesson.courses.id,
          title: lesson.courses.title,
          description: lesson.courses.description,
        },
      },
      hasAccess,
      accessReason,
      message: hasAccess ? "Access granted" : "Enrollment required to access this lesson",
    }

    console.log("✅ Returning lesson data with access:", hasAccess)
    return NextResponse.json(responseData, { headers })
  } catch (error) {
    console.error("💥 Unexpected error in lesson API:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message: "An unexpected error occurred while fetching the lesson",
        debug: error instanceof Error ? error.message : "Unknown error",
      },
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
        },
      },
    )
  }
}
