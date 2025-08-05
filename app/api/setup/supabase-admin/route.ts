import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST() {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    console.log("🚀 Verificando sistema limpio...")

    // Verificar conexión básica primero
    const { data: testConnection, error: connectionError } = await supabase.from("users").select("count").limit(1)

    if (connectionError) {
      throw new Error(`Error de conexión con Supabase: ${connectionError.message}`)
    }

    console.log("✅ Conexión con Supabase verificada")

    // 1. Verificar que la tabla users existe y está vacía
    const { data: usersCheck, error: usersError } = await supabase.from("users").select("id, email, role")

    if (usersError) {
      throw new Error(`La tabla users no está configurada correctamente: ${usersError.message}`)
    }

    console.log(`✅ Tabla users verificada - ${usersCheck?.length || 0} usuarios existentes`)

    // 2. Verificar que la tabla courses existe
    const { data: coursesCheck, error: coursesError } = await supabase.from("courses").select("id, title")

    if (coursesError) {
      throw new Error(`La tabla courses no está configurada correctamente: ${coursesError.message}`)
    }

    console.log(`✅ Tabla courses verificada - ${coursesCheck?.length || 0} cursos existentes`)

    // 3. Verificar que la tabla enrollments existe
    const { data: enrollmentsCheck, error: enrollmentsError } = await supabase.from("enrollments").select("id")

    if (enrollmentsError) {
      throw new Error(`La tabla enrollments no está configurada correctamente: ${enrollmentsError.message}`)
    }

    console.log(`✅ Tabla enrollments verificada - ${enrollmentsCheck?.length || 0} inscripciones existentes`)

    // 4. Verificar que podemos crear usuarios administradores
    const testAdminData = {
      email: "test-admin-verification@example.com",
      first_name: "Test",
      last_name: "Admin",
      role: "admin",
      is_test_user: true,
    }

    // Intentar insertar y luego eliminar un usuario de prueba
    const { data: testAdmin, error: testAdminError } = await supabase.from("users").insert([testAdminData]).select()

    if (testAdminError) {
      throw new Error(`Error verificando creación de administradores: ${testAdminError.message}`)
    }

    // Eliminar el usuario de prueba
    if (testAdmin && testAdmin[0]) {
      await supabase.from("users").delete().eq("id", testAdmin[0].id)
    }

    console.log("✅ Verificación de creación de administradores exitosa")

    // Contar totales para el reporte
    const totalUsers = usersCheck?.length || 0
    const totalCourses = coursesCheck?.length || 0
    const totalEnrollments = enrollmentsCheck?.length || 0

    return NextResponse.json({
      success: true,
      message:
        totalUsers === 0 && totalCourses === 0 && totalEnrollments === 0
          ? "🎉 Sistema verificado - Base de datos completamente limpia y lista"
          : `✅ Sistema verificado - ${totalUsers} usuarios, ${totalCourses} cursos, ${totalEnrollments} inscripciones existentes`,
      details: {
        tablesVerified: ["users", "courses", "enrollments"],
        currentData: {
          users: totalUsers,
          courses: totalCourses,
          enrollments: totalEnrollments,
        },
        adminCreationReady: true,
        isClean: totalUsers === 0 && totalCourses === 0 && totalEnrollments === 0,
        status: "ready",
      },
    })
  } catch (error) {
    console.error("❌ Error verificando sistema:", error)
    return NextResponse.json(
      {
        success: false,
        message: `Error verificando sistema: ${(error as Error).message}`,
        suggestion: "Verifica que las variables de entorno de Supabase estén configuradas correctamente",
      },
      { status: 500 },
    )
  }
}
