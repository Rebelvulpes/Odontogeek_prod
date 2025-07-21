import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET() {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    console.log("🔍 Fetching courses for admin dashboard...")

    const { data: courses, error } = await supabase
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
        archived,
        created_at,
        status,
        lessons:lessons!inner(
          id,
          title,
          description,
          video_url,
          duration_minutes,
          order_index,
          is_free,
          archived,
          created_at,
          status
        )
      `)
      .eq("lessons.archived", false)
      .eq("lessons.status", "published")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching courses:", error)
      return NextResponse.json({
        success: false,
        message: `Error fetching courses: ${error.message}`,
      })
    }

    console.log(`✅ Found ${courses?.length || 0} courses`)

    // Process courses to get additional data
    const processedCourses = await Promise.all(
      (courses || []).map(async (course) => {
        // Get course tags
        const { data: courseTags } = await supabase
          .from("course_tags")
          .select(`
            tags (
              id,
              name,
              slug,
              color,
              description
            )
          `)
          .eq("course_id", course.id)

        // Get enrollment count
        const { count: studentsCount } = await supabase
          .from("enrollments")
          .select("*", { count: "exact", head: true })
          .eq("course_id", course.id)

        // Calculate revenue
        const revenue = (studentsCount || 0) * (course.price || 0)

        return {
          ...course,
          tags: courseTags?.map((relation) => relation.tags).filter(Boolean) || [],
          students: studentsCount || 0,
          revenue,
          lessonsCount: course.lessons?.length || 0,
        }
      }),
    )

    console.log("✅ Processed courses with additional data")

    return NextResponse.json({
      success: true,
      data: processedCourses,
    })
  } catch (error) {
    console.error("Internal error in GET /api/admin/courses:", error)
    return NextResponse.json({
      success: false,
      message: `Internal error: ${(error as Error).message}`,
    })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { title, description, price, instructor, thumbnail_url, duration_hours, difficulty_level, tags } = body

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Create the course
    const { data: course, error: courseError } = await supabase
      .from("courses")
      .insert({
        title,
        description,
        price: Number.parseFloat(price),
        instructor_name: instructor,
        thumbnail_url,
        duration_hours: duration_hours ? Number.parseInt(duration_hours) : null,
        difficulty_level: difficulty_level || "principiante",
        status: "published",
        archived: false,
      })
      .select()
      .single()

    if (courseError) {
      console.error("Error creating course:", courseError)
      return NextResponse.json({
        success: false,
        message: `Error creating course: ${courseError.message}`,
      })
    }

    // Add tags if provided
    if (tags && tags.length > 0) {
      const tagRelations = tags.map((tagId: string) => ({
        course_id: course.id,
        tag_id: tagId,
      }))

      const { error: tagsError } = await supabase.from("course_tags").insert(tagRelations)

      if (tagsError) {
        console.error("Error adding course tags:", tagsError)
      }
    }

    return NextResponse.json({
      success: true,
      data: course,
      message: "Course created successfully",
    })
  } catch (error) {
    console.error("Internal error in POST /api/admin/courses:", error)
    return NextResponse.json({
      success: false,
      message: `Internal error: ${(error as Error).message}`,
    })
  }
}
