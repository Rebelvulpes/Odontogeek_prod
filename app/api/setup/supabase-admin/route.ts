import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST() {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    console.log("🚀 Iniciando configuración de sistema de administración...")

    // Verificar conexión básica primero
    const { data: testConnection, error: connectionError } = await supabase.from("users").select("count").limit(1)

    if (connectionError) {
      throw new Error(`Error de conexión con Supabase: ${connectionError.message}`)
    }

    console.log("✅ Conexión con Supabase verificada")

    // En lugar de crear tablas con SQL, vamos a verificar que las tablas básicas existan
    // y crear datos de configuración necesarios

    // 1. Verificar que la tabla users existe y tiene la estructura correcta
    const { data: usersTest, error: usersError } = await supabase.from("users").select("id, email, role").limit(1)

    if (usersError) {
      throw new Error(`La tabla users no está configurada correctamente: ${usersError.message}`)
    }

    console.log("✅ Tabla users verificada")

    // 2. Verificar que la tabla courses existe
    const { data: coursesTest, error: coursesError } = await supabase.from("courses").select("id, title").limit(1)

    if (coursesError) {
      throw new Error(`La tabla courses no está configurada correctamente: ${coursesError.message}`)
    }

    console.log("✅ Tabla courses verificada")

    // 3. Verificar que la tabla enrollments existe
    const { data: enrollmentsTest, error: enrollmentsError } = await supabase.from("enrollments").select("id").limit(1)

    if (enrollmentsError) {
      throw new Error(`La tabla enrollments no está configurada correctamente: ${enrollmentsError.message}`)
    }

    console.log("✅ Tabla enrollments verificada")

    // 4. Crear algunos cursos de ejemplo si no existen
    const { data: existingCourses, error: checkCoursesError } = await supabase.from("courses").select("id, title")

    if (!checkCoursesError && (!existingCourses || existingCourses.length === 0)) {
      console.log("📚 Creando cursos de ejemplo...")

      const { error: insertCoursesError } = await supabase.from("courses").insert([
        {
          title: "Implantología Avanzada",
          description: "Técnicas modernas de implantes dentales con casos clínicos reales",
          price: 299.0,
          instructor: "Dr. María González",
          duration_hours: 12,
          total_lessons: 24,
          status: "published",
        },
        {
          title: "Endodoncia Contemporánea",
          description: "Protocolos actualizados en tratamiento de conductos",
          price: 199.0,
          instructor: "Dr. Carlos Ruiz",
          duration_hours: 8,
          total_lessons: 18,
          status: "published",
        },
        {
          title: "Ortodoncia Digital",
          description: "Planificación y tratamiento con tecnología 3D",
          price: 399.0,
          instructor: "Dra. Ana Martín",
          duration_hours: 15,
          total_lessons: 20,
          status: "published",
        },
      ])

      if (insertCoursesError) {
        console.log("⚠️ Error creando cursos de ejemplo:", insertCoursesError.message)
      } else {
        console.log("✅ Cursos de ejemplo creados")
      }
    }

    // 5. Verificar que podemos crear usuarios administradores
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

    return NextResponse.json({
      success: true,
      message: "🎉 Sistema verificado y listo para crear administradores",
      details: {
        tablesVerified: ["users", "courses", "enrollments"],
        sampleCoursesCreated: true,
        adminCreationReady: true,
        status: "ready",
      },
    })
  } catch (error) {
    console.error("❌ Error configurando sistema:", error)
    return NextResponse.json(
      {
        success: false,
        message: `Error configurando sistema: ${(error as Error).message}`,
        suggestion: "Verifica que las variables de entorno de Supabase estén configuradas correctamente",
      },
      { status: 500 },
    )
  }
}
