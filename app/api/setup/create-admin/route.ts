import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import bcrypt from "bcryptjs"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(req: NextRequest) {
  try {
    const { firstName, lastName, email, password } = await req.json()

    // Validaciones
    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json({
        success: false,
        message: "Todos los campos son requeridos",
      })
    }

    if (password.length < 8) {
      return NextResponse.json({
        success: false,
        message: "La contraseña debe tener al menos 8 caracteres",
      })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Verificar si ya existe un administrador con este email
    const { data: existingUser, error: checkError } = await supabase
      .from("users")
      .select("id, email, role")
      .eq("email", email)
      .single()

    if (existingUser) {
      return NextResponse.json({
        success: false,
        message: "Ya existe un usuario con este email",
      })
    }

    // Hash de la contraseña
    const saltRounds = 12
    const passwordHash = await bcrypt.hash(password, saltRounds)

    // Crear el usuario administrador
    const { data: newUser, error: createError } = await supabase
      .from("users")
      .insert([
        {
          email,
          password_hash: passwordHash,
          first_name: firstName,
          last_name: lastName,
          role: "admin",
          is_test_user: false,
        },
      ])
      .select()

    if (createError) {
      return NextResponse.json({
        success: false,
        message: `Error creando usuario: ${createError.message}`,
      })
    }

    // Log de auditoría
    await supabase.from("admin_logs").insert([
      {
        admin_id: newUser[0].id,
        action: "admin_created",
        details: `Administrador principal creado: ${firstName} ${lastName} (${email})`,
        ip_address: req.headers.get("x-forwarded-for") || "unknown",
      },
    ])

    return NextResponse.json({
      success: true,
      message: "Cuenta de administrador creada exitosamente",
      data: {
        id: newUser[0].id,
        email: newUser[0].email,
        name: `${firstName} ${lastName}`,
        role: "admin",
      },
    })
  } catch (error) {
    console.error("Error creando administrador:", error)
    return NextResponse.json({
      success: false,
      message: `Error interno: ${(error as Error).message}`,
    })
  }
}
