import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""
    const status = searchParams.get("status") || ""
    const tag = searchParams.get("tag") || ""
    const includeArchived = searchParams.get("includeArchived") === "true"

    const offset = (page - 1) * limit

    let query = supabase.from("courses").select(
      `
        id,
        title,
        description,
        instructor_name,
        price,
        duration,
        level,
        status,
        archived,
        is_free,
        thumbnail_url,
        created_at,
        updated_at,
        course_tags (
          course_tag_definitions (
            id,
            name,
            color
          )
        )
      `,
      { count: "exact" },
    )

    // Filter out archived courses unless specifically requested
    if (!includeArchived) {
      query = query.eq("archived", false)
    }

    // Apply filters
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,instructor_name.ilike.%${search}%`)
    }

    if (status && status !== "all") {
      query = query.eq("status", status)
    }

    // Apply pagination
    query = query.order("created_at", { ascending: false }).range(offset, offset + limit - 1)

    const { data: courses, error, count } = await query

    if (error) {
      console.error("Error fetching courses:", error)
      return NextResponse.json(
        { error: "Failed to fetch courses", details: error.message },
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      )
    }

    // Filter by tag if specified
    let filteredCourses = courses || []
    if (tag) {
      filteredCourses =
        courses?.filter((course) =>
          course.course_tags?.some((ct: any) => ct.course_tag_definitions?.name?.toLowerCase() === tag.toLowerCase()),
        ) || []
    }

    return NextResponse.json(
      {
        courses: filteredCourses,
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
        },
      },
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    )
  } catch (error) {
    console.error("Unexpected error in courses API:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      title,
      description,
      instructor_name,
      price,
      duration,
      level,
      is_free,
      thumbnail_url,
      status = "draft",
    } = body

    // Validate required fields
    if (!title || !description || !instructor_name) {
      return NextResponse.json(
        { error: "Missing required fields: title, description, instructor_name" },
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      )
    }

    const { data: course, error } = await supabase
      .from("courses")
      .insert({
        title,
        description,
        instructor_name,
        price: is_free ? 0 : price,
        duration,
        level,
        is_free: is_free || false,
        thumbnail_url,
        status,
        archived: false,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating course:", error)
      return NextResponse.json(
        { error: "Failed to create course", details: error.message },
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      )
    }

    return NextResponse.json(
      { course },
      {
        status: 201,
        headers: { "Content-Type": "application/json" },
      },
    )
  } catch (error) {
    console.error("Unexpected error creating course:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}
