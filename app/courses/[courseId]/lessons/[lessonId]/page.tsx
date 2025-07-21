"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Navigation } from "@/components/navigation"
import { ArrowLeft, Play, Clock, BookOpen, Lock, AlertCircle, Loader2 } from "lucide-react"

interface Lesson {
  id: string
  title: string
  description: string
  content: string | null
  video_url: string | null
  duration_minutes: number
  order_index: number
  is_free: boolean
  course: {
    id: string
    title: string
    description: string
  }
}

interface LessonResponse {
  success: boolean
  lesson?: Lesson
  hasAccess: boolean
  accessReason: string
  message: string
  error?: string
  debug?: string
}

export default function LessonPage() {
  const params = useParams()
  const router = useRouter()
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasAccess, setHasAccess] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [debugInfo, setDebugInfo] = useState<any>(null)

  const lessonId = params.lessonId as string
  const courseId = params.courseId as string

  // Get user session
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/me", {
          credentials: "include",
        })
        if (response.ok) {
          const userData = await response.json()
          setUser(userData.user)
        }
      } catch (error) {
        console.error("Error checking auth:", error)
      }
    }
    checkAuth()
  }, [])

  const fetchLesson = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log("🔍 Fetching lesson:", lessonId)

      const response = await fetch(`/api/student/lesson?lessonId=${lessonId}`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      })

      console.log("📊 Lesson API Response status:", response.status)

      const responseText = await response.text()
      console.log("📊 Raw response:", responseText)

      let data: LessonResponse
      try {
        data = JSON.parse(responseText)
      } catch (parseError) {
        console.error("❌ Failed to parse response as JSON:", parseError)
        throw new Error(`Invalid JSON response: ${responseText}`)
      }

      console.log("📊 Parsed response:", data)
      setDebugInfo(data)

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`)
      }

      if (!data.success) {
        throw new Error(data.error || "Failed to load lesson")
      }

      if (data.lesson) {
        setLesson(data.lesson)
        setHasAccess(data.hasAccess)
      } else {
        throw new Error("No lesson data received")
      }
    } catch (err) {
      console.error("❌ Error fetching lesson:", err)
      setError(err instanceof Error ? err.message : "Failed to load lesson")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (lessonId) {
      fetchLesson()
    }
  }, [lessonId])

  const handleBackToCourse = () => {
    router.push(`/courses/${courseId}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation user={user} />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-gray-600">Cargando lección...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation user={user} />
        <div className="container mx-auto px-4 py-8">
          <Button variant="ghost" onClick={handleBackToCourse} className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al curso
          </Button>

          <Alert className="border-red-200 bg-red-50 mb-6">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>Error cargando la lección:</strong> {error}
            </AlertDescription>
          </Alert>

          {/* Debug information */}
          {debugInfo && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-sm">Información de debug</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div>
                    <strong>Lesson ID:</strong> {lessonId}
                  </div>
                  <div>
                    <strong>Course ID:</strong> {courseId}
                  </div>
                  {debugInfo.debug && (
                    <div>
                      <strong>Debug:</strong> {debugInfo.debug}
                    </div>
                  )}
                </div>
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm font-medium">Ver respuesta completa</summary>
                  <pre className="mt-2 text-xs bg-gray-100 p-4 rounded overflow-auto">
                    {JSON.stringify(debugInfo, null, 2)}
                  </pre>
                </details>
              </CardContent>
            </Card>
          )}

          <div className="text-center">
            <Button onClick={fetchLesson} variant="outline" className="mr-4 bg-transparent">
              Intentar de nuevo
            </Button>
            <Button onClick={handleBackToCourse}>Volver al curso</Button>
          </div>
        </div>
      </div>
    )
  }

  if (!lesson) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation user={user} />
        <div className="container mx-auto px-4 py-8">
          <Button variant="ghost" onClick={handleBackToCourse} className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al curso
          </Button>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>No se encontró la lección solicitada.</AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation user={user} />

      <div className="container mx-auto px-4 py-8">
        {/* Back button */}
        <Button variant="ghost" onClick={handleBackToCourse} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver al curso
        </Button>

        {/* Course info */}
        <div className="mb-6">
          <p className="text-sm text-gray-600 mb-2">
            <BookOpen className="w-4 h-4 inline mr-1" />
            {lesson.course.title}
          </p>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{lesson.title}</h1>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              {lesson.duration_minutes} minutos
            </div>
            <div className="flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              Lección {lesson.order_index}
            </div>
            {lesson.is_free && (
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Gratuita
              </Badge>
            )}
          </div>
        </div>

        {/* Access check */}
        {!hasAccess ? (
          <Alert className="mb-6 border-orange-200 bg-orange-50">
            <Lock className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <strong>Acceso restringido:</strong> Necesitas estar inscrito en este curso para acceder a esta lección.
            </AlertDescription>
          </Alert>
        ) : null}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2">
            {/* Video player */}
            {hasAccess && lesson.video_url ? (
              <div className="mb-6">
                <div
                  className="relative w-full rounded-lg overflow-hidden shadow-lg"
                  style={{ paddingBottom: "56.25%" /* 16:9 aspect ratio */ }}
                >
                  <iframe
                    src={lesson.video_url}
                    title={lesson.title}
                    className="absolute inset-0 w-full h-full rounded-lg"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    style={{
                      border: "none",
                    }}
                    frameBorder="0"
                  />
                </div>
              </div>
            ) : (
              <div className="mb-6">
                <div
                  className="relative w-full bg-gray-100 rounded-lg overflow-hidden shadow-lg flex items-center justify-center"
                  style={{ paddingBottom: "56.25%" /* 16:9 aspect ratio */ }}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                        {hasAccess ? (
                          <Play className="w-8 h-8 text-gray-400" />
                        ) : (
                          <Lock className="w-8 h-8 text-gray-400" />
                        )}
                      </div>
                      <p className="text-gray-600">
                        {hasAccess ? "Video no disponible" : "Inscríbete al curso para ver el video"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Lesson content */}
            <Card>
              <CardHeader>
                <CardTitle>Contenido de la lección</CardTitle>
                <CardDescription>{lesson.description}</CardDescription>
              </CardHeader>
              <CardContent>
                {hasAccess && lesson.content ? (
                  <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: lesson.content }} />
                ) : (
                  <div className="text-center py-8">
                    <Lock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">
                      {hasAccess ? "Contenido no disponible" : "Inscríbete al curso para acceder al contenido completo"}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Información del curso</CardTitle>
              </CardHeader>
              <CardContent>
                <h3 className="font-semibold mb-2">{lesson.course.title}</h3>
                <p className="text-sm text-gray-600 mb-4">{lesson.course.description}</p>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duración:</span>
                    <span>{lesson.duration_minutes} min</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Lección:</span>
                    <span>#{lesson.order_index}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tipo:</span>
                    <span>{lesson.is_free ? "Gratuita" : "Premium"}</span>
                  </div>
                </div>

                {!hasAccess && (
                  <div className="mt-6">
                    <Button className="w-full" onClick={() => router.push(`/courses/${courseId}`)}>
                      Ver curso completo
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Debug info for development */}
            {process.env.NODE_ENV === "development" && debugInfo && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-sm">Debug Info</CardTitle>
                </CardHeader>
                <CardContent>
                  <details>
                    <summary className="cursor-pointer text-sm">Ver detalles</summary>
                    <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
                      {JSON.stringify(debugInfo, null, 2)}
                    </pre>
                  </details>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
