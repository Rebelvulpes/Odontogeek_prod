"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Play, Clock, BookOpen, AlertCircle } from "lucide-react"

interface Lesson {
  id: string
  title: string
  content: string
  video_url?: string
  duration?: number
  order_index: number
  course_id: string
  status: string
  archived: boolean
  created_at: string
  updated_at: string
}

interface Course {
  id: string
  title: string
  is_free: boolean
}

interface LessonData {
  lesson: Lesson
  course: Course
}

export default function LessonPage() {
  const params = useParams()
  const router = useRouter()
  const [lessonData, setLessonData] = useState<LessonData | null>(null)
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

        // Get user ID from localStorage or session
        const userId = localStorage.getItem("userId") || "anonymous"

        console.log("🔍 Fetching lesson:", { courseId, lessonId, userId })

        const response = await fetch(`/api/student/lesson?lessonId=${lessonId}&userId=${userId}`)

        console.log("📡 Response status:", response.status)
        console.log("📡 Response headers:", Object.fromEntries(response.headers.entries()))

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
          console.log("❌ Error response:", errorData)
          setDebugInfo(errorData)
          throw new Error(errorData.error || `HTTP ${response.status}`)
        }

        const data = await response.json()
        console.log("✅ Lesson data received:", data)

        setLessonData(data)
        setDebugInfo(data)
      } catch (err) {
        console.error("❌ Error fetching lesson:", err)
        setError(err instanceof Error ? err.message : "Failed to load lesson")
      } finally {
        setLoading(false)
      }
    }

    if (lessonId) {
      fetchLesson()
    }
  }, [lessonId, courseId])

  const handleGoBack = () => {
    router.push(`/courses/${courseId}`)
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Skeleton className="h-10 w-32 mb-4" />
          <Skeleton className="h-8 w-96 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full mb-4" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={handleGoBack} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver al curso
        </Button>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Error loading lesson:</strong> {error}
          </AlertDescription>
        </Alert>

        {debugInfo && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-sm">Debug Information</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto">{JSON.stringify(debugInfo, null, 2)}</pre>
            </CardContent>
          </Card>
        )}

        <div className="mt-6 text-center">
          <p className="text-gray-600 mb-4">
            Lesson ID: <code className="bg-gray-100 px-2 py-1 rounded">{lessonId}</code>
          </p>
          <p className="text-gray-600 mb-4">
            Course ID: <code className="bg-gray-100 px-2 py-1 rounded">{courseId}</code>
          </p>
          <Button onClick={handleGoBack}>Return to Course</Button>
        </div>
      </div>
    )
  }

  if (!lessonData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={handleGoBack} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver al curso
        </Button>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>No lesson data available.</AlertDescription>
        </Alert>
      </div>
    )
  }

  const { lesson, course } = lessonData

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <Button variant="ghost" onClick={handleGoBack} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a {course.title}
        </Button>

        <div className="flex items-center gap-2 mb-2">
          <Badge variant={course.is_free ? "secondary" : "default"}>{course.is_free ? "Gratis" : "Premium"}</Badge>
          <Badge variant="outline">Lección {lesson.order_index}</Badge>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">{lesson.title}</h1>

        <div className="flex items-center gap-4 text-sm text-gray-600">
          {lesson.duration && (
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {lesson.duration} min
            </div>
          )}
          <div className="flex items-center gap-1">
            <BookOpen className="h-4 w-4" />
            {course.title}
          </div>
        </div>
      </div>

      {/* Video Player */}
      {lesson.video_url && (
        <Card className="mb-6">
          <CardContent className="p-0">
            <div className="aspect-video bg-black rounded-lg overflow-hidden">
              <video controls className="w-full h-full" poster="/placeholder.jpg">
                <source src={lesson.video_url} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lesson Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Contenido de la lección
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: lesson.content }} />
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="mt-8 flex justify-between">
        <Button variant="outline" onClick={handleGoBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver al curso
        </Button>

        <div className="flex gap-2">
          <Button variant="outline">Lección anterior</Button>
          <Button>Siguiente lección</Button>
        </div>
      </div>

      {/* Debug info in development */}
      {process.env.NODE_ENV === "development" && debugInfo && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-sm">Debug Information</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto">{JSON.stringify(debugInfo, null, 2)}</pre>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
