import { createClient } from "@supabase/supabase-js"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Play, Clock, BookOpen, Lock } from "lucide-react"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

async function getLessonData(lessonId: string) {
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  const { data: lesson, error } = await supabase
    .from("lessons")
    .select(`
      id,
      title,
      description,
      content,
      video_url,
      duration_minutes,
      order_index,
      is_free,
      created_at,
      course_id,
      courses (
        id,
        title,
        description,
        price,
        instructor,
        difficulty_level,
        thumbnail_url
      )
    `)
    .eq("id", lessonId)
    .single()

  if (error || !lesson) {
    return null
  }

  return lesson
}

async function getCourseLessons(courseId: string) {
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  const { data: lessons, error } = await supabase
    .from("lessons")
    .select(`
      id,
      title,
      description,
      duration_minutes,
      order_index,
      is_free
    `)
    .eq("course_id", courseId)
    .order("order_index", { ascending: true })

  return lessons || []
}

export default async function LessonPage({
  params,
}: {
  params: { courseId: string; lessonId: string }
}) {
  const lesson = await getLessonData(params.lessonId)

  if (!lesson) {
    notFound()
  }

  const courseLessons = await getCourseLessons(params.courseId)
  const currentLessonIndex = courseLessons.findIndex((l) => l.id === params.lessonId)
  const nextLesson = currentLessonIndex < courseLessons.length - 1 ? courseLessons[currentLessonIndex + 1] : null
  const prevLesson = currentLessonIndex > 0 ? courseLessons[currentLessonIndex - 1] : null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href={`/courses/${params.courseId}`}>
                <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                  <ArrowLeft className="w-4 h-4" />
                  <span>Volver al Curso</span>
                </Button>
              </Link>
              <div className="hidden md:block">
                <h1 className="text-lg font-semibold text-gray-900">{lesson.courses.title}</h1>
                <p className="text-sm text-gray-600">por {lesson.courses.instructor}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Link href="/auth/login">
                <Button variant="ghost" size="sm">
                  Iniciar Sesión
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button size="sm">Registrarse</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Lesson Header */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Badge variant={lesson.is_free ? "secondary" : "default"}>
                        {lesson.is_free ? "Gratis" : "Premium"}
                      </Badge>
                      <span className="text-sm text-gray-500">Lección {lesson.order_index}</span>
                    </div>
                    <CardTitle className="text-2xl">{lesson.title}</CardTitle>
                    <p className="text-gray-600">{lesson.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{lesson.duration_minutes} min</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <BookOpen className="w-4 h-4" />
                        <span>Lección Interactiva</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Video Player */}
            {lesson.video_url && (
              <Card>
                <CardContent className="p-0">
                  <div className="aspect-video bg-black rounded-lg overflow-hidden">
                    <div className="w-full h-full flex items-center justify-center bg-gray-900">
                      <div className="text-center text-white">
                        <Play className="w-16 h-16 mx-auto mb-4 opacity-70" />
                        <p className="text-lg mb-2">Video de la Lección</p>
                        <p className="text-sm opacity-70">Duración: {lesson.duration_minutes} minutos</p>
                        {!lesson.is_free && (
                          <div className="mt-4 p-4 bg-yellow-900/50 rounded-lg">
                            <Lock className="w-6 h-6 mx-auto mb-2" />
                            <p className="text-sm">Contenido Premium</p>
                            <p className="text-xs opacity-70">Inscríbete al curso para acceder</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Lesson Content */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BookOpen className="w-5 h-5" />
                  <span>Contenido de la Lección</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {lesson.is_free ? (
                  <div
                    className="prose max-w-none"
                    dangerouslySetInnerHTML={{
                      __html: lesson.content || "<p>Contenido de la lección en desarrollo...</p>",
                    }}
                  />
                ) : (
                  <div className="text-center py-12">
                    <Lock className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-xl font-semibold mb-2">Contenido Premium</h3>
                    <p className="text-gray-600 mb-6">Esta lección es parte del contenido premium del curso.</p>
                    <Link href={`/courses/${params.courseId}/checkout`}>
                      <Button size="lg">Inscribirse al Curso - ${lesson.courses.price}</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex justify-between">
              {prevLesson ? (
                <Link href={`/courses/${params.courseId}/lessons/${prevLesson.id}`}>
                  <Button variant="outline" className="flex items-center space-x-2 bg-transparent">
                    <ArrowLeft className="w-4 h-4" />
                    <span>Lección Anterior</span>
                  </Button>
                </Link>
              ) : (
                <div></div>
              )}

              {nextLesson ? (
                <Link href={`/courses/${params.courseId}/lessons/${nextLesson.id}`}>
                  <Button className="flex items-center space-x-2">
                    <span>Siguiente Lección</span>
                    <ArrowLeft className="w-4 h-4 rotate-180" />
                  </Button>
                </Link>
              ) : (
                <Link href={`/courses/${params.courseId}`}>
                  <Button variant="outline">Volver al Curso</Button>
                </Link>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Course Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Información del Curso</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium">{lesson.courses.title}</h3>
                  <p className="text-sm text-gray-600">{lesson.courses.description}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Instructor:</span>
                    <span className="font-medium">{lesson.courses.instructor}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Nivel:</span>
                    <span className="font-medium capitalize">{lesson.courses.difficulty_level}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Precio:</span>
                    <span className="font-medium">${lesson.courses.price}</span>
                  </div>
                </div>
                <Link href={`/courses/${params.courseId}/checkout`} className="block">
                  <Button className="w-full">Inscribirse al Curso</Button>
                </Link>
              </CardContent>
            </Card>

            {/* Course Lessons */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Lecciones del Curso</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {courseLessons.map((courseLesson, index) => (
                    <Link
                      key={courseLesson.id}
                      href={`/courses/${params.courseId}/lessons/${courseLesson.id}`}
                      className={`block p-3 rounded-lg border transition-colors ${
                        courseLesson.id === params.lessonId ? "bg-blue-50 border-blue-200" : "hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                              courseLesson.id === params.lessonId
                                ? "bg-blue-600 text-white"
                                : courseLesson.is_free
                                  ? "bg-green-100 text-green-600"
                                  : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {courseLesson.id === params.lessonId ? <Play className="w-3 h-3" /> : index + 1}
                          </div>
                          <div>
                            <h4 className="text-sm font-medium">{courseLesson.title}</h4>
                            <p className="text-xs text-gray-500">{courseLesson.duration_minutes} min</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          {courseLesson.is_free ? (
                            <Badge variant="secondary" className="text-xs">
                              Gratis
                            </Badge>
                          ) : (
                            <Lock className="w-3 h-3 text-gray-400" />
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
