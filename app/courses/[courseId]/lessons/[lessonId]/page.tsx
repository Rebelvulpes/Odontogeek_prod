"use client"

import { useState, useEffect } from "react"
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
    instructor: string
  }
}

interface LessonAccess {
  hasAccess: boolean
  reason: string
  userRole: string
}

interface LessonResponse {
  success: boolean
  lesson: Lesson
  access: LessonAccess
  debug?: any
  error?: string
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
    if (!lessonId) return

    const fetchLesson = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`/api/student/lesson?lessonId=${lessonId}`, {
          method: "GET",
          credentials: "include",
        })

        const data: LessonResponse = await response.json()

        // Always set debug info if available
        if (data.debug) {
          setDebugInfo(data.debug)
        }

        if (!response.ok) {
          throw new Error(data.error || `HTTP error! status: ${response.status}`)
        }

        if (data.success && data.lesson) {
          setLesson(data.lesson)
          setAccess(data.access)
        } else {
          throw new Error(data.error || "Failed to load lesson")
        }
      } catch (err) {
        console.error("Error fetching lesson:", err)
        setError(err instanceof Error ? err.message : "Failed to load lesson")
      } finally {
        setLoading(false)
      }
    }

    fetchLesson()
  }, [lessonId])

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
            <AlertDescription>{error}</AlertDescription>
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

          <div className="mt-6 text-center">
            <Button onClick={() => window.location.reload()}>Intentar de nuevo</Button>
          </div>
        </div>
      </div>
    )
  }

  if (!lesson || !access) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
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
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant={lesson.is_free ? "secondary" : "default"}>
                    {lesson.is_free ? "Gratuita" : "Premium"}
                  </Badge>
                  <Badge variant="outline">
                    <Clock className="mr-1 h-3 w-3" />
                    {lesson.duration_minutes} min
                  </Badge>
                  {access.hasAccess && (
                    <Badge variant="outline" className="text-green-600">
                      <CheckCircle className="mr-1 h-3 w-3" />
                      Acceso concedido
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-2xl mb-2">{lesson.title}</CardTitle>
                <CardDescription className="text-base">{lesson.description}</CardDescription>
              </div>
              {lesson.video_url && access.hasAccess && (
                <Button className="ml-4">
                  <Play className="mr-2 h-4 w-4" />
                  Reproducir Video
                </Button>
              )}
            </div>
          </CardHeader>
        </Card>

        {/* Access Control */}
        {!access.hasAccess && (
          <Alert className="mb-6">
            <Lock className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>Esta lección requiere inscripción al curso para acceder al contenido completo.</span>
              <Button onClick={handleEnrollNow} size="sm">
                Inscribirse Ahora
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Lesson Content */}
        <Card>
          <CardContent className="pt-6">
            {access.hasAccess ? (
              <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: lesson.content }} />
            ) : (
              <div className="text-center py-12">
                <Lock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Contenido Bloqueado</h3>
                <p className="text-gray-600 mb-4">
                  Inscríbete al curso para acceder a todo el contenido de esta lección.
                </p>
                <Button onClick={handleEnrollNow}>Inscribirse al Curso</Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Course Info */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Información del Curso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-1">Curso</h4>
                <p className="text-gray-600">{lesson.course.title}</p>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Instructor</h4>
                <p className="text-gray-600">{lesson.course.instructor}</p>
              </div>
            </div>
            <div className="mt-4">
              <h4 className="font-semibold mb-1">Descripción</h4>
              <p className="text-gray-600">{lesson.course.description}</p>
            </div>
          </CardContent>
        </Card>

        {/* Debug Info (only in development) */}
        {process.env.NODE_ENV === "development" && debugInfo && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-sm">Debug Information</CardTitle>
            </CardHeader>
            <CardContent>
              <details>
                <summary className="cursor-pointer text-sm font-medium">Ver información técnica</summary>
                <pre className="text-xs bg-gray-100 p-4 rounded mt-2 overflow-auto">
                  {JSON.stringify(debugInfo, null, 2)}
                </pre>
              </details>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
