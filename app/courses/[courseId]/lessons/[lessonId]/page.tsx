"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, ArrowRight, BookOpen, Clock, User, Lock } from "lucide-react"
import Link from "next/link"

interface Lesson {
  id: string
  title: string
  content: string
  video_url?: string
  duration_minutes?: number
  order_index: number
}

interface Course {
  id: string
  title: string
  description: string
  instructor: string
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
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (courseId && lessonId) {
      fetchLessonData()
    }
  }, [courseId, lessonId])

  const fetchLessonData = async () => {
    try {
      setIsLoading(true)
      setError("")

      const response = await fetch("/api/student/lesson", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Important: include cookies
        body: JSON.stringify({ courseId, lessonId }),
      })

      const result = await response.json()

      if (result.success) {
        setData(result.data)
      } else {
        if (response.status === 401) {
          // Session expired - redirect to login
          window.location.assign("/auth/login")
          return
        } else if (response.status === 403) {
          // Not enrolled or access denied
          setError(result.message || "No tienes acceso a esta lección")
        } else {
          setError(result.message || "Error al cargar la lección")
        }
      }
    } catch (error) {
      console.error("Lesson fetch error:", error)
      setError("Error de conexión. Por favor, recarga la página.")
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header Skeleton */}
          <div className="mb-6">
            <Skeleton className="h-4 w-32 mb-4" />
            <Skeleton className="h-8 w-96 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>

          {/* Content Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-64 w-full mb-4" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card>
                <CardHeader>
                  <Skeleton className="h-5 w-32" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[1, 2, 3, 4].map((i) => (
                      <Skeleton key={i} className="h-10 w-full" />
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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-600 flex items-center justify-center">
              <Lock className="h-5 w-5 mr-2" />
              Acceso Denegado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <div className="mt-4 space-y-2">
              <Button onClick={fetchLessonData} className="w-full">
                Reintentar
              </Button>
              <Button asChild variant="outline" className="w-full bg-transparent">
                <Link href="/dashboard">Volver al Dashboard</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <Card>
          <CardContent className="p-6">
            <p>No se pudieron cargar los datos de la lección.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center space-x-4">
            <Button asChild variant="ghost" size="sm">
              <Link href={`/courses/${courseId}`}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver al Curso
              </Link>
            </Button>
            <div className="flex-1">
              <h1 className="text-xl font-semibold text-gray-900">{data.lesson.title}</h1>
              <p className="text-sm text-gray-600">
                Lección {data.currentIndex + 1} de {data.totalLessons} • {data.course.title}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {data.lesson.title}
                  {data.lesson.duration_minutes && (
                    <Badge variant="secondary" className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {data.lesson.duration_minutes} min
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription className="flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  {data.course.instructor}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Video Player */}
                {data.lesson.video_url && (
                  <div className="mb-6">
                    <div className="aspect-video bg-black rounded-lg overflow-hidden">
                      <video
                        controls
                        className="w-full h-full"
                        poster="/placeholder.svg?height=400&width=600&text=Video+Lesson"
                      >
                        <source src={data.lesson.video_url} type="video/mp4" />
                        Tu navegador no soporta el elemento de video.
                      </video>
                    </div>
                  </div>
                )}

                {/* Lesson Content */}
                <div className="prose max-w-none">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: data.lesson.content || "<p>Contenido de la lección no disponible.</p>",
                    }}
                  />
                </div>

                {/* Navigation */}
                <div className="flex justify-between items-center mt-8 pt-6 border-t">
                  {data.previousLesson ? (
                    <Button asChild variant="outline">
                      <Link href={`/courses/${courseId}/lessons/${data.previousLesson.id}`}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Lección Anterior
                      </Link>
                    </Button>
                  ) : (
                    <div />
                  )}

                  {data.nextLesson ? (
                    <Button asChild>
                      <Link href={`/courses/${courseId}/lessons/${data.nextLesson.id}`}>
                        Siguiente Lección
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Link>
                    </Button>
                  ) : (
                    <Button asChild variant="outline">
                      <Link href={`/courses/${courseId}`}>
                        <BookOpen className="h-4 w-4 mr-2" />
                        Ver Curso Completo
                      </Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Course Lessons */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Lecciones del Curso</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {data.course.lessons
                    .sort((a, b) => a.order_index - b.order_index)
                    .map((lesson, index) => (
                      <Link
                        key={lesson.id}
                        href={`/courses/${courseId}/lessons/${lesson.id}`}
                        className={`block p-3 rounded-lg border transition-colors ${
                          lesson.id === data.lesson.id
                            ? "bg-blue-50 border-blue-200 text-blue-900"
                            : "hover:bg-gray-50 border-gray-200"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="text-sm font-medium line-clamp-2">{lesson.title}</p>
                            <p className="text-xs text-gray-500">Lección {index + 1}</p>
                          </div>
                          {lesson.duration_minutes && (
                            <Badge variant="outline" className="text-xs">
                              {lesson.duration_minutes}m
                            </Badge>
                          )}
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
