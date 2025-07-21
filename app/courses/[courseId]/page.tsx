"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Clock,
  Users,
  Star,
  BookOpen,
  Play,
  CheckCircle,
  Lock,
  ArrowLeft,
  Award,
  Calendar,
  Globe,
  Download,
} from "lucide-react"
import { Navigation } from "@/components/navigation"

interface Lesson {
  id: string
  title: string
  description: string
  duration_minutes: number
  order_index: number
  is_free: boolean
  video_url?: string
}

interface Course {
  id: string
  title: string
  description: string
  price: number
  instructor: string
  difficulty_level: string
  thumbnail_url: string
  created_at: string
  lessons: Lesson[]
}

export default function CoursePage() {
  const params = useParams()
  const courseId = params.courseId as string

  const [course, setCourse] = useState<Course | null>(null)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEnrolled, setIsEnrolled] = useState(false)

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
        const response = await fetch(`/api/courses/${courseId}`)
        const data = await response.json()

        if (data.success) {
          setCourse(data.course)
          setIsEnrolled(data.isEnrolled || false)
        } else {
          setError(data.message || "Error al cargar el curso")
        }
      } catch (error) {
        console.error("Error fetching course:", error)
        setError("Error al cargar el curso")
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
    if (courseId) {
      getCourse()
    }
  }, [courseId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation user={user} />
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

  if (error || !course) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation user={user} />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-20">
            <BookOpen className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Curso no encontrado</h3>
            <p className="text-gray-600 mb-4">{error || "El curso que buscas no existe o no está disponible."}</p>
            <Link href="/courses">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver a Cursos
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const totalDuration = course.lessons.reduce((sum, lesson) => sum + lesson.duration_minutes, 0)
  const totalLessons = course.lessons.length
  const freeLessons = course.lessons.filter((lesson) => lesson.is_free).length
  const sortedLessons = course.lessons.sort((a, b) => a.order_index - b.order_index)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation user={user} />

      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-blue-600">
              Inicio
            </Link>
            <span>/</span>
            <Link href="/courses" className="hover:text-blue-600">
              Cursos
            </Link>
            <span>/</span>
            <span className="text-gray-900">{course.title}</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Course Header */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <Badge variant="secondary">{course.difficulty_level}</Badge>
                    <Badge className="bg-green-600">${course.price}</Badge>
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{course.title}</h1>
                  <p className="text-gray-600 text-lg">{course.description}</p>
                </div>
              </div>

              <div className="flex items-center space-x-6 text-sm text-gray-600 mb-6">
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>
                    {Math.floor(totalDuration / 60)}h {totalDuration % 60}m
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <BookOpen className="w-4 h-4" />
                  <span>{totalLessons} lecciones</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Users className="w-4 h-4" />
                  <span>1,234 estudiantes</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span>4.8 (156 reseñas)</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  <span>Instructor: </span>
                  <span className="font-medium text-gray-900">{course.instructor}</span>
                </div>
                <div className="text-sm text-gray-600">
                  <span>Actualizado: </span>
                  <span>{new Date(course.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Course Content */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-900">Contenido del Curso</h2>
                <p className="text-gray-600 mt-1">
                  {totalLessons} lecciones • {Math.floor(totalDuration / 60)}h {totalDuration % 60}m de contenido total
                </p>
              </div>

              <div className="divide-y">
                {sortedLessons.map((lesson, index) => {
                  const canAccess = lesson.is_free || isEnrolled || user?.role === "admin"

                  return (
                    <div key={lesson.id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 flex-1">
                          <div className="flex-shrink-0">
                            {canAccess ? (
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <Play className="w-4 h-4 text-blue-600" />
                              </div>
                            ) : (
                              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                                <Lock className="w-4 h-4 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <h3 className="font-medium text-gray-900 truncate">{lesson.title}</h3>
                              {lesson.is_free && <Badge variant="outline">Gratis</Badge>}
                            </div>
                            {lesson.description && (
                              <p className="text-sm text-gray-600 mt-1 line-clamp-2">{lesson.description}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span>{lesson.duration_minutes} min</span>
                          {canAccess && (
                            <Link href={`/courses/${courseId}/lessons/${lesson.id}`}>
                              <Button size="sm" variant="ghost">
                                Ver
                              </Button>
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Course Preview */}
            <Card>
              <div className="aspect-video bg-gradient-to-br from-blue-500 to-purple-600 rounded-t-lg relative overflow-hidden">
                {course.thumbnail_url ? (
                  <img
                    src={course.thumbnail_url || "/placeholder.svg"}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white">
                    <BookOpen className="w-16 h-16 opacity-70" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
                    <Play className="w-8 h-8 text-blue-600 ml-1" />
                  </div>
                </div>
              </div>
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <div className="text-3xl font-bold text-gray-900 mb-1">${course.price}</div>
                  <div className="text-sm text-gray-600">Acceso completo de por vida</div>
                </div>

                {isEnrolled ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-center space-x-2 text-green-600 bg-green-50 rounded-lg p-3">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-medium">Ya estás inscrito</span>
                    </div>
                    <Link href={`/courses/${courseId}/lessons/${sortedLessons[0]?.id}`}>
                      <Button className="w-full" size="lg">
                        Continuar Curso
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Button className="w-full" size="lg">
                      Inscribirse Ahora
                    </Button>
                    {freeLessons > 0 && (
                      <Link href={`/courses/${courseId}/lessons/${sortedLessons.find((l) => l.is_free)?.id}`}>
                        <Button variant="outline" className="w-full bg-transparent">
                          Ver Lección Gratuita
                        </Button>
                      </Link>
                    )}
                  </div>
                )}

                <div className="text-center mt-4">
                  <p className="text-xs text-gray-500">Garantía de devolución de 30 días</p>
                </div>
              </CardContent>
            </Card>

            {/* Course Features */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Este curso incluye:</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <span className="text-sm">
                    {Math.floor(totalDuration / 60)}h {totalDuration % 60}m de video bajo demanda
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <BookOpen className="w-5 h-5 text-gray-400" />
                  <span className="text-sm">{totalLessons} lecciones</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Download className="w-5 h-5 text-gray-400" />
                  <span className="text-sm">Recursos descargables</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Globe className="w-5 h-5 text-gray-400" />
                  <span className="text-sm">Acceso desde cualquier dispositivo</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Award className="w-5 h-5 text-gray-400" />
                  <span className="text-sm">Certificado de finalización</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <span className="text-sm">Acceso de por vida</span>
                </div>
              </CardContent>
            </Card>

            {/* Instructor */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Instructor</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold">
                      {course.instructor
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{course.instructor}</h4>
                    <p className="text-sm text-gray-600">Especialista en Odontología</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span>4.9 rating</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="w-4 h-4" />
                    <span>12,345 estudiantes</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
