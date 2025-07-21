import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET() {
  try {
    console.log("=== GET /api/admin/courses ===")
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // First, get all courses
    const { data: courses, error: coursesError } = await supabase
      .from("courses")
      .select("*")
      .order("created_at", { ascending: false })

    if (coursesError) {
      console.error("Error fetching courses:", coursesError)
      return NextResponse.json({
        success: false,
        message: `Error fetching courses: ${coursesError.message}`,
      })
    }

    console.log(`Found ${courses?.length || 0} courses`)

    // Process each course to get additional data
    const processedCourses = await Promise.all(
      (courses || []).map(async (course) => {
        console.log(`Processing course: ${course.title} (${course.id})`)

        // Get lessons for this course
        const { data: lessons, error: lessonsError } = await supabase
          .from("lessons")
          .select("*")
          .eq("course_id", course.id)
          .eq("archived", false)
          .order("order_index", { ascending: true })

        if (lessonsError) {
          console.error(`Error fetching lessons for course ${course.id}:`, lessonsError)
        }

        // Get course tags
        const { data: courseTags, error: tagsError } = await supabase
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

        if (tagsError) {
          console.error(`Error fetching tags for course ${course.id}:`, tagsError)
        }

        // Get enrollment count
        const { count: studentsCount, error: enrollmentError } = await supabase
          .from("enrollments")
          .select("*", { count: "exact", head: true })
          .eq("course_id", course.id)

        if (enrollmentError) {
          console.error(`Error fetching enrollments for course ${course.id}:`, enrollmentError)
        }

        // Calculate revenue (mock data for now)
        const revenue = (studentsCount || 0) * (course.price || 0)

        const processedCourse = {
          id: course.id,
          title: course.title || "Sin título",
          description: course.description || "",
          price: course.price || 0,
          instructor_name: course.instructor_name || "Sin instructor",
          thumbnail_url: course.thumbnail_url || "",
          duration_hours: course.duration_hours || 0,
          difficulty_level: course.difficulty_level || "principiante",
          archived: course.archived || false,
          created_at: course.created_at,
          status: course.status || "published",
          lessons: lessons || [],
          tags: courseTags?.map((relation) => relation.tags).filter(Boolean) || [],
          students: studentsCount || 0,
          revenue,
          lessonsCount: lessons?.length || 0,
        }

        console.log(
          `Processed course ${course.title}: ${processedCourse.lessonsCount} lessons, ${processedCourse.students} students`,
        )
        return processedCourse
      }),
    )

    console.log(`Returning ${processedCourses.length} processed courses`)

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
    console.log("=== POST /api/admin/courses ===")
    const body = await req.json()
    console.log("Request body:", body)

    const { title, description, price, instructor, thumbnail_url, duration_hours, difficulty_level, tags } = body

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Create the course
    const courseData = {
      title: title || "Nuevo Curso",
      description: description || "",
      price: price ? Number.parseFloat(price) : 0,
      instructor_name: instructor || "Sin instructor",
      thumbnail_url: thumbnail_url || "",
      duration_hours: duration_hours ? Number.parseInt(duration_hours) : null,
      difficulty_level: difficulty_level || "principiante",
      status: "published",
      archived: false,
    }

    console.log("Creating course with data:", courseData)

    const { data: course, error: courseError } = await supabase.from("courses").insert(courseData).select().single()

    if (courseError) {
      console.error("Error creating course:", courseError)
      return NextResponse.json({
        success: false,
        message: `Error creating course: ${courseError.message}`,
      })
    }

    console.log("Course created successfully:", course)

    // Add tags if provided
    if (tags && Array.isArray(tags) && tags.length > 0) {
      console.log("Adding tags:", tags)
      const tagRelations = tags.map((tagId: string) => ({
        course_id: course.id,
        tag_id: tagId,
      }))

      const { error: tagsError } = await supabase.from("course_tags").insert(tagRelations)

      if (tagsError) {
        console.error("Error adding course tags:", tagsError)
        // Don't fail the entire operation, just log the error
      } else {
        console.log("Tags added successfully")
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
