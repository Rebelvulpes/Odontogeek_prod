"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft, Play, Lock, Gift, Crown, User, AlertCircle } from "lucide-react"
import Link from "next/link"

interface Lesson {
  id: number
  title: string
  description: string
  content: string
  video_url?: string
  duration?: number
  order_index: number
  is_free: boolean
  course_id: number
}

interface AccessDetails {
  is_admin: boolean
  is_free: boolean
  is_enrolled: boolean
  has_access: boolean
}

export default function LessonPage() {
  const params = useParams()
  const router = useRouter()
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [accessType, setAccessType] = useState<string>("")
  const [accessDetails, setAccessDetails] = useState<AccessDetails | null>(null)

  const courseId = params.courseId as string
  const lessonId = params.lessonId as string

  useEffect(() => {
    fetchLessonData()
  }, [courseId, lessonId])

  const fetchLessonData = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/student/lesson?courseId=${courseId}&lessonId=${lessonId}`, {
        credentials: "include",
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.redirect) {
          router.push(data.redirect)
          return
        }
        throw new Error(data.message || "Error al cargar la lección")
      }

      setLesson(data.lesson)
      setAccessType(data.access_type)
      setAccessDetails(data.access_details)
    } catch (error) {
      console.error("Error fetching lesson:", error)
      setError(error instanceof Error ? error.message : "Error desconocido")
    } finally {
      setLoading(false)
    }
  }

  const getAccessBadge = () => {
    if (!accessDetails) return null

    if (accessDetails.is_admin) {
      return (
        <Badge className="bg-purple-100 text-purple-800 border-purple-200">
          <Crown className="w-3 h-3 mr-1" />
          Acceso Admin
        </Badge>
      )
    }

    if (accessDetails.is_free) {
      return (
        <Badge className="bg-green-100 text-green-800 border-green-200">
          <Gift className="w-3 h-3 mr-1" />
          Lección Gratuita
        </Badge>
      )
    }

    if (accessDetails.is_enrolled) {
      return (
        <Badge className="bg-blue-100 text-blue-800 border-blue-200">
          <User className="w-3 h-3 mr-1" />
          Inscrito
        </Badge>
      )
    }

    return (
      <Badge className="bg-red-100 text-red-800 border-red-200">
        <Lock className="w-3 h-3 mr-1" />
        Acceso Denegado
      </Badge>
    )
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

          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  if (!lesson) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Link href={`/courses/${courseId}`}>
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al Curso
            </Button>
          </Link>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Lección no encontrada</AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Navigation */}
        <Link href={`/courses/${courseId}`}>
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al Curso
          </Button>
        </Link>

        {/* Lesson Content */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-2xl mb-2">{lesson.title}</CardTitle>
                <p className="text-gray-600 mb-4">{lesson.description}</p>
              </div>
              <div className="ml-4">{getAccessBadge()}</div>
            </div>

            {lesson.duration && (
              <div className="flex items-center text-sm text-gray-500">
                <Play className="w-4 h-4 mr-1" />
                {Math.floor(lesson.duration / 60)} min
              </div>
            )}
          </CardHeader>

          <CardContent>
            {/* Video Player */}
            {lesson.video_url && (
              <div className="mb-6">
                <div className="aspect-video bg-black rounded-lg overflow-hidden">
                  <video controls className="w-full h-full" poster="/placeholder.svg?height=400&width=600&text=Video">
                    <source src={lesson.video_url} type="video/mp4" />
                    Tu navegador no soporta el elemento de video.
                  </video>
                </div>
              </div>
            )}

            {/* Lesson Content */}
            <div className="prose max-w-none">
              <div dangerouslySetInnerHTML={{ __html: lesson.content }} />
            </div>

            {/* Access Information */}
            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold mb-2">Información de Acceso</h4>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span>Tipo de acceso: {accessType}</span>
                {accessDetails?.is_free && <span>• Lección gratuita</span>}
                {accessDetails?.is_admin && <span>• Acceso de administrador</span>}
                {accessDetails?.is_enrolled && <span>• Inscrito al curso</span>}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
