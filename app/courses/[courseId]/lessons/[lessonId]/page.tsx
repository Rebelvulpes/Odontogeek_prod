"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft, Lock, Gift, Crown, BookOpen } from "lucide-react"
import Link from "next/link"

interface Lesson {
  id: string
  title: string
  description: string
  content: string
  video_url?: string
  duration?: number
  order_index: number
  is_free: boolean
  course_id: string
  courses: {
    id: string
    title: string
    price: number
  }
}

export default function LessonPage() {
  const params = useParams()
  const router = useRouter()
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [accessType, setAccessType] = useState<string>("denied")

  const lessonId = params.lessonId as string
  const courseId = params.courseId as string

  useEffect(() => {
    fetchLesson()
  }, [lessonId])

  const fetchLesson = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/student/lesson?lessonId=${lessonId}`, {
        credentials: "include",
      })

      if (!response.ok) {
        if (response.status === 401) {
          router.push("/auth/login")
          return
        }

        if (response.status === 403) {
          const errorData = await response.json()
          setError(errorData.message || "No tienes acceso a esta lección")
          return
        }

        throw new Error("Error al cargar la lección")
      }

      const data = await response.json()
      setLesson(data.lesson)
      setAccessType(data.accessType)
    } catch (err) {
      console.error("Error fetching lesson:", err)
      setError("Error al cargar la lección")
    } finally {
      setLoading(false)
    }
  }

  const getAccessBadge = () => {
    switch (accessType) {
      case "admin":
        return (
          <Badge variant="secondary" className="bg-purple-100 text-purple-800 border-purple-200">
            <Crown className="w-3 h-3 mr-1" />
            Acceso Admin
          </Badge>
        )
      case "free":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
            <Gift className="w-3 h-3 mr-1" />
            Lección Gratuita
          </Badge>
        )
      case "enrolled":
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
            <BookOpen className="w-3 h-3 mr-1" />
            Inscrito
          </Badge>
        )
      default:
        return (
          <Badge variant="destructive">
            <Lock className="w-3 h-3 mr-1" />
            Acceso Denegado
          </Badge>
        )
    }
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
          <Link href={`/courses/${courseId}`}>
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al Curso
            </Button>
          </Link>

          <Alert variant="destructive">
            <Lock className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>

          <div className="mt-6 text-center">
            <p className="text-gray-600 mb-4">Para acceder a esta lección necesitas estar inscrito en el curso.</p>
            <Link href={`/courses/${courseId}`}>
              <Button>Ver Curso e Inscribirse</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!lesson) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Alert variant="destructive">
            <AlertDescription>Lección no encontrada</AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Navegación */}
        <Link href={`/courses/${courseId}`}>
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a {lesson.courses.title}
          </Button>
        </Link>

        {/* Contenido de la lección */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-2xl mb-2">{lesson.title}</CardTitle>
                <p className="text-gray-600">{lesson.description}</p>
              </div>
              <div className="ml-4">{getAccessBadge()}</div>
            </div>

            {lesson.duration && (
              <p className="text-sm text-gray-500">Duración: {Math.floor(lesson.duration / 60)} minutos</p>
            )}
          </CardHeader>

          <CardContent>
            {/* Video Player */}
            {lesson.video_url && (
              <div className="mb-6">
                <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                  <video controls className="w-full h-full rounded-lg" poster="/placeholder.svg?height=400&width=600">
                    <source src={lesson.video_url} type="video/mp4" />
                    Tu navegador no soporta el elemento de video.
                  </video>
                </div>
              </div>
            )}

            {/* Contenido de la lección */}
            <div className="prose max-w-none">
              <div dangerouslySetInnerHTML={{ __html: lesson.content }} />
            </div>

            {/* Información adicional */}
            <div className="mt-8 pt-6 border-t">
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>Lección {lesson.order_index}</span>
                <span>Curso: {lesson.courses.title}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
