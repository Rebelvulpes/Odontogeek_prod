import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 Fetching courses for admin dashboard")

    const { data: courses, error } = await supabase
      .from("courses")
      .select(`
        id,
        title,
        description,
        status,
        archived,
        is_free,
        thumbnail_url,
        created_at,
        updated_at,
        lessons!inner(count)
      `)
      .eq("archived", false)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("❌ Error fetching courses:", error)
      return NextResponse.json({ error: "Failed to fetch courses", details: error.message }, { status: 500 })
    }

    console.log(`✅ Found ${courses?.length || 0} courses`)

    return NextResponse.json({ courses: courses || [] })
  } catch (error) {
    console.error("💥 Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("📝 Creating new course:", body)

    const { title, description, thumbnail_url, is_free = false } = body

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }

    const { data: course, error } = await supabase
      .from("courses")
      .insert([
        {
          title,
          description: description || "",
          thumbnail_url: thumbnail_url || null,
          is_free,
          status: "published",
          archived: false,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("❌ Error creating course:", error)
      return NextResponse.json({ error: "Failed to create course", details: error.message }, { status: 500 })
    }

    console.log("✅ Course created successfully:", course.id)
    return NextResponse.json({ course })
  } catch (error) {
    console.error("💥 Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
