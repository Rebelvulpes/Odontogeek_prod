import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET() {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { data: users, error } = await supabase.from("users").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("Error obteniendo usuarios:", error)
      return NextResponse.json(
        {
          success: false,
          message: "Error obteniendo usuarios",
          error: error,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      data: users || [],
    })
  } catch (error) {
    console.error("Error en GET usuarios:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Error interno del servidor",
        error: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const body = await request.json()

    const { first_name, last_name, email, password, role } = body

    // Validar campos requeridos
    if (!first_name || !last_name || !email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Todos los campos son requeridos",
        },
        { status: 400 },
      )
    }

    // Crear el usuario
    const { data: user, error: userError } = await supabase
      .from("users")
      .insert([
        {
          first_name,
          last_name,
          email,
          password_hash: password, // En producción, esto debería ser hasheado
          role: role || "student",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single()

    if (userError) {
      console.error("Error creando usuario:", userError)
      return NextResponse.json(
        {
          success: false,
          message: "Error creando usuario",
          error: userError,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "Usuario creado exitosamente",
      data: user,
    })
  } catch (error) {
    console.error("Error en POST usuario:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Error interno del servidor",
        error: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}
