import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST() {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Ejecutar las correcciones de la base de datos
    const fixes = [
      // Hacer password_hash opcional
      "ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL",

      // Agregar campo para usuarios de prueba
      "ALTER TABLE users ADD COLUMN IF NOT EXISTS is_test_user BOOLEAN DEFAULT FALSE",

      // Agregar índices
      "CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)",
      "CREATE INDEX IF NOT EXISTS idx_users_test ON users(is_test_user) WHERE is_test_user = true",
    ]

    const results = []

    for (const sql of fixes) {
      try {
        const { error } = await supabase.rpc("exec_sql", { sql })
        results.push({
          sql: sql.substring(0, 50) + "...",
          success: !error,
          error: error?.message || null,
        })
      } catch (err) {
        results.push({
          sql: sql.substring(0, 50) + "...",
          success: false,
          error: (err as Error).message,
        })
      }
    }

    // Insertar datos de ejemplo
    try {
      const { error: insertError } = await supabase.from("users").upsert(
        [
          {
            email: "admin@odontogeek.com",
            password_hash: "$2b$10$example.admin.hash",
            first_name: "Admin",
            last_name: "Principal",
            role: "admin",
            is_test_user: false,
          },
          {
            email: "instructor@odontogeek.com",
            password_hash: "$2b$10$example.instructor.hash",
            first_name: "Dr. María",
            last_name: "González",
            role: "instructor",
            is_test_user: false,
          },
        ],
        {
          onConflict: "email",
          ignoreDuplicates: true,
        },
      )

      if (!insertError) {
        results.push({
          sql: "INSERT example users",
          success: true,
          error: null,
        })
      }
    } catch (err) {
      results.push({
        sql: "INSERT example users",
        success: false,
        error: (err as Error).message,
      })
    }

    return NextResponse.json({
      success: true,
      message: "Base de datos corregida",
      results,
    })
  } catch (error) {
    console.error("Error corrigiendo base de datos:", error)
    return NextResponse.json(
      {
        error: "Error corrigiendo base de datos",
        details: (error as Error).message,
      },
      { status: 500 },
    )
  }
}
