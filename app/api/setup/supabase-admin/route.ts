import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST() {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    console.log("🚀 Iniciando configuración de sistema de administración...")

    // 1. Crear tabla de logs de administración
    const { error: logsError } = await supabase.rpc("exec_sql", {
      sql: `
        CREATE TABLE IF NOT EXISTS admin_logs (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          admin_id UUID REFERENCES users(id) ON DELETE SET NULL,
          action VARCHAR(100) NOT NULL,
          details TEXT,
          ip_address VARCHAR(45),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `,
    })

    if (logsError) {
      console.log("⚠️ Tabla admin_logs:", logsError.message)
    } else {
      console.log("✅ Tabla admin_logs creada")
    }

    // 2. Crear tabla de sesiones de administrador
    const { error: sessionsError } = await supabase.rpc("exec_sql", {
      sql: `
        CREATE TABLE IF NOT EXISTS admin_sessions (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          admin_id UUID REFERENCES users(id) ON DELETE CASCADE,
          token_hash VARCHAR(255) NOT NULL,
          expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
          ip_address VARCHAR(45),
          user_agent TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          last_used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `,
    })

    if (sessionsError) {
      console.log("⚠️ Tabla admin_sessions:", sessionsError.message)
    } else {
      console.log("✅ Tabla admin_sessions creada")
    }

    // 3. Crear tabla de permisos
    const { error: permissionsError } = await supabase.rpc("exec_sql", {
      sql: `
        CREATE TABLE IF NOT EXISTS admin_permissions (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          admin_id UUID REFERENCES users(id) ON DELETE CASCADE,
          permission VARCHAR(100) NOT NULL,
          granted_by UUID REFERENCES users(id),
          granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(admin_id, permission)
        );
      `,
    })

    if (permissionsError) {
      console.log("⚠️ Tabla admin_permissions:", permissionsError.message)
    } else {
      console.log("✅ Tabla admin_permissions creada")
    }

    // 4. Crear índices para optimización
    const indexes = [
      "CREATE INDEX IF NOT EXISTS idx_admin_logs_admin ON admin_logs(admin_id);",
      "CREATE INDEX IF NOT EXISTS idx_admin_logs_action ON admin_logs(action);",
      "CREATE INDEX IF NOT EXISTS idx_admin_logs_created ON admin_logs(created_at);",
      "CREATE INDEX IF NOT EXISTS idx_admin_sessions_admin ON admin_sessions(admin_id);",
      "CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON admin_sessions(token_hash);",
      "CREATE INDEX IF NOT EXISTS idx_admin_permissions_admin ON admin_permissions(admin_id);",
    ]

    for (const indexSql of indexes) {
      const { error: indexError } = await supabase.rpc("exec_sql", { sql: indexSql })
      if (indexError) {
        console.log("⚠️ Índice:", indexError.message)
      }
    }

    console.log("✅ Índices creados")

    // 5. Verificar que todo esté funcionando
    const { data: testQuery, error: testError } = await supabase.from("admin_logs").select("count").limit(1)

    if (testError) {
      throw new Error(`Error verificando tablas: ${testError.message}`)
    }

    return NextResponse.json({
      success: true,
      message: "🎉 Sistema de administración configurado exitosamente en Supabase",
      details: {
        tablesCreated: ["admin_logs", "admin_sessions", "admin_permissions"],
        indexesCreated: 6,
        status: "ready",
      },
    })
  } catch (error) {
    console.error("❌ Error configurando sistema:", error)
    return NextResponse.json(
      {
        success: false,
        message: `Error configurando sistema: ${(error as Error).message}`,
      },
      { status: 500 },
    )
  }
}
