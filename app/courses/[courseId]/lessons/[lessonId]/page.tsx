"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Clock, Play, Lock, CheckCircle, AlertCircle } from "lucide-react"

interface Lesson {
  id: string
  title: string
  content: string
  description: string
  duration_minutes: number
  video_url: string
  order_index: number
  is_free: boolean
  created_at: string
  course: {
    id: string
    title: string
    description: string
    price: number
  }
}

interface LessonAccess {
  hasAccess: boolean
  reason: string
  userRole: string
}

interface LessonResponse {
  success: boolean
  lesson?: Lesson
  access?: LessonAccess
  error?: string
  debug?: any
  requiresEnrollment?: boolean
}

export default function LessonPage() {
  const params = useParams()
  const router = useRouter()
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [access, setAccess] = useState<LessonAccess | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<any>(null)

  const courseId = params.courseId as string
  const lessonId = params.lessonId as string

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        setLoading(true)
        setError(null)

        console.log("🔍 Fetching lesson:", { courseId, lessonId })

        const response = await fetch(`/api/student/lesson?lessonId=${lessonId}`)
        const data: LessonResponse = await response.json()

        console.log("📊 Lesson API response:", data)

        setDebugInfo(data.debug)

        if (!response.ok) {
          throw new Error(data.error || `HTTP ${response.status}`)
        }

        if (data.success && data.lesson && data.access) {
          setLesson(data.lesson)
          setAccess(data.access)
        } else {
          throw new Error(data.error || "Failed to load lesson")
        }
      } catch (err) {
        console.error("❌ Error fetching lesson:", err)
        setError(err instanceof Error ? err.message : "Unknown error occurred")
      } finally {
        setLoading(false)
      }
    }

    if (lessonId) {
      fetchLesson()
    }
  }, [lessonId, courseId])

  const handleBackToCourse = () => {
    router.push(`/courses/${courseId}`)
  }

  const handleEnrollNow = () => {
    router.push(`/courses/${courseId}/checkout`)
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Skeleton className="h-8 w-32 mb-6" />
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
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
            <AlertDescription>
              <strong>Error al cargar la lección:</strong> {error}
            </AlertDescription>
          </Alert>

          {debugInfo && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-sm">Información de Debug</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto">
                  {JSON.stringify(debugInfo, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}

          <div className="mt-6 space-y-4">
            <Button onClick={handleBackToCourse} variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al curso
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!lesson || !access) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Button variant="ghost" onClick={handleBackToCourse} className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al curso
          </Button>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>No se pudo cargar la información de la lección.</AlertDescription>
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
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-2xl mb-2">{lesson.title}</CardTitle>
                <CardDescription className="text-base">{lesson.description}</CardDescription>
              </div>
              <div className="flex flex-col items-end gap-2 ml-4">
                <Badge variant={lesson.is_free ? "secondary" : "default"}>
                  {lesson.is_free ? "Gratuita" : "Premium"}
                </Badge>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="mr-1 h-4 w-4" />
                  {lesson.duration_minutes} min
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Access Status */}
        {access.hasAccess ? (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <strong>Acceso concedido:</strong>{" "}
              {access.reason === "admin_access"
                ? "Acceso de administrador"
                : access.reason === "free_lesson"
                  ? "Lección gratuita"
                  : "Usuario inscrito en el curso"}
            </AlertDescription>
          </Alert>
        ) : (
          <Alert variant="destructive" className="mb-6">
            <Lock className="h-4 w-4" />
            <AlertDescription>
              <strong>Acceso restringido:</strong> Esta lección requiere inscripción al curso para acceder al contenido
              completo.
            </AlertDescription>
          </Alert>
        )}

        {/* Video Player */}
        {access.hasAccess && lesson.video_url && (
          <Card className="mb-6">
            <CardContent className="p-0">
              <div className="aspect-video bg-black rounded-lg flex items-center justify-center">
                <div className="text-center text-white">
                  <Play className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">Reproductor de video</p>
                  <p className="text-sm opacity-75">URL: {lesson.video_url}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Lesson Content */}
        <Card>
          <CardHeader>
            <CardTitle>Contenido de la Lección</CardTitle>
          </CardHeader>
          <CardContent>
            {access.hasAccess ? (
              <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: lesson.content }} />
            ) : (
              <div className="text-center py-12">
                <Lock className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">Contenido Premium</h3>
                <p className="text-muted-foreground mb-6">
                  Inscríbete en el curso para acceder a todo el contenido y obtener tu certificado.
                </p>
                <div className="space-y-4">
                  <Button onClick={handleEnrollNow} size="lg">
                    Inscribirse Ahora
                  </Button>
                  <div className="text-sm text-muted-foreground">Precio del curso: ${lesson.course.price}</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Debug Information (only in development) */}
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
