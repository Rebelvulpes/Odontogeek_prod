import { createClient } from "@supabase/supabase-js"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Play, Clock, BookOpen, Home } from "lucide-react"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

async function getLessonWithCourse(courseId: string, lessonId: string) {
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  // Obtener la lección actual
  const { data: lesson, error: lessonError } = await supabase
    .from("lessons")
    .select("*")
    .eq("id", lessonId)
    .eq("course_id", courseId)
    .single()

  if (lessonError || !lesson) {
    return null
  }

  // Obtener el curso y todas sus lecciones
  const { data: course, error: courseError } = await supabase
    .from("courses")
    .select(`
      *,
      lessons:lessons(*)
    `)
    .eq("id", courseId)
    .single()

  if (courseError || !course) {
    return null
  }

  // Ordenar lecciones por order_index
  course.lessons.sort((a: any, b: any) => a.order_index - b.order_index)

  // Encontrar lección anterior y siguiente
  const currentIndex = course.lessons.findIndex((l: any) => l.id === lesson.id)
  const previousLesson = currentIndex > 0 ? course.lessons[currentIndex - 1] : null
  const nextLesson = currentIndex < course.lessons.length - 1 ? course.lessons[currentIndex + 1] : null

  return {
    lesson,
    course,
    previousLesson,
    nextLesson,
    currentIndex,
    totalLessons: course.lessons.length,
  }
}

export default async function LessonPage({
  params,
}: {
  params: { courseId: string; lessonId: string }
}) {
  const data = await getLessonWithCourse(params.courseId, params.lessonId)

  if (!data) {
    notFound()
  }

  const { lesson, course, previousLesson, nextLesson, currentIndex, totalLessons } = data

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2">
                <img src="/images/odontogeek-logo-new.png" alt="OdontoGeek" className="h-8 w-auto" />
              </Link>
              <div className="hidden md:flex items-center space-x-2 text-sm text-gray-600">
                <Link href={`/courses/${course.id}`} className="hover:text-blue-600">
                  {course.title}
                </Link>
                <span>/</span>
                <span className="text-gray-900">{lesson.title}</span>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant="secondary" className="text-xs">
                {currentIndex + 1} de {totalLessons}
              </Badge>
              <Link href={`/courses/${course.id}`}>
                <Button variant="outline" size="sm">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Ver Curso
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Video Player */}
          <div className="lg:col-span-3 space-y-6">
            {/* Video Container */}
            <Card>
              <CardContent className="p-0">
                <div className="aspect-video bg-black rounded-t-lg overflow-hidden">
                  <video
                    controls
                    className="w-full h-full"
                    poster="/placeholder.svg?height=400&width=600"
                    preload="metadata"
                  >
                    <source src={lesson.video_url} type="video/mp4" />
                    Tu navegador no soporta el elemento de video.
                  </video>
                </div>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900 mb-2">{lesson.title}</h1>
                      <p className="text-gray-600">{lesson.description}</p>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="w-4 h-4 mr-1" />
                      {lesson.duration_minutes} min
                    </div>
                  </div>

                  {/* Navigation Buttons */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div>
                      {previousLesson ? (
                        <Link href={`/courses/${course.id}/lessons/${previousLesson.id}`}>
                          <Button variant="outline" className="flex items-center bg-transparent">
                            <ChevronLeft className="w-4 h-4 mr-2" />
                            <div className="text-left">
                              <div className="text-xs text-gray-500">Anterior</div>
                              <div className="font-medium truncate max-w-[150px]">{previousLesson.title}</div>
                            </div>
                          </Button>
                        </Link>
                      ) : (
                        <Button variant="outline" disabled className="flex items-center bg-transparent">
                          <ChevronLeft className="w-4 h-4 mr-2" />
                          <div className="text-left">
                            <div className="text-xs text-gray-400">Primera lección</div>
                          </div>
                        </Button>
                      )}
                    </div>

                    <div className="text-center">
                      <div className="text-sm text-gray-600">
                        Lección {currentIndex + 1} de {totalLessons}
                      </div>
                      <div className="w-32 bg-gray-200 rounded-full h-2 mt-1">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${((currentIndex + 1) / totalLessons) * 100}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      {nextLesson ? (
                        <Link href={`/courses/${course.id}/lessons/${nextLesson.id}`}>
                          <Button className="flex items-center">
                            <div className="text-right">
                              <div className="text-xs opacity-90">Siguiente</div>
                              <div className="font-medium truncate max-w-[150px]">{nextLesson.title}</div>
                            </div>
                            <ChevronRight className="w-4 h-4 ml-2" />
                          </Button>
                        </Link>
                      ) : (
                        <Link href={`/courses/${course.id}`}>
                          <Button className="flex items-center">
                            <div className="text-right">
                              <div className="text-xs opacity-90">Finalizar</div>
                              <div className="font-medium">Ver Curso</div>
                            </div>
                            <Home className="w-4 h-4 ml-2" />
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Course Lessons */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{course.title}</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-96 overflow-y-auto">
                  {course.lessons.map((courseLesson: any, index: number) => (
                    <Link
                      key={courseLesson.id}
                      href={`/courses/${course.id}/lessons/${courseLesson.id}`}
                      className="block"
                    >
                      <div
                        className={`flex items-center space-x-3 p-4 border-b hover:bg-gray-50 transition-colors ${
                          courseLesson.id === lesson.id ? "bg-blue-50 border-l-4 border-l-blue-600" : ""
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                            courseLesson.id === lesson.id
                              ? "bg-blue-600 text-white"
                              : index < currentIndex
                                ? "bg-green-100 text-green-600"
                                : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {index < currentIndex ? "✓" : courseLesson.order_index}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">{courseLesson.title}</div>
                          <div className="flex items-center text-xs text-gray-500 mt-1">
                            <Clock className="w-3 h-3 mr-1" />
                            {courseLesson.duration_minutes} min
                            {courseLesson.is_free && (
                              <Badge variant="secondary" className="ml-2 text-xs bg-green-100 text-green-800">
                                Gratis
                              </Badge>
                            )}
                          </div>
                        </div>
                        {courseLesson.id === lesson.id && <Play className="w-4 h-4 text-blue-600" />}
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
