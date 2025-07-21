"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Clock, BookOpen, AlertCircle, CheckCircle } from "lucide-react"

interface Lesson {
  id: string
  title: string
  description: string
  content: string
  video_url: string
  duration_minutes: number
  order_index: number
  is_free: boolean
  course: {
    id: string
    title: string
  }
}

interface LessonResponse {
  success: boolean
  lesson?: Lesson
  error?: string
  hasAccess?: boolean
  accessReason?: string
  isAdmin?: boolean
  isFreeLesson?: boolean
}

export default function LessonPage() {
  const params = useParams()
  const router = useRouter()
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<any>(null)

  const courseId = params.courseId as string
  const lessonId = params.lessonId as string

  useEffect(() => {
    if (!lessonId) {
      setError("ID de lección no válido")
      setLoading(false)
      return
    }

    fetchLesson()
  }, [lessonId])

  const fetchLesson = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log(`🔍 Fetching lesson: ${lessonId}`)

      const response = await fetch(`/api/student/lesson?lessonId=${lessonId}`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data: LessonResponse = await response.json()

      // Store debug info for troubleshooting
      setDebugInfo(data)
      console.log("📊 Lesson API Response:", data)

      if (!response.ok) {
        if (response.status === 401) {
          setError("Debes iniciar sesión para acceder a esta lección")
          // Redirect to login after a delay
          setTimeout(() => {
            router.push("/auth/login")
          }, 2000)
          return
        }

        if (response.status === 403) {
          setError("No tienes acceso a esta lección. Es necesario inscribirse en el curso.")
          return
        }

        if (response.status === 404) {
          setError("Lección no encontrada")
          return
        }

        setError(data.error || "Error al cargar la lección")
        return
      }

      if (data.success && data.lesson) {
        setLesson(data.lesson)
        console.log(`✅ Lesson loaded: ${data.lesson.title}`)
      } else {
        setError(data.error || "Error al cargar la lección")
      }
    } catch (error) {
      console.error("❌ Error fetching lesson:", error)
      setError("Error de conexión. Por favor, intenta de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  const handleBackToCourse = () => {
    router.push(`/courses/${courseId}`)
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Skeleton className="h-8 w-48 mb-6" />
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full mb-4" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Button variant="ghost" onClick={handleBackToCourse} className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al curso
          </Button>

          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-lg">{error}</AlertDescription>
          </Alert>

          {/* Debug information for development */}
          {process.env.NODE_ENV === "development" && debugInfo && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-sm">Debug Information</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto">
                  {JSON.stringify(debugInfo, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    )
  }

  if (!lesson) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Button variant="ghost" onClick={handleBackToCourse} className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al curso
          </Button>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>No se pudo cargar la lección. Por favor, intenta de nuevo.</AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Navigation */}
        <Button variant="ghost" onClick={handleBackToCourse} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a {lesson.course.title}
        </Button>

        {/* Lesson Header */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <CardTitle className="text-2xl mb-2">{lesson.title}</CardTitle>
                <p className="text-muted-foreground mb-4">{lesson.description}</p>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {lesson.duration_minutes} minutos
                  </div>
                  <div className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4" />
                    Lección {lesson.order_index}
                  </div>
                  {lesson.is_free && (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Gratis
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Video Player */}
        {lesson.video_url && (
          <Card className="mb-6">
            <CardContent className="p-0">
              <div className="aspect-video">
                <iframe
                  src={lesson.video_url}
                  title={lesson.title}
                  className="w-full h-full rounded-t-lg"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Lesson Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Contenido de la lección
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: lesson.content }} />
          </CardContent>
        </Card>

        {/* Debug information for development */}
        {process.env.NODE_ENV === "development" && debugInfo && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-sm">Debug Information</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto">{JSON.stringify(debugInfo, null, 2)}</pre>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
