import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(req: NextRequest) {
  try {
    const { action, email, firstName, lastName } = await req.json()

    // Check if environment variables are set
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({
        success: false,
        message: "Variables de entorno de Supabase no configuradas correctamente",
      })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    switch (action) {
      case "connection":
        // Test basic connection by trying to fetch from a system table
        const { data, error } = await supabase.from("courses").select("count").limit(1)

        if (error) {
          return NextResponse.json({
            success: false,
            message: `Error de conexión: ${error.message}`,
          })
        }

        return NextResponse.json({
          success: true,
          message: "Conexión exitosa con Supabase",
          data: { tablesAccessible: true },
        })

      case "create_user":
        // Test creating a user
        const { data: userData, error: userError } = await supabase
          .from("users")
          .insert([
            {
              email,
              first_name: firstName,
              last_name: lastName,
              role: "student",
            },
          ])
          .select()

        if (userError) {
          return NextResponse.json({
            success: false,
            message: `Error creando usuario: ${userError.message}`,
          })
        }

        return NextResponse.json({
          success: true,
          message: "Usuario de prueba creado exitosamente",
          data: userData,
        })

      case "list_courses":
        // Test fetching courses
        const { data: coursesData, error: coursesError } = await supabase.from("courses").select("*").limit(5)

        if (coursesError) {
          return NextResponse.json({
            success: false,
            message: `Error obteniendo cursos: ${coursesError.message}`,
          })
        }

        return NextResponse.json({
          success: true,
          message: `Se encontraron ${coursesData.length} cursos`,
          data: coursesData,
        })

      default:
        return NextResponse.json({
          success: false,
          message: "Acción no reconocida",
        })
    }
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: `Error interno: ${(error as Error).message}`,
    })
  }
}
