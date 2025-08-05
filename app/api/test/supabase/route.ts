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
        // Test creating a user with proper password hash for test users
        const testPasswordHash = "$2b$10$test.hash.for.testing.purposes.only.not.for.production.use"

        const { data: userData, error: userError } = await supabase
          .from("users")
          .insert([
            {
              email,
              first_name: firstName,
              last_name: lastName,
              role: "student",
              password_hash: testPasswordHash,
              is_test_user: true, // Marcar como usuario de prueba
            },
          ])
          .select()

        if (userError) {
          // Si el usuario ya existe, intentar actualizarlo
          if (userError.code === "23505") {
            // Unique violation
            const { data: updateData, error: updateError } = await supabase
              .from("users")
              .update({
                first_name: firstName,
                last_name: lastName,
                is_test_user: true,
              })
              .eq("email", email)
              .select()

            if (updateError) {
              return NextResponse.json({
                success: false,
                message: `Error actualizando usuario existente: ${updateError.message}`,
              })
            }

            return NextResponse.json({
              success: true,
              message: "Usuario de prueba actualizado exitosamente (ya existía)",
              data: updateData,
            })
          }

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

      case "clean_test_users":
        // Clean test users
        const { data: cleanData, error: cleanError } = await supabase.from("users").delete().eq("is_test_user", true)

        if (cleanError) {
          return NextResponse.json({
            success: false,
            message: `Error limpiando usuarios de prueba: ${cleanError.message}`,
          })
        }

        return NextResponse.json({
          success: true,
          message: "Usuarios de prueba eliminados exitosamente",
          data: { deletedCount: cleanData?.length || 0 },
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
