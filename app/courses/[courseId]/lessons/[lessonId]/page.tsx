"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft, Lock, Gift, Crown, UserIcon, AlertCircle, Clock, Play } from "lucide-react"
import Link from "next/link"
import { Navigation } from "@/components/navigation"

interface Lesson {
  id: string
  title: string
  description: string
  content: string
  video_url?: string
  duration_minutes?: number
  order_index: number
  is_free: boolean
  course_id: string
  courses: {
    id: string
    title: string
    description: string
    instructor: string
  }
}

interface AccessDetails {
  is_admin: boolean
  is_free: boolean
  is_enrolled: boolean
  has_access: boolean
  access_reason: string
}

interface StudentUser {
  id: string
  email: string
  first_name?: string
  last_name?: string
  role: string
}

export default function LessonPage() {
  const params = useParams()
  const router = useRouter()
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [user, setUser] = useState<StudentUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [accessType, setAccessType] = useState<string>("")
  const [accessDetails, setAccessDetails] = useState<AccessDetails | null>(null)

  const courseId = params.courseId as string
  const lessonId = params.lessonId as string

  useEffect(() => {
    // First check if user is authenticated
    checkAuthentication()
  }, [])

  useEffect(() => {
    // Only fetch lesson data if user is authenticated
    if (user) {
      fetchLessonData()
    }
  }, [user, courseId, lessonId])

  const checkAuthentication = async () => {
    try {
      console.log("Checking authentication...")
      const response = await fetch("/api/auth/me", {
        credentials: "include",
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.user) {
          console.log("User authenticated:", data.user.email)
          setUser(data.user)
        } else {
          console.log("No valid session found")
          router.push("/auth/login")
        }
      } else {
        console.log("Authentication failed, redirecting to login")
        router.push("/auth/login")
      }
    } catch (error) {
      console.error("Error checking authentication:", error)
      router.push("/auth/login")
    }
  }

  const fetchLessonData = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log("Fetching lesson data for:", { courseId, lessonId })

      const response = await fetch(`/api/student/lesson?courseId=${courseId}&lessonId=${lessonId}`, {
        credentials: "include",
      })

      const data = await response.json()
      console.log("API Response:", data)

      if (!response.ok) {
        if (response.status === 401) {
          console.log("Session expired, redirecting to login")
          router.push("/auth/login")
          return
        }

        if (data.redirect) {
          console.log("Redirecting to:", data.redirect)
          router.push(data.redirect)
          return
        }

        throw new Error(data.message || "Error al cargar la lección")
      }

      if (data.success) {
        setLesson(data.lesson)
        setAccessType(data.access_type)
        setAccessDetails(data.access_details)
        console.log("Lesson loaded successfully:", data.lesson.title)
      } else {
        throw new Error(data.message || "Error desconocido")
      }
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
          <UserIcon className="w-3 h-3 mr-1" />
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
      <div className="min-h-screen bg-gray-50">
        <Navigation user={user} />
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
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation user={user} />
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

            <div className="mt-6 flex gap-4">
              <Link href={`/courses/${courseId}`}>
                <Button variant="outline">Ver Curso</Button>
              </Link>
              <Link href="/courses">
                <Button>Explorar Cursos</Button>
              </Link>
            </div>
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
          <div className="max-w-4xl mx-auto">
            <Link href={`/courses/${courseId}`}>
              <Button variant="ghost" className="mb-6">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver a {params.courseId}
              </Button>
            </Link>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>Lección no encontrada</AlertDescription>
            </Alert>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation user={user} />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Navigation */}
          <div className="flex items-center justify-between mb-6">
            <Link href={`/courses/${courseId}`}>
              <Button variant="ghost">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver a {lesson.courses.title}
              </Button>
            </Link>
            {getAccessBadge()}
          </div>

          {/* Lesson Header */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-2xl mb-2">{lesson.title}</CardTitle>
                  <p className="text-gray-600 mb-4">{lesson.description}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>Lección {lesson.order_index}</span>
                    {lesson.duration_minutes && (
                      <>
                        <span>•</span>
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {lesson.duration_minutes} min
                        </div>
                      </>
                    )}
                    <span>•</span>
                    <span>Instructor: {lesson.courses.instructor}</span>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Video Player */}
          {lesson.video_url && (
            <Card className="mb-6">
              <CardContent className="p-0">
                <div className="aspect-video bg-black rounded-lg overflow-hidden relative">
                  <video controls className="w-full h-full" poster="/placeholder.svg?height=400&width=600&text=Video">
                    <source src={lesson.video_url} type="video/mp4" />
                    Tu navegador no soporta el elemento de video.
                  </video>
                  {!lesson.video_url && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                      <div className="text-center text-white">
                        <Play className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p className="text-lg">Video no disponible</p>
                      </div>
                    </div>
                  )}
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
              <div className="prose max-w-none">
                <div dangerouslySetInnerHTML={{ __html: lesson.content || "Contenido no disponible" }} />
              </div>

              {/* Access Information */}
              {accessDetails && (
                <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold mb-2">Información de Acceso</h4>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>Tipo: {accessType}</span>
                    <span>•</span>
                    <span>{accessDetails.access_reason}</span>
                    {accessDetails.is_free && (
                      <>
                        <span>•</span>
                        <span className="text-green-600">Lección gratuita</span>
                      </>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
