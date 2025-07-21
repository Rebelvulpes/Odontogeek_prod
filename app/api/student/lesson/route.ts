import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(request: NextRequest) {
  try {
    // Set headers first
    const headers = {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache",
    }

    console.log("🔍 Starting lesson fetch request")

    const { searchParams } = new URL(request.url)
    const lessonId = searchParams.get("lessonId")
    const userId = searchParams.get("userId")

    console.log("📝 Request params:", { lessonId, userId })

    if (!lessonId) {
      console.log("❌ Missing lessonId parameter")
      return NextResponse.json({ error: "Lesson ID is required" }, { status: 400, headers })
    }

    if (!userId) {
      console.log("❌ Missing userId parameter")
      return NextResponse.json({ error: "User ID is required" }, { status: 400, headers })
    }

    // Fetch lesson with course information
    console.log("🔍 Fetching lesson from database...")
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
        course_id,
        courses!inner (
          id,
          title,
          description,
          status,
          is_free
        )
      `)
      .eq("id", lessonId)
      .eq("status", "published")
      .single()

    if (lessonError) {
      console.log("❌ Database error fetching lesson:", lessonError)
      return NextResponse.json({ error: "Lesson not found or not available" }, { status: 404, headers })
    }

    if (!lesson) {
      console.log("❌ Lesson not found in database")
      return NextResponse.json({ error: "Lesson not found" }, { status: 404, headers })
    }

    console.log("✅ Lesson found:", lesson.title)

    // Check if lesson is free or user has access
    let hasAccess = false

    if (lesson.is_free) {
      console.log("✅ Lesson is free, granting access")
      hasAccess = true
    } else {
      // Check enrollment
      console.log("🔍 Checking user enrollment...")
      const { data: enrollment, error: enrollmentError } = await supabase
        .from("enrollments")
        .select("id, status")
        .eq("user_id", userId)
        .eq("course_id", lesson.course_id)
        .eq("status", "active")
        .single()

      if (enrollmentError) {
        console.log("❌ Enrollment check error:", enrollmentError)
        hasAccess = false
      } else if (enrollment) {
        console.log("✅ User has active enrollment")
        hasAccess = true
      } else {
        console.log("❌ No active enrollment found")
        hasAccess = false
      }
    }

    // Prepare response data
    const responseData = {
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
      message: hasAccess ? "Access granted" : "Enrollment required to access this lesson",
    }

    console.log("✅ Returning lesson data with access:", hasAccess)
    return NextResponse.json(responseData, { headers })
  } catch (error) {
    console.error("💥 Unexpected error in lesson API:", error)

    // Always return JSON, never plain text
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "An unexpected error occurred while fetching the lesson",
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
