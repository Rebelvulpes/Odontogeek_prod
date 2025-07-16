import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import bcrypt from "bcryptjs"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET(req: NextRequest) {
  try {
    // Verificar autenticación del admin
    const userSession = req.cookies.get("user-session")?.value
    if (!userSession) {
      return NextResponse.json(
        {
          success: false,
          message: "No autorizado",
        },
        { status: 401 },
      )
    }

    const userData = JSON.parse(userSession)
    if (userData.role !== "admin") {
      return NextResponse.json(
        {
          success: false,
          message: "Acceso denegado",
        },
        { status: 403 },
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    console.log("Admin fetching users...")

    // Obtener todos los usuarios con información adicional
    const { data: users, error } = await supabase
      .from("users")
      .select(`
        *,
        enrollments:enrollments(count)
      `)
      .order("created_at", { ascending: false })

    console.log("Users query result:", {
      success: !error,
      error,
      userCount: users?.length || 0,
      users: users?.map((u) => ({ email: u.email, role: u.role, created_at: u.created_at })),
    })

    if (error) {
      console.error("Error fetching users:", error)
      return NextResponse.json({
        success: false,
        message: `Error obteniendo usuarios: ${error.message}`,
      })
    }

    // Procesar datos para incluir estadísticas
    const processedUsers =
      users?.map((user) => ({
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        avatar_url: user.avatar_url,
        is_test_user: user.is_test_user || false,
        created_at: user.created_at,
        updated_at: user.updated_at,
        enrollment_count: user.enrollments?.[0]?.count || 0,
      })) || []

    return NextResponse.json({
      success: true,
      data: processedUsers,
      total: processedUsers.length,
    })
  } catch (error) {
    console.error("Error in admin users API:", error)
    return NextResponse.json({
      success: false,
      message: `Error interno: ${(error as Error).message}`,
    })
  }
}

export async function POST(req: NextRequest) {
  try {
    // Verificar autenticación del admin
    const userSession = req.cookies.get("user-session")?.value
    if (!userSession) {
      return NextResponse.json(
        {
          success: false,
          message: "No autorizado",
        },
        { status: 401 },
      )
    }

    const userData = JSON.parse(userSession)
    if (userData.role !== "admin") {
      return NextResponse.json(
        {
          success: false,
          message: "Acceso denegado",
        },
        { status: 403 },
      )
    }

    const { firstName, lastName, email, password, role } = await req.json()

    console.log("Admin creating user:", { firstName, lastName, email, role, password: "***" })

    if (!firstName || !lastName || !email || !password || !role) {
      return NextResponse.json({
        success: false,
        message: "Todos los campos son requeridos",
      })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Verificar si el email ya existe
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("email", email.toLowerCase().trim())
      .single()

    if (existingUser) {
      return NextResponse.json({
        success: false,
        message: "Ya existe un usuario con este email",
      })
    }

    // Hash de la contraseña
    const passwordHash = await bcrypt.hash(password, 10)

    // Crear usuario
    const { data: newUser, error: createError } = await supabase
      .from("users")
      .insert([
        {
          email: email.toLowerCase().trim(),
          password_hash: passwordHash,
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          role,
          is_test_user: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()

    console.log("User creation result:", { success: !createError, error: createError })

    if (createError) {
      return NextResponse.json({
        success: false,
        message: `Error creando usuario: ${createError.message}`,
      })
    }

    return NextResponse.json({
      success: true,
      message: "Usuario creado exitosamente",
      data: newUser[0],
    })
  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json({
      success: false,
      message: `Error interno: ${(error as Error).message}`,
    })
  }
}
