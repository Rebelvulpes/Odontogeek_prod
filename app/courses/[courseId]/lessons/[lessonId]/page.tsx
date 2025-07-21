"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Play, Lock, Clock, BookOpen } from "lucide-react"

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
    description?: string
  }
}

interface LessonResponse {
  success: boolean
  lesson: Lesson
  hasAccess: boolean
  accessReason?: string
  message: string
  error?: string
  debug?: string
}

export default function LessonPage() {
  const params = useParams()
  const lessonId = params.lessonId as string
  const courseId = params.courseId as string

  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [hasAccess, setHasAccess] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLesson = async () => {
    try {
      console.log("🔍 Fetching lesson:", lessonId)
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/student/lesson?lessonId=${lessonId}`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      })

      console.log("📊 Response status:", response.status)
      console.log("📊 Response headers:", Object.fromEntries(response.headers.entries()))

      if (!response.ok) {
        const errorText = await response.text()
        console.log("❌ Error response text:", errorText)

        try {
          const errorData = JSON.parse(errorText)
          console.log("📊 Lesson API Response:", errorData)
          setError(errorData.error || `HTTP ${response.status}`)

          // If we have lesson data even in error response, use it
          if (errorData.lesson) {
            setLesson(errorData.lesson)
            setHasAccess(false)
          }
        } catch (parseError) {
          console.log("❌ Failed to parse error response as JSON")
          setError(`HTTP ${response.status}: ${errorText}`)
        }
        return
      }

      const data: LessonResponse = await response.json()
      console.log("📊 Lesson API Response:", data)

      if (data.success && data.lesson) {
        setLesson(data.lesson)
        setHasAccess(data.hasAccess)
        setError(null)
      } else {
        setError(data.error || "Failed to load lesson")
        if (data.lesson) {
          setLesson(data.lesson)
          setHasAccess(false)
        }
      }
    } catch (err) {
      console.error("❌ Error fetching lesson:", err)
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (lessonId) {
      fetchLesson()
    }
  }, [lessonId])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Skeleton className="h-8 w-3/4 mb-4" />
          <Skeleton className="h-4 w-1/2 mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Skeleton className="aspect-video w-full mb-6" />
              <Skeleton className="h-6 w-1/3 mb-4" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </div>
            <div>
              <Skeleton className="h-48 w-full" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error && !lesson) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Alert className="mb-6">
            <AlertDescription>Error loading lesson: {error}</AlertDescription>
          </Alert>
          <Button onClick={fetchLesson} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  if (!lesson) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Alert>
            <AlertDescription>Lesson not found</AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <BookOpen className="h-4 w-4" />
            <span>{lesson.course.title}</span>
          </div>
          <h1 className="text-3xl font-bold mb-4">{lesson.title}</h1>
          <div className="flex items-center gap-4">
            {lesson.is_free && (
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Gratis
              </Badge>
            )}
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{lesson.duration_minutes} minutos</span>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Video Player */}
            <div className="aspect-video bg-black rounded-lg mb-6 relative overflow-hidden">
              {hasAccess && lesson.video_url ? (
                <iframe
                  src={lesson.video_url}
                  title={lesson.title}
                  className="w-full h-full"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-white">
                    <Lock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg mb-2">{lesson.is_free ? "Video no disponible" : "Contenido bloqueado"}</p>
                    <p className="text-sm opacity-75">
                      {lesson.is_free
                        ? "El video para esta lección aún no está disponible"
                        : "Necesitas inscribirte al curso para ver este contenido"}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Lesson Content */}
            <Card>
              <CardHeader>
                <CardTitle>Contenido de la lección</CardTitle>
                <CardDescription>{lesson.description}</CardDescription>
              </CardHeader>
              <CardContent>
                {hasAccess && lesson.content ? (
                  <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: lesson.content }} />
                ) : (
                  <div className="text-center py-8">
                    <Lock className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground mb-4">
                      {lesson.is_free
                        ? "El contenido de esta lección estará disponible pronto"
                        : "Inscríbete al curso para acceder al contenido completo"}
                    </p>
                    {!lesson.is_free && <Button>Inscribirse al curso</Button>}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Información del curso</CardTitle>
              </CardHeader>
              <CardContent>
                <h3 className="font-semibold mb-2">{lesson.course.title}</h3>
                {lesson.course.description && (
                  <p className="text-sm text-muted-foreground mb-4">{lesson.course.description}</p>
                )}

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Lección:</span>
                    <span>{lesson.order_index}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Duración:</span>
                    <span>{lesson.duration_minutes} min</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tipo:</span>
                    <span>{lesson.is_free ? "Gratuita" : "Premium"}</span>
                  </div>
                </div>

                {!hasAccess && !lesson.is_free && (
                  <div className="mt-6">
                    <Button className="w-full">
                      <Play className="h-4 w-4 mr-2" />
                      Inscribirse al curso
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
