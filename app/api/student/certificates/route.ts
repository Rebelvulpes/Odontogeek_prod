import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { getUserSessionFromCookie } from "@/lib/server-utils"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET(req: NextRequest) {
  try {
    console.log("=== GET STUDENT CERTIFICATES ===")
    console.log("Timestamp:", new Date().toISOString())

    // Get user session from cookie
    const cookieHeader = req.headers.get("cookie")
    const userSession = getUserSessionFromCookie(cookieHeader)

    if (!userSession) {
      console.log("❌ No valid session found")
      return NextResponse.json(
        {
          success: false,
          message: "Sesión no válida",
          error: "INVALID_SESSION",
        },
        { status: 401 },
      )
    }

    console.log("✅ Valid session found for user:", userSession.email)

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get completed courses (certificates)
    console.log("=== FETCHING CERTIFICATES ===")
    const { data: certificates, error: certificatesError } = await supabase
      .from("enrollments")
      .select(`
        id,
        enrolled_at,
        completed_at,
        course:courses (
          id,
          title,
          instructor,
          thumbnail_url
        )
      `)
      .eq("user_id", userSession.id)
      .eq("completed", true)
      .not("completed_at", "is", null)
      .order("completed_at", { ascending: false })

    console.log("Certificates query result:")
    console.log("- Success:", !certificatesError)
    console.log("- Error:", certificatesError)
    console.log("- Certificates count:", certificates?.length || 0)

    if (certificatesError) {
      console.error("❌ CERTIFICATES ERROR:", certificatesError)
      return NextResponse.json(
        {
          success: false,
          message: "Error obteniendo certificados",
          error: "FETCH_CERTIFICATES_ERROR",
          certificates: [],
        },
        { status: 500 },
      )
    }

    // Format certificates data
    const formattedCertificates = (certificates || []).map((cert) => ({
      id: cert.id,
      course_id: cert.course?.id,
      course_title: cert.course?.title || "Curso sin título",
      instructor: cert.course?.instructor || "Instructor no disponible",
      thumbnail_url: cert.course?.thumbnail_url,
      enrolled_at: cert.enrolled_at,
      completed_at: cert.completed_at,
    }))

    console.log("✅ CERTIFICATES FETCHED SUCCESSFULLY")
    console.log("Formatted certificates:", formattedCertificates.length)

    return NextResponse.json({
      success: true,
      certificates: formattedCertificates,
    })
  } catch (error) {
    console.error("=== GET CERTIFICATES ERROR ===")
    console.error("Error details:", error)
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace")

    return NextResponse.json(
      {
        success: false,
        message: "Error interno del servidor",
        error: "INTERNAL_SERVER_ERROR",
        certificates: [],
      },
      { status: 500 },
    )
  }
}
