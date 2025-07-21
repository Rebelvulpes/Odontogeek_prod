"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft, Clock, Play, Lock, CheckCircle, AlertCircle, User, BookOpen } from "lucide-react"

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
    instructor: string
  }
}

interface AccessInfo {
  hasAccess: boolean
  reason: string
  userRole: string
}

interface LessonResponse {
  success: boolean
  lesson?: Lesson
  access?: AccessInfo
  error?: string
  debug?: any
  requiresEnrollment?: boolean
  lesson_info?: {
    title: string
    is_free: boolean
    course_title: string
  }
}

export default function LessonPage() {
  const params = useParams()
  const router = useRouter()
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [access, setAccess] = useState<AccessInfo | null>(null)
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

        const response = await fetch(`/api/student/lesson?lessonId=${lessonId}`)
        const data: LessonResponse = await response.json()

        setDebugInfo(data.debug)

        if (data.success && data.lesson && data.access) {
          setLesson(data.lesson)
          setAccess(data.access)
        } else {
          setError(data.error || "Error desconocido al cargar la lección")
        }
      } catch (err) {
        console.error("Error fetching lesson:", err)
        setError("Error de conexión al cargar la lección")
      } finally {
        setLoading(false)
      }
    }

    if (lessonId) {
      fetchLesson()
    }
  }, [lessonId])

  const handleBackToCourse = () => {
    router.push(`/courses/${courseId}`)
  }

  const handleEnrollNow = () => {
    router.push(`/courses/${courseId}/checkout`)
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-64 w-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          <Button variant="ghost" onClick={handleBackToCourse} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al curso
          </Button>

          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>

          {debugInfo && (
            <Card>
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

          <div className="flex gap-4">
            <Button onClick={handleBackToCourse}>Volver al curso</Button>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Reintentar
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!lesson || !access) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>No se pudo cargar la información de la lección</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-6">
        {/* Navigation */}
        <Button variant="ghost" onClick={handleBackToCourse} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver al curso
        </Button>

        {/* Lesson Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <BookOpen className="h-4 w-4" />
            <span>{lesson.course.title}</span>
            <span>•</span>
            <span>Lección {lesson.order_index}</span>
          </div>

          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold">{lesson.title}</h1>
              {lesson.description && (
                <p className="text-lg text-muted-foreground">{lesson.description}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {lesson.is_free ? (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <CheckCircle className="mr-1 h-3 w-3" />
                  Gratuita
                </Badge>
              ) : (
                <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                  <Lock className="mr-1 h-3 w-3" />
                  Premium
                </Badge>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{lesson.duration_minutes} minutos</span>
            </div>
            <div className="flex items-center gap-1">
              <User className="h-4 w-4" />
              <span>{lesson.course.instructor}</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Access Control */}
        {!access.hasAccess ? (
          <Alert>
            <Lock className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-3">
                <p>Esta lección requiere inscripción al curso para acceder al contenido completo.</p>
                <div className="flex gap-2">
                  <Button onClick={handleEnrollNow}>Inscribirse ahora</Button>
                  <Button variant="outline" onClick={handleBackToCourse}>
                    Ver curso completo
                  </Button>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        ) : (
          <>
            {/* Video Player Placeholder */}
            {lesson.video_url && (
              <Card>
                <CardContent className="p-0">
                  <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                    <div className="text-center space-y-2">
                      <Play className="h-12 w-12 mx-auto text-gray-400" />
                      <p className="text-sm text-gray-500">Reproductor de video</p>
                      <p className="text-xs text-gray-400">URL: {lesson.video_url}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Lesson Content */}
            <Card>
              <CardHeader>
                <CardTitle>Contenido de la Lección</CardTitle>
                <CardDescription>
                  Duración estim\
