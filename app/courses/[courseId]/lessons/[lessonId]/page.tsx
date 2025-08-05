import { notFound, redirect } from "next/navigation"
import { getServerUser } from "@/lib/server-utils"
import { getServerSupabaseClient } from "@/lib/server-utils"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { ArrowLeft, ArrowRight, BookOpen, Clock, CheckCircle, Lock, Play } from "lucide-react"
import Link from "next/link"

interface LessonPageProps {
  params: {
    courseId: string
    lessonId: string
  }
}

export default async function LessonPage({ params }: LessonPageProps) {
  const user = await getServerUser()

  if (!user) {
    redirect("/auth/login")
  }

  const supabase = getServerSupabaseClient()

  // Fetch lesson details
  const { data: lesson, error: lessonError } = await supabase
    .from("lessons")
    .select(`
      *,
      courses (
        id,
        title,
        description,
        instructor,
        price
      )
    `)
    .eq("id", params.lessonId)
    .eq("course_id", params.courseId)
    .single()

  if (lessonError || !lesson) {
    console.error("Lesson not found:", lessonError)
    notFound()
  }

  // Check if user is enrolled in the course
  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("*")
    .eq("user_id", user.id)
    .eq("course_id", params.courseId)
    .single()

  const isEnrolled = !!enrollment || user.role === "admin"

  // Get all lessons for navigation
  const { data: allLessons } = await supabase
    .from("lessons")
    .select("id, title, order_index")
    .eq("course_id", params.courseId)
    .order("order_index")

  const currentLessonIndex = allLessons?.findIndex((l) => l.id === params.lessonId) ?? -1
  const previousLesson = currentLessonIndex > 0 ? allLessons?.[currentLessonIndex - 1] : null
  const nextLesson = currentLessonIndex < (allLessons?.length ?? 0) - 1 ? allLessons?.[currentLessonIndex + 1] : null

  // Calculate progress
  const progress = allLessons ? ((currentLessonIndex + 1) / allLessons.length) * 100 : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Floating elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-purple-400/10 to-pink-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <Navigation user={user} />

      <main className="relative py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
            <Link href="/courses" className="hover:text-blue-600 transition-colors">
              Cursos
            </Link>
            <span>/</span>
            <Link href={`/courses/${params.courseId}`} className="hover:text-blue-600 transition-colors">
              {lesson.courses?.title}
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">{lesson.title}</span>
          </div>

          {/* Progress Bar */}
          <Card className="mb-8 backdrop-blur-sm bg-white/80 border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Progreso del Curso</h3>
                <span className="text-sm font-medium text-gray-600">
                  {currentLessonIndex + 1} de {allLessons?.length || 0} lecciones
                </span>
              </div>
              <Progress value={progress} className="h-2" />
              <p className="text-sm text-gray-600 mt-2">{Math.round(progress)}% completado</p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Lesson Header */}
              <Card className="mb-8 backdrop-blur-sm bg-white/80 border-0 shadow-xl">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0">
                      Lección {lesson.order_index}
                    </Badge>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span>{lesson.duration || "15 min"}</span>
                    </div>
                  </div>
                  <CardTitle className="text-3xl font-bold text-gray-900 mt-4">{lesson.title}</CardTitle>
                  {lesson.description && (
                    <CardDescription className="text-lg text-gray-600 mt-2">{lesson.description}</CardDescription>
                  )}
                </CardHeader>
              </Card>

              {/* Video Player */}
              <Card className="mb-8 backdrop-blur-sm bg-white/80 border-0 shadow-xl overflow-hidden">
                <CardContent className="p-0">
                  {isEnrolled ? (
                    <AspectRatio ratio={16 / 9}>
                      {lesson.video_url ? (
                        <iframe
                          src={lesson.video_url}
                          title={lesson.title}
                          className="w-full h-full"
                          allowFullScreen
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                          <div className="text-center">
                            <Play className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600">Video no disponible</p>
                          </div>
                        </div>
                      )}
                    </AspectRatio>
                  ) : (
                    <AspectRatio ratio={16 / 9}>
                      <div className="w-full h-full bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20"></div>
                        <div className="text-center text-white relative z-10">
                          <Lock className="h-16 w-16 mx-auto mb-4" />
                          <h3 className="text-xl font-semibold mb-2">Contenido Bloqueado</h3>
                          <p className="text-gray-300 mb-6">Inscríbete en el curso para acceder a esta lección</p>
                          <Link href={`/courses/${params.courseId}`}>
                            <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0">
                              Ver Curso
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </AspectRatio>
                  )}
                </CardContent>
              </Card>

              {/* Lesson Content */}
              {isEnrolled && lesson.content && (
                <Card className="mb-8 backdrop-blur-sm bg-white/80 border-0 shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <BookOpen className="h-5 w-5 mr-2" />
                      Contenido de la Lección
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: lesson.content }} />
                  </CardContent>
                </Card>
              )}

              {/* Navigation */}
              <div className="flex justify-between items-center">
                {previousLesson ? (
                  <Link href={`/courses/${params.courseId}/lessons/${previousLesson.id}`}>
                    <Button
                      variant="outline"
                      className="border-2 border-gray-300 hover:border-blue-500 hover:text-blue-600 bg-transparent"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Lección Anterior
                    </Button>
                  </Link>
                ) : (
                  <div></div>
                )}

                {nextLesson ? (
                  <Link href={`/courses/${params.courseId}/lessons/${nextLesson.id}`}>
                    <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0">
                      Siguiente Lección
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                ) : (
                  <Link href={`/courses/${params.courseId}`}>
                    <Button className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Completar Curso
                    </Button>
                  </Link>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-xl sticky top-8">
                <CardHeader>
                  <CardTitle className="text-lg">Contenido del Curso</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {allLessons?.map((lessonItem, index) => (
                      <Link
                        key={lessonItem.id}
                        href={`/courses/${params.courseId}/lessons/${lessonItem.id}`}
                        className={`block p-3 rounded-lg transition-all duration-200 ${
                          lessonItem.id === params.lessonId
                            ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg"
                            : "hover:bg-gray-100 text-gray-700"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <span className="text-sm font-medium">{index + 1}</span>
                            <span className="text-sm font-medium truncate">{lessonItem.title}</span>
                          </div>
                          {lessonItem.id === params.lessonId && <Play className="h-4 w-4" />}
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
