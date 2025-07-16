import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET(req: NextRequest) {
  try {
    console.log("=== GET ADMIN USERS ===")

    // Verificar sesión de admin
    const sessionCookie = req.cookies.get("user-session")

    if (!sessionCookie) {
      console.log("❌ No session cookie")
      return NextResponse.json({
        success: false,
        message: "No hay sesión activa",
      })
    }

    let sessionData
    try {
      sessionData = JSON.parse(sessionCookie.value)
    } catch (parseError) {
      console.log("❌ Error parsing session:", parseError)
      return NextResponse.json({
        success: false,
        message: "Sesión inválida",
      })
    }

    if (sessionData.role !== "admin") {
      console.log("❌ Not admin user")
      return NextResponse.json({
        success: false,
        message: "Acceso denegado",
      })
    }

    console.log("Admin user accessing users list:", sessionData.email)

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Obtener todos los usuarios con información de enrollments
    const { data: users, error: usersError } = await supabase
      .from("users")
      .select(`
        id,
        email,
        first_name,
        last_name,
        role,
        avatar_url,
        is_test_user,
        created_at,
        updated_at
      `)
      .order("created_at", { ascending: false })

    if (usersError) {
      console.error("❌ Error fetching users:", usersError)
      return NextResponse.json({
        success: false,
        message: "Error obteniendo usuarios",
      })
    }

    // Obtener conteo de enrollments por usuario
    const { data: enrollmentCounts, error: enrollmentError } = await supabase.from("enrollments").select("user_id")

    const enrollmentCountMap = {}
    if (enrollmentCounts) {
      enrollmentCounts.forEach((enrollment) => {
        enrollmentCountMap[enrollment.user_id] = (enrollmentCountMap[enrollment.user_id] || 0) + 1
      })
    }

    // Combinar datos
    const usersWithEnrollments =
      users?.map((user) => ({
        ...user,
        enrollment_count: enrollmentCountMap[user.id] || 0,
      })) || []

    console.log("✅ Found users:", usersWithEnrollments.length)

    return NextResponse.json({
      success: true,
      users: usersWithEnrollments,
    })
  } catch (error) {
    console.error("❌ Error in admin users:", error)
    return NextResponse.json({
      success: false,
      message: "Error interno del servidor",
    })
  }
}
