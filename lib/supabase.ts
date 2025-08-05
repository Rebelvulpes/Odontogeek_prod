import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Export createClient as named export
export { createClient }

// Default client instance
export const supabase = createClient(supabaseUrl, supabaseKey)

// Función para inicializar la base de datos
export async function initializeDatabase() {
  try {
    // Crear tabla de usuarios
    const { error: usersError } = await supabase.rpc("create_users_table")
    if (usersError) console.log("Tabla users ya existe o error:", usersError.message)

    // Crear tabla de cursos
    const { error: coursesError } = await supabase.rpc("create_courses_table")
    if (coursesError) console.log("Tabla courses ya existe o error:", coursesError.message)

    // Insertar datos de ejemplo
    await insertSampleData()

    console.log("Base de datos inicializada correctamente")
  } catch (error) {
    console.error("Error inicializando base de datos:", error)
  }
}

async function insertSampleData() {
  // Insertar cursos de ejemplo
  const { error } = await supabase.from("courses").upsert([
    {
      id: "1",
      title: "Implantología Avanzada",
      description: "Técnicas modernas de implantes dentales con casos clínicos reales",
      price: 299,
      instructor: "Dr. María González",
      duration_hours: 12,
      total_lessons: 24,
      status: "published",
    },
    {
      id: "2",
      title: "Endodoncia Contemporánea",
      description: "Protocolos actualizados en tratamiento de conductos",
      price: 199,
      instructor: "Dr. Carlos Ruiz",
      duration_hours: 8,
      total_lessons: 18,
      status: "published",
    },
    {
      id: "3",
      title: "Ortodoncia Digital",
      description: "Planificación y tratamiento con tecnología 3D",
      price: 399,
      instructor: "Dra. Ana Martín",
      duration_hours: 15,
      total_lessons: 20,
      status: "published",
    },
  ])

  if (error) {
    console.log("Error insertando datos de ejemplo:", error.message)
  }
}
