import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST() {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Crear tabla de usuarios
    const { error: usersError } = await supabase.rpc("exec_sql", {
      sql: `
        CREATE TABLE IF NOT EXISTS users (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          first_name VARCHAR(100) NOT NULL,
          last_name VARCHAR(100) NOT NULL,
          role VARCHAR(20) DEFAULT 'student',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `,
    })

    // Crear tabla de cursos
    const { error: coursesError } = await supabase.rpc("exec_sql", {
      sql: `
        CREATE TABLE IF NOT EXISTS courses (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          price DECIMAL(10,2) NOT NULL,
          instructor VARCHAR(255),
          duration_hours INTEGER,
          total_lessons INTEGER DEFAULT 0,
          status VARCHAR(20) DEFAULT 'published',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `,
    })

    // Crear tabla de inscripciones
    const { error: enrollmentsError } = await supabase.rpc("exec_sql", {
      sql: `
        CREATE TABLE IF NOT EXISTS enrollments (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID REFERENCES users(id),
          course_id UUID REFERENCES courses(id),
          enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          progress_percentage INTEGER DEFAULT 0
        );
      `,
    })

    // Insertar datos de ejemplo
    await supabase.from("courses").upsert([
      {
        title: "Implantología Avanzada",
        description: "Técnicas modernas de implantes dentales con casos clínicos reales",
        price: 299,
        instructor: "Dr. María González",
        duration_hours: 12,
        total_lessons: 24,
      },
      {
        title: "Endodoncia Contemporánea",
        description: "Protocolos actualizados en tratamiento de conductos",
        price: 199,
        instructor: "Dr. Carlos Ruiz",
        duration_hours: 8,
        total_lessons: 18,
      },
    ])

    return NextResponse.json({ success: true, message: "Base de datos configurada correctamente" })
  } catch (error) {
    console.error("Error configurando base de datos:", error)
    return NextResponse.json({ error: "Error configurando base de datos" }, { status: 500 })
  }
}
