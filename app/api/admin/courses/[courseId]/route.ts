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
        *,
        lessons (
          id,
          title,
          description,
          video_url,
          duration_minutes,
          order_index,
          is_free,
          archived,
          created_at
        )
      `)
      .eq("id", courseId)
      .single()

    if (error) {
      console.error("Error obteniendo curso:", error)
      return NextResponse.json(
        {
          success: false,
          message: "Error obteniendo curso",
          error: error,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      data: course,
    })
  } catch (error) {
    console.error("Error en GET curso:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Error interno del servidor",
        error: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}

export async function PUT(req: NextRequest, { params }: { params: { courseId: string } }) {
  try {
    const { courseId } = params
    const body = await req.json()
    const { title, description, price, instructor, thumbnail_url, duration_hours, difficulty_level, tags, archived } =
      body

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Update course
    const updateData: any = {}
    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (price !== undefined) updateData.price = Number.parseFloat(price)
    if (instructor !== undefined) updateData.instructor_name = instructor
    if (thumbnail_url !== undefined) updateData.thumbnail_url = thumbnail_url
    if (duration_hours !== undefined)
      updateData.duration_hours = duration_hours ? Number.parseInt(duration_hours) : null
    if (difficulty_level !== undefined) updateData.difficulty_level = difficulty_level
    if (archived !== undefined) updateData.archived = archived

    const { data: course, error: courseError } = await supabase
      .from("courses")
      .update(updateData)
      .eq("id", courseId)
      .select()
      .single()

    if (courseError) {
      console.error("Error updating course:", courseError)
      return NextResponse.json({
        success: false,
        message: `Error updating course: ${courseError.message}`,
      })
    }

    // Update tags if provided
    if (tags !== undefined) {
      // Remove existing tags
      await supabase.from("course_tags").delete().eq("course_id", courseId)

      // Add new tags
      if (tags.length > 0) {
        const tagRelations = tags.map((tagId: string) => ({
          course_id: courseId,
          tag_id: tagId,
        }))

        const { error: tagsError } = await supabase.from("course_tags").insert(tagRelations)

        if (tagsError) {
          console.error("Error updating course tags:", tagsError)
          // Don't fail the entire operation, just log the error
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: course,
      message: "Course updated successfully",
    })
  } catch (error) {
    console.error("Internal error in PUT /api/admin/courses:", error)
    return NextResponse.json({
      success: false,
      message: `Internal error: ${(error as Error).message}`,
    })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { courseId: string } }) {
  try {
    const { courseId } = params
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Delete course tags first
    await supabase.from("course_tags").delete().eq("course_id", courseId)

    // Delete lessons
    await supabase.from("lessons").delete().eq("course_id", courseId)

    // Delete enrollments
    await supabase.from("enrollments").delete().eq("course_id", courseId)

    // Delete the course
    const { error: courseError } = await supabase.from("courses").delete().eq("id", courseId)

    if (courseError) {
      console.error("Error deleting course:", courseError)
      return NextResponse.json({
        success: false,
        message: `Error deleting course: ${courseError.message}`,
      })
    }

    return NextResponse.json({
      success: true,
      message: "Course and all related data deleted successfully",
    })
  } catch (error) {
    console.error("Internal error in DELETE /api/admin/courses:", error)
    return NextResponse.json({
      success: false,
      message: `Internal error: ${(error as Error).message}`,
    })
  }
}
