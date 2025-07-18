"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ChevronLeft, ChevronRight, Clock, BookOpen, AlertCircle } from "lucide-react"
import Link from "next/link"

interface LessonData {
  lesson: {
    id: string
    title: string
    description: string
    content: string
    video_url: string | null
    duration_minutes: number
    order_index: number
    course_id: string
    courses: {
      id: string
      title: string
      description: string
      instructor: string
    }
  }
  enrollment: {
    id: string
    progress: number
  }
  navigation: {
    previous: { id: string; title: string } | null
    next: { id: string; title: string } | null
    currentIndex: number
    totalLessons: number
  }
}

export default function LessonPage() {
  const params = useParams()
  const courseId = params.courseId as string
  const lessonId = params.lessonId as string

  const [data, setData] = useState<LessonData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchLessonData = async () => {
      try {
        const response = await fetch(`/api/student/lesson?courseId=${courseId}&lessonId=${lessonId}`, {
          credentials: "include",
        })

        const result = await response.json()

        if (result.success) {
          setData(result.data)
        } else {
          if (result.error === "NO_SESSION") {
            // Redirect to login if no session
            window.location.assign("/auth/login")
            return
          }
          setError(result.message || "Error al cargar la lección")
        }
      } catch (err) {
        console.error("Lesson fetch error:", err)
        setError("Error de conexión. Por favor, recarga la página.")
      } finally {
        setLoading(false)
      }
    }

    if (courseId && lessonId) {
      fetchLessonData()
    }
  }, [courseId, lessonId])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="flex items-center space-x-2">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-48" />
          </div>

          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>No se pudieron cargar los datos de la lección.</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Link href="/dashboard" className="hover:text-foreground">
            Dashboard
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link href={`/courses/${data.lesson.course_id}`} className="hover:text-foreground">
            {data.lesson.courses.title}
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground">{data.lesson.title}</span>
        </nav>

        {/* Lesson Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{data.lesson.title}</h1>
            <p className="text-muted-foreground mt-2">{data.lesson.description}</p>
          </div>
          <Badge variant="secondary">
            Lección {data.navigation.currentIndex} de {data.navigation.totalLessons}
          </Badge>
        </div>

        {/* Video Player */}
        {data.lesson.video_url && (
          <Card>
            <CardContent className="p-0">
              <div className="aspect-video bg-black rounded-lg overflow-hidden">
                <video controls className="w-full h-full" poster="/placeholder.jpg">
                  <source src={data.lesson.video_url} type="video/mp4" />
                  Tu navegador no soporta el elemento de video.
                </video>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Lesson Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="h-5 w-5 mr-2" />
              Contenido de la Lección
            </CardTitle>
            <CardDescription className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              Duración: {data.lesson.duration_minutes} minutos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: data.lesson.content }} />
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <div>
            {data.navigation.previous ? (
              <Button variant="outline" asChild>
                <Link href={`/courses/${courseId}/lessons/${data.navigation.previous.id}`}>
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Anterior: {data.navigation.previous.title}
                </Link>
              </Button>
            ) : (
              <Button variant="outline" disabled>
                <ChevronLeft className="h-4 w-4 mr-2" />
                Lección Anterior
              </Button>
            )}
          </div>

          <Button asChild>
            <Link href={`/courses/${courseId}`}>Ver Curso Completo</Link>
          </Button>

          <div>
            {data.navigation.next ? (
              <Button asChild>
                <Link href={`/courses/${courseId}/lessons/${data.navigation.next.id}`}>
                  Siguiente: {data.navigation.next.title}
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            ) : (
              <Button disabled>
                Siguiente Lección
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
