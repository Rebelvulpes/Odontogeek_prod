"use client"

import { useState, useEffect } from "react"
import { createClient } from "@supabase/supabase-js"
import { checkAuthStatus, type User } from "@/lib/auth-utils"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

interface Course {
  id: string
  title: string
  description: string
  price: number
  duration_hours: number
  thumbnail_url: string
  instructor_name: string
  students_count: number
  tags: Array<{
    id: string
    name: string
    slug: string
    color: string
  }>
  lessons: Array<{
    id: string
    title: string
    duration_minutes: number
    is_free: boolean
  }>
}

export default function HomePage() {
  const [featuredCourses, setFeaturedCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [authLoading, setAuthLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        // Verificar autenticación
        const authUser = await checkAuthStatus()
        setUser(authUser)
        setAuthLoading(false)

        // Cargar cursos destacados
        if (supabaseUrl && supabaseAnonKey) {
          const supabase = createClient(supabaseUrl, supabaseAnonKey)
          
          const { data: courses, error: coursesError } = await supabase
            .from("courses")
            .select(`
              id,
              title,
              description,
              price,
              duration_hours,
              thumbnail_url,
              instructor_name,
              created_at,
              status
            `)
            .eq("status", "published")
            .neq("archived", true)
            .order("created_at", { ascending: false })
            .limit(3)

          if (coursesError) {
            console.error("Error obteniendo cursos:", coursesError)
            setFeaturedCourses([])
          } else if (courses) {
            // Procesar cada curso para obtener datos adicionales
            const coursesWithDetails = await Promise.all(
              courses.map(async (course) => {
                // Obtener etiquetas del curso
                const { data: courseTags } = await supabase
                  .from("course_tags")
                  .select(`
                    tags (
                      id,
                      name,
                      slug,
                      color
                    )
                  `)
                  .eq("course_id", course.id)

                // Obtener lecciones del curso
                const { data: lessons } = await supabase
                  .from("lessons")
                  .select(`
                    id,
                    title,
                    duration_minutes,
                    is_free
                  `)
                  .eq("course_id", course.id)
                  .neq("archived", true)
                  .order("order_index", { ascending: true })

                // Obtener número de estudiantes inscritos
                const { count: studentsCount } = await supabase
                  .from("enrollments")
                  .select("*", { count: "exact", head: true })
                  .eq("course_id", course.id)

                return {
                  ...course,
                  lessons: lessons || [],
                  students_count: studentsCount || 0,
                  tags: courseTags?.map((relation) => relation.tags).filter(Boolean) || [],
                }
              }),
            )

            setFeaturedC
