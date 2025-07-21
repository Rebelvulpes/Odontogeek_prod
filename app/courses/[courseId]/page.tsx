"use client"

import { useState, useEffect } from "react"
import { createClient } from "@supabase/supabase-js"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Play, Clock, Award, CheckCircle, Lock } from "lucide-react"
import { Navigation } from "@/components/navigation"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

interface Course {
  id: string
  title: string
  description: string
  price: number
  instructor: string
  difficulty_level: string
  status: string
  lessons: Array<{
    id: string
    title: string
    description: string
    duration_minutes: number
    order_index: number
    is_free: boolean
  }>
}

export default function CoursePage({ params }: { params: { courseId: string } }) {
  const [course, setCourse] = useState<Course | null>(null)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/me", {
          credentials: "include",
        })

        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            setUser(data.user)
          }
        }
      } catch (error) {
        console.error("Error checking auth:", error)
      }
    }

    const getCourse = async () => {
      try {
        const supabase = createClient(supabaseUrl, supabaseServiceKey)

        const { data: courseData, error } = await supabase
          .from("courses")
          .select(`
            *,
            lessons:lessons(*)
          `)
          .eq("id", params.courseId)
          .single()

        if (error || !courseData) {
          notFound()
          return
        }

        // Ordenar lecciones por order_index
        if (courseData.lessons) {
          courseData.lessons.sort((a: any, b: any) => (a.order_index || 0) - (b.order_index || 0))
        }

        setCourse(courseData)
      } catch (error) {
        console.error("Error fetching course:", error)
        notFound()
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
    getCourse()
  }, [params.courseId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation user={null} />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando curso...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!course) {
    notFound()
  }

  const freeLessons = course.lessons?.filter((lesson: any) => lesson.is_free) || []
  const paidLessons = course.lessons?.filter((lesson: any) => !lesson.is_free) || []
  const totalDuration =
    course.lessons?.reduce((sum: number, lesson: any) => sum + (lesson.duration_minutes || 0), 0) || 0

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation with user state */}
      <Navigation user={user} />

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Course Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Course Header */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{course.title}</h1>
                  <p className="text-gray-600 text-lg">{course.description}</p>
                </div>
                <Badge variant={course.status === "published" ? "default" : "secondary"}>
                  {course.status === "published" ? "Publicado" : "Borrador"}
                </Badge>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{course.lessons?.length || 0}</div>
                  <div className="text-sm text-gray-600">Lecciones</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{Math.floor(totalDuration / 60)}h</div>
                  <div className="text-sm text-gray-600">Duración</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{freeLessons.length}</div>
                  <div className="text-sm text-gray-600">Gratis</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">${course.price || 0}</div>
                  <div className="text-sm text-gray-600">Precio</div>
                </div>
              </div>
            </div>

            {/* Free Lessons */}
            {freeLessons.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Play className="w-5 h-5 mr-2 text-green-600" />
                    Lecciones Gratuitas
                  </CardTitle>
                  <CardDescription>Puedes ver estas lecciones sin registrarte</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {freeLessons.map((lesson: any) => (
                      <Link key={lesson.id} href={`/courses/${course.id}/lessons/${lesson.id}`} className="block">
                        <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-green-600">{lesson.order_index || 1}</span>
                            </div>
                            <div>
                              <h3 className="font-medium">{lesson.title}</h3>
                              <p className="text-sm text-gray-600">{lesson.description}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="flex items-center text-sm text-gray-500">
                              <Clock className="w-4 h-4 mr-1" />
                              {lesson.duration_minutes || 0} min
                            </div>
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              Gratis
                            </Badge>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Paid Lessons */}
            {paidLessons.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Lock className="w-5 h-5 mr-2 text-blue-600" />
                    Contenido Premium
                  </CardTitle>
                  <CardDescription>Requiere inscripción al curso</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {paidLessons.map((lesson: any) => (
                      <div
                        key={lesson.id}
                        className="flex items-center justify-between p-4 border rounded-lg bg-gray-50"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-600">{lesson.order_index || 1}</span>
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-700">{lesson.title}</h3>
                            <p className="text-sm text-gray-500">{lesson.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center text-sm text-gray-500">
                            <Clock className="w-4 h-4 mr-1" />
                            {lesson.duration_minutes || 0} min
                          </div>
                          <Lock className="w-4 h-4 text-gray-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Purchase Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="w-5 h-5 mr-2" />
                  Inscríbete al Curso
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">${course.price || 0}</div>
                  <div className="text-sm text-gray-600">Acceso completo de por vida</div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    {course.lessons?.length || 0} lecciones en video
                  </div>
                  <div className="flex items-center text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Acceso de por vida
                  </div>
                  <div className="flex items-center text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Certificado de finalización
                  </div>
                  <div className="flex items-center text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Soporte del instructor
                  </div>
                </div>

                <Link href={`/courses/${course.id}/checkout`} className="block">
                  <Button className="w-full" size="lg">
                    Inscribirse Ahora
                  </Button>
                </Link>

                <p className="text-xs text-center text-gray-500">Garantía de devolución de 30 días</p>
              </CardContent>
            </Card>

            {/* Course Info */}
            <Card>
              <CardHeader>
                <CardTitle>Información del Curso</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Duración total:</span>
                  <span className="font-medium">
                    {Math.floor(totalDuration / 60)}h {totalDuration % 60}m
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Lecciones:</span>
                  <span className="font-medium">{course.lessons?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Nivel:</span>
                  <span className="font-medium capitalize">{course.difficulty_level || "Intermedio"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Instructor:</span>
                  <span className="font-medium">{course.instructor || "Instructor"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Idioma:</span>
                  <span className="font-medium">Español</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
