import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET(request: NextRequest, { params }: { params: { courseId: string } }) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const { courseId } = params

    const { data: course, error } = await supabase
      .from("courses")
      .select(`
        id,
        title,
        description,
        price,
        instructor_name,
        thumbnail_url,
        duration_hours,
        difficulty_level,
        created_at,
        lessons (
          id,
          title,
          description,
          video_url,
          duration_minutes,
          order_index,
          is_free
        )
      `)
      .eq("id", courseId)
      .single()

    if (error) {
      return NextResponse.json({
        success: false,
        message: `Error fetching course: ${error.message}`,
      })
    }

    return NextResponse.json({
      success: true,
      data: course,
    })
  } catch (error) {
    console.error("Internal error in GET /api/admin/courses/[courseId]:", error)
    return NextResponse.json({
      success: false,
      message: `Internal error: ${(error as Error).message}`,
    })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { courseId: string } }) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const { courseId } = params
    const body = await request.json()

    const { data: course, error } = await supabase
      .from("courses")
      .update({
        title: body.title,
        description: body.description,
        price: body.price,
        instructor_name: body.instructor,
        thumbnail_url: body.thumbnail_url,
        duration_hours: body.duration_hours,
        difficulty_level: body.difficulty_level,
        archived: body.archived || false,
        updated_at: new Date().toISOString(),
      })
      .eq("id", courseId)
      .select()
      .single()

    if (error) {
      return NextResponse.json({
        success: false,
        message: `Error updating course: ${error.message}`,
      })
    }

    return NextResponse.json({
      success: true,
      data: course,
      message: "Course updated successfully",
    })
  } catch (error) {
    console.error("Internal error in PUT /api/admin/courses/[courseId]:", error)
    return NextResponse.json({
      success: false,
      message: `Internal error: ${(error as Error).message}`,
    })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { courseId: string } }) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const { courseId } = params

    // Delete related data first
    await supabase.from("course_tags").delete().eq("course_id", courseId)
    await supabase.from("lessons").delete().eq("course_id", courseId)
    await supabase.from("enrollments").delete().eq("course_id", courseId)

    // Delete the course
    const { error } = await supabase.from("courses").delete().eq("id", courseId)

    if (error) {
      return NextResponse.json({
        success: false,
        message: `Error deleting course: ${error.message}`,
      })
    }

    return NextResponse.json({
      success: true,
      message: "Course deleted successfully",
    })
  } catch (error) {
    console.error("Internal error in DELETE /api/admin/courses/[courseId]:", error)
    return NextResponse.json({
      success: false,
      message: `Internal error: ${(error as Error).message}`,
    })
  }
}
