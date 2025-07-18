"use client"

import { useEffect, useState } from "react"
import { notFound, useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Play, Clock, BookOpen, Home, Lock } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Define types for the data
interface Lesson {
  id: string
  title: string
  description: string
  video_url: string
  duration_minutes: number
  is_free: boolean
  order_index: number
}

interface Course {
  id: string
  title: string
  lessons: Lesson[]
}

interface LessonData {
  lesson: Lesson
  course: Course
  previousLesson: Lesson | null
  nextLesson: Lesson | null
  currentIndex: number
  totalLessons: number
}

export default function LessonPage() {
  const params = useParams()
  const courseId = params.courseId as string
  const lessonId = params.lessonId as string

  const [data, setData] = useState<LessonData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!courseId || !lessonId) return

    async function fetchLessonData() {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch("/api/student/lesson", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ courseId, lessonId }),
        })

        const result = await response.json()

        if (result.success) {
          setData(result.data)
        } else {
          setError(result.message || "Error al cargar la lección.")
          if (response.status === 404) {
            // This will be caught by Next.js error boundary
            notFound()
          }
        }
      } catch (err) {
        setError("No se pudo conectar con el servidor. Inténtalo de nuevo más tarde.")
      } finally {
        setLoading(false)
      }
    }

    fetchLessonData()
  }, [courseId, lessonId])

  if (loading) {
    return <LessonPageLoadingSkeleton />
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive" className="max-w-2xl mx-auto">
          <Lock className="h-4 w-4" />
          <AlertTitle>Acceso Denegado</AlertTitle>
          <AlertDescription>
            <p>{error}</p>
            <p className="mt-2">Asegúrate de haber iniciado sesión y estar inscrito en este curso.</p>
            <div className="mt-4">
              <Link href="/dashboard">
                <Button variant="secondary">Ir a mi Dashboard</Button>
              </Link>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!data) {
    return null
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
            <Card>
              <CardContent className="p-0">
                <div className="aspect-video bg-black rounded-t-lg overflow-hidden">
                  <video
                    key={lesson.video_url}
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
                <div className="max-h-[600px] overflow-y-auto">
                  {course.lessons.map((courseLesson: Lesson, index: number) => (
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
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 ${
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

function LessonPageLoadingSkeleton() {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="grid lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <Card>
            <Skeleton className="aspect-video w-full rounded-t-lg" />
            <div className="p-6">
              <Skeleton className="h-8 w-3/4 mb-4" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3" />
              <div className="flex justify-between mt-6 pt-4 border-t">
                <Skeleton className="h-12 w-32" />
                <Skeleton className="h-12 w-32" />
              </div>
            </div>
          </Card>
        </div>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-full" />
            </CardHeader>
            <CardContent>
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-3 p-4">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
