"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft, Play, Lock, Crown, Gift } from "lucide-react"
import Link from "next/link"

interface Lesson {
  id: string
  title: string
  description: string
  content: string
  video_url?: string
  duration?: number
  is_free: boolean
  order_index: number
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
  const [accessType, setAccessType] = useState<string>("")

  const courseId = params.courseId as string
  const lessonId = params.lessonId as string

  useEffect(() => {
    fetchLesson()
  }, [courseId, lessonId])

  const fetchLesson = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/student/lesson?lessonId=${lessonId}&courseId=${courseId}`, {
        credentials: "include",
      })

      if (!response.ok) {
        const errorData = await response.json()

        if (response.status === 401) {
          router.push("/auth/login")
          return
        }

        if (response.status === 403) {
          if (errorData.isFreeLessonRequiresLogin) {
            router.push("/auth/login")
            return
          }
          setError(errorData.error || "No tienes acceso a esta lección")
          return
        }

        throw new Error(errorData.error || "Error al cargar la lección")
      }

      const data = await response.json()
      setLesson(data.lesson)
      setAccessType(data.accessType)
    } catch (err) {
      console.error("Error fetching lesson:", err)
      setError(err instanceof Error ? err.message : "Error al cargar la lección")
    } finally {
      setLoading(false)
    }
  }

  const getAccessBadge = () => {
    switch (accessType) {
      case "admin":
        return (
          <Badge variant="secondary" className="bg-purple-100 text-purple-800">
            <Crown className="w-3 h-3 mr-1" />
            Acceso Admin
          </Badge>
        )
      case "free":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            <Gift className="w-3 h-3 mr-1" />
            Lección Gratuita
          </Badge>
        )
      case "enrolled":
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            <Play className="w-3 h-3 mr-1" />
            Inscrito
          </Badge>
        )
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Skeleton className="h-8 w-64 mb-4" />
          <Skeleton className="h-64 w-full mb-6" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Alert className="mb-6">
            <Lock className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>

          <div className="flex gap-4">
            <Link href={`/courses/${courseId}`}>
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver al Curso
              </Button>
            </Link>

            <Link href="/courses">
              <Button>Ver Todos los Cursos</Button>
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
          <Alert>
            <AlertDescription>Lección no encontrada</AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link href={`/courses/${courseId}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al Curso
            </Button>
          </Link>

          {getAccessBadge()}
        </div>

        {/* Course Info */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">{lesson.title}</h1>
          <p className="text-gray-600">
            Curso:{" "}
            <Link href={`/courses/${courseId}`} className="text-blue-600 hover:underline">
              {lesson.courses.title}
            </Link>
          </p>
        </div>

        {/* Video Player */}
        {lesson.video_url && (
          <Card className="mb-6">
            <CardContent className="p-0">
              <div className="aspect-video bg-black rounded-lg overflow-hidden">
                <video controls className="w-full h-full" poster="/placeholder.svg?height=400&width=600">
                  <source src={lesson.video_url} type="video/mp4" />
                  Tu navegador no soporta el elemento de video.
                </video>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Lesson Content */}
        <Card>
          <CardHeader>
            <CardTitle>Contenido de la Lección</CardTitle>
            {lesson.description && <p className="text-gray-600">{lesson.description}</p>}
          </CardHeader>
          <CardContent>
            <div
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: lesson.content || "Contenido no disponible" }}
            />
          </CardContent>
        </Card>

        {/* Lesson Info */}
        <div className="mt-6 flex flex-wrap gap-4 text-sm text-gray-600">
          {lesson.duration && <span>Duración: {Math.floor(lesson.duration / 60)} minutos</span>}
          <span>Lección #{lesson.order_index}</span>
          {lesson.is_free && (
            <Badge variant="outline" className="text-green-600 border-green-600">
              <Gift className="w-3 h-3 mr-1" />
              Gratuita
            </Badge>
          )}
        </div>
      </div>
    </div>
  )
}
