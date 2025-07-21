"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Clock,
  Download,
  Lock,
  Play,
  Pause,
  Volume2,
  Maximize,
  Settings,
  SkipBack,
  SkipForward,
} from "lucide-react"
import { Navigation } from "@/components/navigation"

interface Lesson {
  id: string
  title: string
  description: string
  content: string
  duration_minutes: number
  order_index: number
  is_free: boolean
  video_url?: string
}

interface Course {
  id: string
  title: string
  lessons: Lesson[]
}

export default function LessonPage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params.courseId as string
  const lessonId = params.lessonId as string

  const [course, setCourse] = useState<Course | null>(null)
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasAccess, setHasAccess] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/me", {
          credentials: "include",
        })

        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            setUser(data.user)
          }
        }
      } catch (error) {
        console.error("Error checking auth:", error)
      }
    }

    const getLesson = async () => {
      try {
        const response = await fetch(`/api/student/lesson?courseId=${courseId}&lessonId=${lessonId}`, {
          credentials: "include",
        })
        const data = await response.json()

        if (data.success) {
          setCourse(data.course)
          setLesson(data.lesson)
          setHasAccess(data.hasAccess)
        } else {
          setError(data.message || "Error al cargar la lección")
        }
      } catch (error) {
        console.error("Error fetching lesson:", error)
        setError("Error al cargar la lección")
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
    if (courseId && lessonId) {
      getLesson()
    }
  }, [courseId, lessonId])

  const sortedLessons = course?.lessons.sort((a, b) => a.order_index - b.order_index) || []
  const currentLessonIndex = sortedLessons.findIndex((l) => l.id === lessonId)
  const previousLesson = currentLessonIndex > 0 ? sortedLessons[currentLessonIndex - 1] : null
  const nextLesson = currentLessonIndex < sortedLessons.length - 1 ? sortedLessons[currentLessonIndex + 1] : null

  const handlePrevious = () => {
    if (previousLesson) {
      router.push(`/courses/${courseId}/lessons/${previousLesson.id}`)
    }
  }

  const handleNext = () => {
    if (nextLesson) {
      router.push(`/courses/${courseId}/lessons/${nextLesson.id}`)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation user={user} />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando lección...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !lesson || !course) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation user={user} />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-20">
            <BookOpen className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Lección no encontrada</h3>
            <p className="text-gray-600 mb-4">{error || "La lección que buscas no existe o no está disponible."}</p>
            <Link href={`/courses/${courseId}`}>
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver al Curso
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation user={user} />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-20">
            <Lock className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Acceso Restringido</h3>
            <p className="text-gray-600 mb-4">Necesitas inscribirte en el curso para acceder a esta lección.</p>
            <div className="space-x-4">
              <Link href={`/courses/${courseId}`}>
                <Button>Ver Curso</Button>
              </Link>
              <Link href="/courses">
                <Button variant="outline">Explorar Cursos</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Navigation user={user} />

      <div className="flex flex-col lg:flex-row">
        {/* Video Player */}
        <div className="lg:flex-1">
          <div className="bg-black aspect-video relative">
            {lesson.video_url ? (
              <div className="w-full h-full flex items-center justify-center">
                <video
                  className="w-full h-full"
                  controls
                  poster="/placeholder.svg?height=400&width=600&text=Video+Lesson"
                >
                  <source src={lesson.video_url} type="video/mp4" />
                  Tu navegador no soporta el elemento de video.
                </video>
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white">
                <div className="text-center">
                  <Play className="w-16 h-16 mx-auto mb-4 opacity-70" />
                  <p className="text-lg">Video no disponible</p>
                  <p className="text-sm opacity-70">El contenido estará disponible próximamente</p>
                </div>
              </div>
            )}
          </div>

          {/* Video Controls */}
          <div className="bg-gray-800 text-white p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handlePrevious}
                  disabled={!previousLesson}
                  className="text-white hover:bg-gray-700"
                >
                  <SkipBack className="w-4 h-4 mr-2" />
                  Anterior
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="text-white hover:bg-gray-700"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleNext}
                  disabled={!nextLesson}
                  className="text-white hover:bg-gray-700"
                >
                  Siguiente
                  <SkipForward className="w-4 h-4 ml-2" />
                </Button>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" className="text-white hover:bg-gray-700">
                  <Settings className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" className="text-white hover:bg-gray-700">
                  <Volume2 className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" className="text-white hover:bg-gray-700">
                  <Maximize className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <Progress value={duration > 0 ? (currentTime / duration) * 100 : 0} className="h-1" />
          </div>

          {/* Lesson Info */}
          <div className="bg-white p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <Badge variant="outline">Lección {currentLessonIndex + 1}</Badge>
                  {lesson.is_free && <Badge className="bg-green-600">Gratis</Badge>}
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{lesson.title}</h1>
                <p className="text-gray-600">{lesson.description}</p>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                <span>{lesson.duration_minutes} min</span>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Lesson Content */}
            <div className="prose max-w-none">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contenido de la Lección</h3>
              <div className="text-gray-700 leading-relaxed">
                {lesson.content ? (
                  <div dangerouslySetInnerHTML={{ __html: lesson.content }} />
                ) : (
                  <p>El contenido de esta lección estará disponible próximamente.</p>
                )}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t">
              <div>
                {previousLesson && (
                  <Button variant="outline" onClick={handlePrevious}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    {previousLesson.title}
                  </Button>
                )}
              </div>
              <div>
                {nextLesson && (
                  <Button onClick={handleNext}>
                    {nextLesson.title}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:w-80 bg-white border-l">
          <div className="p-4 border-b">
            <Link href={`/courses/${courseId}`} className="flex items-center text-blue-600 hover:text-blue-700">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {course.title}
            </Link>
          </div>

          <div className="p-4">
            <h3 className="font-semibold text-gray-900 mb-4">Contenido del Curso</h3>
            <div className="space-y-2">
              {sortedLessons.map((courseLesson, index) => {
                const isCurrentLesson = courseLesson.id === lessonId
                const canAccess = courseLesson.is_free || user?.role === "admin" || hasAccess

                return (
                  <div
                    key={courseLesson.id}
                    className={`p-3 rounded-lg border transition-colors ${
                      isCurrentLesson
                        ? "bg-blue-50 border-blue-200"
                        : canAccess
                          ? "hover:bg-gray-50 border-gray-200"
                          : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <div className="flex-shrink-0">
                          {isCurrentLesson ? (
                            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                              <Play className="w-3 h-3 text-white" />
                            </div>
                          ) : canAccess ? (
                            <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                              <span className="text-xs font-medium text-gray-600">{index + 1}</span>
                            </div>
                          ) : (
                            <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                              <Lock className="w-3 h-3 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4
                            className={`text-sm font-medium truncate ${
                              isCurrentLesson ? "text-blue-900" : canAccess ? "text-gray-900" : "text-gray-500"
                            }`}
                          >
                            {courseLesson.title}
                          </h4>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-xs text-gray-500">{courseLesson.duration_minutes} min</span>
                            {courseLesson.is_free && (
                              <Badge variant="outline" className="text-xs">
                                Gratis
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      {canAccess && !isCurrentLesson && (
                        <Link href={`/courses/${courseId}/lessons/${courseLesson.id}`}>
                          <Button size="sm" variant="ghost" className="text-xs">
                            Ver
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Course Progress */}
          <div className="p-4 border-t">
            <h4 className="font-medium text-gray-900 mb-2">Progreso del Curso</h4>
            <Progress value={((currentLessonIndex + 1) / sortedLessons.length) * 100} className="mb-2" />
            <p className="text-sm text-gray-600">
              {currentLessonIndex + 1} de {sortedLessons.length} lecciones completadas
            </p>
          </div>

          {/* Resources */}
          <div className="p-4 border-t">
            <h4 className="font-medium text-gray-900 mb-3">Recursos</h4>
            <div className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                <Download className="w-4 h-4 mr-2" />
                Descargar Materiales
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                <BookOpen className="w-4 h-4 mr-2" />
                Notas de la Lección
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
