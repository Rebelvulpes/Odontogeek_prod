import { type NextRequest, NextResponse } from "next/server"
import { getServerSupabaseClient, getUserSessionFromCookie, logStudentAccess } from "@/lib/server-utils"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET(req: NextRequest) {
  try {
    console.log("=== GET STUDENT CERTIFICATES REQUEST ===")

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

    const supabase = getServerSupabaseClient()

    // Get certificates for completed courses
    const { data: certificates, error } = await supabase
      .from("enrollments")
      .select(`
        id,
        completion_date,
        courses (
          id,
          title,
          instructor_name
        )
      `)
      .eq("student_id", userSession.id)
      .eq("status", "completed")
      .not("completion_date", "is", null)
      .order("completion_date", { ascending: false })

    if (error) {
      console.error("❌ Error fetching certificates:", error)
      await logStudentAccess(userSession.id, userSession.email, "GET_CERTIFICATES", false, "FETCH_ERROR", error.message)
      return NextResponse.json(
        {
          success: false,
          message: "Error al obtener certificados",
          error: "FETCH_ERROR",
        },
        { status: 500 },
      )
    }

    // Format certificates data
    const formattedCertificates = (certificates || []).map((cert: any) => ({
      id: cert.id,
      course_title: cert.courses?.title || "Curso sin título",
      instructor_name: cert.courses?.instructor_name || "Instructor desconocido",
      completion_date: cert.completion_date,
      certificate_url: null, // TODO: Generate certificate URL when implemented
    }))

    console.log(`✅ Found ${formattedCertificates.length} certificates for user:`, userSession.email)
    await logStudentAccess(
      userSession.id,
      userSession.email,
      "GET_CERTIFICATES",
      true,
      null,
      `Found ${formattedCertificates.length} certificates`,
    )

    return NextResponse.json({
      success: true,
      certificates: formattedCertificates,
    })
  } catch (error) {
    console.error("❌ Get certificates error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Error interno del servidor",
        error: "INTERNAL_SERVER_ERROR",
      },
      { status: 500 },
    )
  }
}
