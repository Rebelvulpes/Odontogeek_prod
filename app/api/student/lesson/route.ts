import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const lessonId = searchParams.get("lessonId")
    const userId = searchParams.get("userId")

    console.log("🔍 Lesson API called with:", { lessonId, userId })

    if (!lessonId) {
      console.log("❌ No lesson ID provided")
      return NextResponse.json(
        { error: "Lesson ID is required" },
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      )
    }

    // First, check if the lesson exists at all
    const { data: lessonExists, error: lessonExistsError } = await supabase
      .from("lessons")
      .select("id, title, course_id, status, archived")
      .eq("id", lessonId)
      .single()

    console.log("🔍 Lesson exists check:", { lessonExists, lessonExistsError })

    if (lessonExistsError || !lessonExists) {
      console.log("❌ Lesson not found in database")
      return NextResponse.json(
        { error: "Lesson not found in database" },
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        },
      )
    }

    // Check if lesson is archived or not published
    if (lessonExists.archived || lessonExists.status !== "published") {
      console.log("❌ Lesson is not available:", {
        archived: lessonExists.archived,
        status: lessonExists.status,
      })
      return NextResponse.json(
        { error: "Lesson not available", details: { archived: lessonExists.archived, status: lessonExists.status } },
        {
          status: 403,
          headers: { "Content-Type": "application/json" },
        },
      )
    }

    // Check if the course exists and is published
    const { data: courseExists, error: courseError } = await supabase
      .from("courses")
      .select("id, title, status, archived, is_free")
      .eq("id", lessonExists.course_id)
      .single()

    console.log("🔍 Course check:", { courseExists, courseError })

    if (courseError || !courseExists) {
      console.log("❌ Course not found")
      return NextResponse.json(
        { error: "Course not found" },
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        },
      )
    }

    if (courseExists.archived || courseExists.status !== "published") {
      console.log("❌ Course is not available:", {
        archived: courseExists.archived,
        status: courseExists.status,
      })
      return NextResponse.json(
        { error: "Course not available", details: { archived: courseExists.archived, status: courseExists.status } },
        {
          status: 403,
          headers: { "Content-Type": "application/json" },
        },
      )
    }

    // Get the full lesson data
    const { data: lesson, error: lessonError } = await supabase
      .from("lessons")
      .select(`
        id,
        title,
        content,
        video_url,
        duration,
        order_index,
        course_id,
        status,
        archived,
        created_at,
        updated_at
      `)
      .eq("id", lessonId)
      .eq("status", "published")
      .eq("archived", false)
      .single()

    console.log("🔍 Full lesson data:", { lesson, lessonError })

    if (lessonError || !lesson) {
      console.log("❌ Error fetching lesson data:", lessonError)
      return NextResponse.json(
        { error: "Error fetching lesson data", details: lessonError?.message },
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      )
    }

    // If userId is provided, check enrollment
    if (userId) {
      const { data: enrollment, error: enrollmentError } = await supabase
        .from("enrollments")
        .select("id, status, progress")
        .eq("user_id", userId)
        .eq("course_id", lesson.course_id)
        .single()

      console.log("🔍 Enrollment check:", { enrollment, enrollmentError })

      // If course is not free and user is not enrolled
      if (!courseExists.is_free && (!enrollment || enrollmentError)) {
        console.log("❌ User not enrolled in paid course")
        return NextResponse.json(
          { error: "Enrollment required for this course" },
          {
            status: 403,
            headers: { "Content-Type": "application/json" },
          },
        )
      }
    }

    console.log("✅ Lesson access granted")
    return NextResponse.json(
      {
        lesson,
        course: {
          id: courseExists.id,
          title: courseExists.title,
          is_free: courseExists.is_free,
        },
      },
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    )
  } catch (error) {
    console.error("❌ Unexpected error in lesson API:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}
