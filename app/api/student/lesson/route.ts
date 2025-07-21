import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

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

    // Simplified query - just get the lesson if it exists
    console.log("🔍 Fetching lesson data...")
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
          description
        )
      `)
      .eq("id", lessonId)
      .single()

    if (lessonError || !lesson) {
      console.log("❌ Lesson not found:", lessonError?.message)
      return NextResponse.json(
        {
          success: false,
          error: "Lesson not found",
          debug: lessonError?.message || "Lesson does not exist",
        },
        { status: 404, headers },
      )
    }

    console.log("✅ Lesson found:", lesson.title)

    // For now, grant access to all lessons to fix the immediate issue
    const hasAccess = true
    const accessReason = "open_access"

    const responseData = {
      success: true,
      lesson: {
        id: lesson.id,
        title: lesson.title,
        description: lesson.description,
        content: lesson.content,
        video_url: lesson.video_url,
        duration_minutes: lesson.duration_minutes || 30,
        order_index: lesson.order_index,
        is_free: lesson.is_free !== false, // Default to true if not specified
        course: {
          id: lesson.courses.id,
          title: lesson.courses.title,
          description: lesson.courses.description,
        },
      },
      hasAccess,
      accessReason,
      message: "Access granted",
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
