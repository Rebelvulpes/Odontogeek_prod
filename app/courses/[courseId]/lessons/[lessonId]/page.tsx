import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Clock, BookOpen, Lock, CheckCircle } from "lucide-react"
import { createServerClient } from "@/lib/supabase-client"

interface Lesson {
  id: string
  title: string
  description: string
  video_url: string
  duration_minutes: number
  order_index: number
  is_free: boolean
  course_id: string
}

interface Course {
  id: string
  title: string
  description: string
  instructor_name: string
}

async function getLesson(courseId: string, lessonId: string): Promise<{ lesson: Lesson; course: Course } | null> {
  try {
    const supabase = createServerClient()

    // Get lesson details
    const { data: lesson, error: lessonError } = await supabase
      .from("lessons")
      .select("*")
      .eq("id", lessonId)
      .eq("course_id", courseId)
      .neq("archived", true)
      .single()

    if (lessonError || !lesson) {
      console.error("Error fetching lesson:", lessonError)
      return null
    }

    // Get course details
    const { data: course, error: courseError } = await supabase
      .from("courses")
      .select("id, title, description, instructor_name")
      .eq("id", courseId)
      .single()

    if (courseError || !course) {
      console.error("Error fetching course:", courseError)
      return null
    }

    return { lesson, course }
  } catch (error) {
    console.error("Error in getLesson:", error)
    return null
  }
}

async function checkUserAccess(courseId: string, userId?: string): Promise<boolean> {
  if (!userId) return false

  try {
    const supabase = createServerClient()

    const { data: enrollment, error } = await supabase
      .from("enrollments")
      .select("id")
      .eq("course_id", courseId)
      .eq("user_id", userId)
      .single()

    return !error && !!enrollment
  } catch (error) {
    console.error("Error checking user access:", error)
    return false
  }
}

export default async function LessonPage({
  params,
}: {
  params: { courseId: string; lessonId: string }
}) {
  const data = await getLesson(params.courseId, params.lessonId)

  if (!data) {
    notFound()
  }

  const { lesson, course } = data

  // For demo purposes, we'll assume user has access
  // In production, you'd check authentication and enrollment
  const hasAccess = true // await checkUserAccess(params.courseId, user?.id)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/courses/${params.courseId}`}
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al curso
          </Link>

          <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
            <BookOpen className="w-4 h-4" />
            <span>{course.title}</span>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">{lesson.title}</h1>

          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              <span>{lesson.duration_minutes} minutos</span>
            </div>
            <div className="flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              <span>Lección {lesson.order_index}</span>
            </div>
            {lesson.is_free && (
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Gratuita
              </Badge>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Video Player */}
            <div className="mb-8">
              {hasAccess || lesson.is_free ? (
                <div className="w-full">
                  <iframe
                    src={lesson.video_url}
                    title={lesson.title}
                    className="w-full h-96 rounded-lg shadow-lg"
                    allowFullScreen
                  />
                </div>
              ) : (
                <div className="w-full h-96 bg-gray-900 rounded-lg flex items-center justify-center">
                  <div className="text-center text-white">
                    <Lock className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <h3 className="text-xl font-semibold mb-2">Contenido Bloqueado</h3>
                    <p className="text-gray-300 mb-4">Necesitas estar inscrito en el curso para ver esta lección</p>
                    <Link href={`/courses/${params.courseId}`}>
                      <Button>Ver Curso</Button>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Lesson Content */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="w-5 h-5 mr-2" />
                  Contenido de la lección
                </CardTitle>
              </CardHeader>
              <CardContent>
                {hasAccess || lesson.is_free ? (
                  <div className="prose max-w-none">
                    <p className="text-gray-700 leading-relaxed">{lesson.description}</p>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Lock className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-500">Contenido no disponible</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Información del Curso</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">{course.title}</h3>
                  <p className="text-sm text-gray-600">{course.description}</p>
                </div>

                {course.instructor_name && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Instructor</h4>
                    <p className="text-sm text-gray-600">{course.instructor_name}</p>
                  </div>
                )}

                <div className="pt-4 border-t">
                  <Link href={`/courses/${params.courseId}`}>
                    <Button className="w-full">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Volver al Curso
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Progress Card */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-sm">Tu Progreso</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-sm text-gray-600">Lección completada</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
