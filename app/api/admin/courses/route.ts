import { type NextRequest, NextResponse } from "next/server"
import { getUserSessionFromCookie, getServerSupabaseClient } from "@/lib/server-utils"

export async function GET(request: NextRequest) {
  try {
    console.log("=== ADMIN COURSES API - GET REQUEST ===")

    // Get user session
    const cookieHeader = request.headers.get("cookie")
    const userSession = getUserSessionFromCookie(cookieHeader)

    if (!userSession) {
      console.log("❌ No valid session found")
      return NextResponse.json({ success: false, message: "No autenticado" }, { status: 401 })
    }

    if (userSession.role !== "admin") {
      console.log("❌ User is not admin:", userSession.role)
      return NextResponse.json({ success: false, message: "No autorizado" }, { status: 403 })
    }

    console.log("✅ Admin user authenticated:", userSession.email)

    // Get Supabase client
    const supabase = getServerSupabaseClient()

    // Fetch courses with detailed logging
    console.log("🔍 Fetching courses from database...")
    const { data: courses, error } = await supabase
      .from("courses")
      .select(`
        id,
        title,
        description,
        price,
        instructor,
        status,
        difficulty_level,
        thumbnail_url,
        is_free,
        created_at,
        updated_at
      `)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("❌ Database error fetching courses:", error)
      return NextResponse.json(
        { success: false, message: "Error al obtener cursos", error: error.message },
        { status: 500 },
      )
    }

    console.log(`✅ Found ${courses?.length || 0} courses`)

    // Log course details for debugging
    if (courses && courses.length > 0) {
      console.log("📚 Courses found:")
      courses.forEach((course, index) => {
        console.log(`  ${index + 1}. ${course.title} (${course.status}) - $${course.price}`)
      })
    } else {
      console.log("⚠️ No courses found in database")
    }

    return NextResponse.json({
      success: true,
      courses: courses || [],
      count: courses?.length || 0,
    })
  } catch (error) {
    console.error("❌ Unexpected error in courses API:", error)
    return NextResponse.json({ success: false, message: "Error interno del servidor" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("=== ADMIN COURSES API - POST REQUEST ===")

    // Get user session
    const cookieHeader = request.headers.get("cookie")
    const userSession = getUserSessionFromCookie(cookieHeader)

    if (!userSession || userSession.role !== "admin") {
      console.log("❌ Unauthorized access attempt")
      return NextResponse.json({ success: false, message: "No autorizado" }, { status: 403 })
    }

    console.log("✅ Admin user creating course:", userSession.email)

    // Parse request body
    const body = await request.json()
    console.log("📝 Course data received:", body)

    const {
      title,
      description,
      price,
      instructor,
      difficulty_level = "beginner",
      thumbnail_url,
      is_free = false,
    } = body

    // Validate required fields
    if (!title || !description || !instructor) {
      console.log("❌ Missing required fields")
      return NextResponse.json({ success: false, message: "Faltan campos requeridos" }, { status: 400 })
    }

    // Get Supabase client
    const supabase = getServerSupabaseClient()

    // Create course
    console.log("💾 Creating course in database...")
    const { data: course, error } = await supabase
      .from("courses")
      .insert([
        {
          title,
          description,
          price: Number.parseFloat(price) || 0,
          instructor,
          difficulty_level,
          thumbnail_url: thumbnail_url || null,
          is_free: Boolean(is_free),
          status: "draft",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("❌ Database error creating course:", error)
      return NextResponse.json(
        { success: false, message: "Error al crear curso", error: error.message },
        { status: 500 },
      )
    }

    console.log("✅ Course created successfully:", course.id)

    return NextResponse.json({
      success: true,
      message: "Curso creado exitosamente",
      course,
    })
  } catch (error) {
    console.error("❌ Unexpected error creating course:", error)
    return NextResponse.json({ success: false, message: "Error interno del servidor" }, { status: 500 })
  }
}
