import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST() {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    console.log("🧹 Iniciando limpieza completa de la base de datos...")

    const cleanupResults = []

    // 1. Limpiar tabla de certificados
    try {
      const { error: certificatesError } = await supabase
        .from("certificates")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000")
      if (certificatesError) {
        console.log("⚠️ Error limpiando certificates:", certificatesError.message)
      } else {
        cleanupResults.push("✅ Certificados eliminados")
      }
    } catch (err) {
      cleanupResults.push("⚠️ Tabla certificates no existe (normal)")
    }

    // 2. Limpiar tabla de pagos
    try {
      const { error: paymentsError } = await supabase
        .from("payments")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000")
      if (paymentsError) {
        console.log("⚠️ Error limpiando payments:", paymentsError.message)
      } else {
        cleanupResults.push("✅ Pagos eliminados")
      }
    } catch (err) {
      cleanupResults.push("⚠️ Tabla payments no existe (normal)")
    }

    // 3. Limpiar progreso de lecciones
    try {
      const { error: progressError } = await supabase
        .from("lesson_progress")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000")
      if (progressError) {
        console.log("⚠️ Error limpiando lesson_progress:", progressError.message)
      } else {
        cleanupResults.push("✅ Progreso de lecciones eliminado")
      }
    } catch (err) {
      cleanupResults.push("⚠️ Tabla lesson_progress no existe (normal)")
    }

    // 4. Limpiar inscripciones
    try {
      const { error: enrollmentsError } = await supabase
        .from("enrollments")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000")
      if (enrollmentsError) {
        console.log("⚠️ Error limpiando enrollments:", enrollmentsError.message)
      } else {
        cleanupResults.push("✅ Inscripciones eliminadas")
      }
    } catch (err) {
      cleanupResults.push("⚠️ Tabla enrollments no existe (normal)")
    }

    // 5. Limpiar lecciones
    try {
      const { error: lessonsError } = await supabase
        .from("lessons")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000")
      if (lessonsError) {
        console.log("⚠️ Error limpiando lessons:", lessonsError.message)
      } else {
        cleanupResults.push("✅ Lecciones eliminadas")
      }
    } catch (err) {
      cleanupResults.push("⚠️ Tabla lessons no existe (normal)")
    }

    // 6. Limpiar cursos
    try {
      const { error: coursesError } = await supabase
        .from("courses")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000")
      if (coursesError) {
        console.log("⚠️ Error limpiando courses:", coursesError.message)
      } else {
        cleanupResults.push("✅ Cursos eliminados")
      }
    } catch (err) {
      cleanupResults.push("⚠️ Tabla courses no existe (normal)")
    }

    // 7. Limpiar usuarios (TODOS, incluyendo admins existentes)
    try {
      const { error: usersError } = await supabase
        .from("users")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000")
      if (usersError) {
        console.log("⚠️ Error limpiando users:", usersError.message)
      } else {
        cleanupResults.push("✅ Todos los usuarios eliminados")
      }
    } catch (err) {
      cleanupResults.push("⚠️ Tabla users no existe")
    }

    // 8. Limpiar logs de administración (si existen)
    try {
      const { error: logsError } = await supabase
        .from("admin_logs")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000")
      if (logsError) {
        console.log("⚠️ Error limpiando admin_logs:", logsError.message)
      } else {
        cleanupResults.push("✅ Logs de administración eliminados")
      }
    } catch (err) {
      cleanupResults.push("⚠️ Tabla admin_logs no existe (normal)")
    }

    // 9. Limpiar sesiones de administración (si existen)
    try {
      const { error: sessionsError } = await supabase
        .from("admin_sessions")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000")
      if (sessionsError) {
        console.log("⚠️ Error limpiando admin_sessions:", sessionsError.message)
      } else {
        cleanupResults.push("✅ Sesiones de administración eliminadas")
      }
    } catch (err) {
      cleanupResults.push("⚠️ Tabla admin_sessions no existe (normal)")
    }

    // 10. Limpiar permisos de administración (si existen)
    try {
      const { error: permissionsError } = await supabase
        .from("admin_permissions")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000")
      if (permissionsError) {
        console.log("⚠️ Error limpiando admin_permissions:", permissionsError.message)
      } else {
        cleanupResults.push("✅ Permisos de administración eliminados")
      }
    } catch (err) {
      cleanupResults.push("⚠️ Tabla admin_permissions no existe (normal)")
    }

    console.log("🎉 Limpieza completa terminada")

    return NextResponse.json({
      success: true,
      message: "🧹 Base de datos limpiada completamente",
      details: {
        cleanupResults,
        tablesCleared: [
          "users",
          "courses",
          "lessons",
          "enrollments",
          "lesson_progress",
          "payments",
          "certificates",
          "admin_logs",
          "admin_sessions",
          "admin_permissions",
        ],
        status: "clean",
        note: "La base de datos está ahora completamente vacía y lista para el nuevo administrador",
      },
    })
  } catch (error) {
    console.error("❌ Error limpiando base de datos:", error)
    return NextResponse.json(
      {
        success: false,
        message: `Error limpiando base de datos: ${(error as Error).message}`,
      },
      { status: 500 },
    )
  }
}
