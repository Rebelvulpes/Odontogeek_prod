import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, ArrowRight, Clock, BookOpen, CheckCircle, Play } from "lucide-react"
import Link from "next/link"
import { getServerSupabaseClient, getServerUser } from "@/lib/server-utils"

interface Lesson {
  id: string
  title: string
  description: string
  video_url: string
  duration_minutes: number
  order_index: number
  is_free: boolean
  course_id: string
  content: string
}

interface Course {
  id: string
  title: string
  description: string
  instructor_name: string
  thumbnail_url: string
}

interface LessonPageProps {
  params: {
    courseId: string
    lessonId: string
  }
}

async function getLesson(courseId: string, lessonId: string): Promise<{ lesson: Lesson; course: Course } | null> {
  try {
    const supabase = getServerSupabaseClient()

    // Get lesson data
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

    // Get course data
    const { data: course, error: courseError } = await supabase
      .from("courses")
      .select("id, title, description, instructor_name, thumbnail_url")
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

async function getCourseLessons(courseId: string): Promise<Lesson[]> {
  try {
    const supabase = getServerSupabaseClient()

    const { data: lessons, error } = await supabase
      .from("lessons")
      .select("*")
      .eq("course_id", courseId)
      .neq("archived", true)
      .order("order_index", { ascending: true })

    if (error) {
      console.error("Error fetching course lessons:", error)
      return []
    }

    return lessons || []
  } catch (error) {
    console.error("Error in getCourseLessons:", error)
    return []
  }
}

async function checkEnrollment(userId: string, courseId: string): Promise<boolean> {
  try {
    const supabase = getServerSupabaseClient()
    const { data, error } = await supabase
      .from("enrollments")
      .select("id")
      .eq("user_id", userId)
      .eq("course_id", courseId)
      .single()

    return !error && !!data
  } catch (error) {
    console.error("Error checking enrollment:", error)
    return false
  }
}

export default async function LessonPage({ params }: LessonPageProps) {
  const user = await getServerUser()
  const data = await getLesson(params.courseId, params.lessonId)

  if (!data) {
    notFound()
  }

  const { lesson, course } = data
  const allLessons = await getCourseLessons(params.courseId)

  // Check if user is enrolled or lesson is free
  const isEnrolled = user ? await checkEnrollment(user.id, params.courseId) : false
  const hasAccess = lesson.is_free || isEnrolled

  const currentLessonIndex = allLessons.findIndex((l) => l.id === lesson.id)
  const previousLesson = currentLessonIndex > 0 ? allLessons[currentLessonIndex - 1] : null
  const nextLesson = currentLessonIndex < allLessons.length - 1 ? allLessons[currentLessonIndex + 1] : null

  const progress = allLessons.length > 0 ? ((currentLessonIndex + 1) / allLessons.length) * 100 : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href={`/courses/${params.courseId}`}>
                <Button variant="ghost" size="sm" className="hover:bg-blue-50">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Volver al Curso
                </Button>
              </Link>
              <Separator orientation="vertical" className="h-6" />
              <div>
                <h1 className="font-semibold text-gray-900 truncate max-w-md">{lesson.title}</h1>
                <p className="text-sm text-gray-500">{course.title}</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Lección {currentLessonIndex + 1} de {allLessons.length}
              </div>
              <div className="w-32">
                <Progress value={progress} className="h-2" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Video Player */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg overflow-hidden">
              <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
                {hasAccess && lesson.video_url ? (
                  <iframe
                    src={lesson.video_url}
                    title={lesson.title}
                    className="absolute top-0 left-0 w-full h-full rounded-lg"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  />
                ) : (
                  <div className="absolute top-0 left-0 w-full h-full bg-gray-100 flex items-center justify-center rounded-lg">
                    <div className="text-center">
                      <Play className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      {!hasAccess ? (
                        <div>
                          <p className="text-gray-500 mb-4">Necesitas estar inscrito para ver este contenido</p>
                          <Link href={`/courses/${params.courseId}`}>
                            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                              Ver Curso
                            </Button>
                          </Link>
                        </div>
                      ) : (
                        <p className="text-gray-500">Video no disponible</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Lesson Info */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-2xl mb-2">{lesson.title}</CardTitle>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1 text-blue-500" />
                        {lesson.duration_minutes} minutos
                      </div>
                      <div className="flex items-center">
                        <BookOpen className="w-4 h-4 mr-1 text-green-500" />
                        Lección {currentLessonIndex + 1}
                      </div>
                      {lesson.is_free && (
                        <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0">
                          Gratis
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                {hasAccess ? (
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {lesson.description || lesson.content || "No hay descripción disponible."}
                  </p>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">Contenido no disponible</p>
                    <p className="text-sm text-gray-400">Inscríbete en el curso para acceder a todo el contenido</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex justify-between">
              {previousLesson ? (
                <Link href={`/courses/${params.courseId}/lessons/${previousLesson.id}`}>
                  <Button variant="outline" className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Lección Anterior
                  </Button>
                </Link>
              ) : (
                <div></div>
              )}

              {nextLesson ? (
                <Link href={`/courses/${params.courseId}/lessons/${nextLesson.id}`}>
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg">
                    Siguiente Lección
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              ) : (
                <Link href={`/courses/${params.courseId}`}>
                  <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white border-0 shadow-lg">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Completar Curso
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg sticky top-24">
              <CardHeader>
                <CardTitle className="text-lg">Contenido del Curso</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-96 overflow-y-auto">
                  {allLessons.map((lessonItem, index) => (
                    <Link
                      key={lessonItem.id}
                      href={`/courses/${params.courseId}/lessons/${lessonItem.id}`}
                      className={`block p-4 border-b border-gray-100 hover:bg-blue-50 transition-colors ${
                        lessonItem.id === lesson.id ? "bg-blue-50 border-l-4 border-l-blue-500" : ""
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div
                          className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                            lessonItem.id === lesson.id
                              ? "bg-blue-500 text-white"
                              : index < currentLessonIndex
                                ? "bg-green-500 text-white"
                                : "bg-gray-200 text-gray-600"
                          }`}
                        >
                          {index < currentLessonIndex ? <CheckCircle className="w-3 h-3" /> : index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-sm font-medium truncate ${
                              lessonItem.id === lesson.id ? "text-blue-700" : "text-gray-900"
                            }`}
                          >
                            {lessonItem.title}
                          </p>
                          <div className="flex items-center mt-1 text-xs text-gray-500">
                            <Clock className="w-3 h-3 mr-1" />
                            {lessonItem.duration_minutes} min
                            {lessonItem.is_free && (
                              <Badge className="ml-2 text-xs bg-green-100 text-green-700 border-0">Gratis</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Course Info */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Sobre el Curso</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <img
                      src={course.thumbnail_url || "/placeholder.svg?height=120&width=200"}
                      alt={course.title}
                      className="w-full h-24 object-cover rounded-lg mb-3"
                    />
                    <h3 className="font-semibold text-gray-900 mb-2">{course.title}</h3>
                    <p className="text-sm text-gray-600 line-clamp-3">{course.description}</p>
                  </div>

                  {course.instructor_name && (
                    <div>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Instructor:</span> {course.instructor_name}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center">
                      <BookOpen className="w-4 h-4 mr-1" />
                      {allLessons.length} lecciones
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {allLessons.reduce((total, l) => total + l.duration_minutes, 0)} min
                    </div>
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
