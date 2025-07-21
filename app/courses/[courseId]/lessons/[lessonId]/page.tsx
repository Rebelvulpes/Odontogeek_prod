import { createClient } from "@supabase/supabase-js"
import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Play, Clock, CheckCircle, User } from "lucide-react"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

async function getLesson(courseId: string, lessonId: string) {
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  const { data: lesson, error } = await supabase
    .from("lessons")
    .select(`
      *,
      courses:courses(
        id,
        title,
        instructor,
        price
      )
    `)
    .eq("id", lessonId)
    .eq("course_id", courseId)
    .single()

  if (error || !lesson) {
    return null
  }

  return lesson
}

async function getUserFromCookie(cookieHeader: string | null) {
  if (!cookieHeader) return null

  try {
    const cookies = cookieHeader.split(";").reduce(
      (acc, cookie) => {
        const [key, value] = cookie.trim().split("=")
        if (key && value) {
          acc[key] = decodeURIComponent(value)
        }
        return acc
      },
      {} as Record<string, string>,
    )

    const sessionCookie = cookies["user-session"]
    if (!sessionCookie) return null

    const userSession = JSON.parse(sessionCookie)

    // Validate session structure
    if (!userSession.id || !userSession.email) {
      return null
    }

    return userSession
  } catch (error) {
    console.error("Error parsing session cookie:", error)
    return null
  }
}

async function checkLessonAccess(
  userId: string,
  userRole: string,
  courseId: string,
  lessonId: string,
  isFreLesson: boolean,
) {
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  // Admin users have access to ALL lessons
  if (userRole === "admin") {
    return { hasAccess: true, reason: "admin_access" }
  }

  // Free lessons are accessible to ALL logged-in users
  if (isFreLesson) {
    return { hasAccess: true, reason: "free_lesson" }
  }

  // For paid lessons, check enrollment
  const { data: enrollment, error } = await supabase
    .from("enrollments")
    .select("id, status")
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .single()

  if (enrollment && !error && enrollment.status === "active") {
    return { hasAccess: true, reason: "enrolled" }
  }

  return { hasAccess: false, reason: "not_enrolled" }
}

export default async function LessonPage({
  params,
}: {
  params: { courseId: string; lessonId: string }
}) {
  const lesson = await getLesson(params.courseId, params.lessonId)

  if (!lesson) {
    notFound()
  }

  // Get user from cookie
  const { headers } = await import("next/headers")
  const cookieHeader = (await headers()).get("cookie")
  const user = await getUserFromCookie(cookieHeader)

  // Check if user is logged in
  if (!user) {
    // If it's a free lesson, redirect to login with return URL
    if (lesson.is_free) {
      redirect(`/auth/login?returnUrl=/courses/${params.courseId}/lessons/${params.lessonId}`)
    } else {
      // For paid lessons, redirect to course page
      redirect(`/courses/${params.courseId}`)
    }
  }

  // Check lesson access
  const accessCheck = await checkLessonAccess(user.id, user.role, params.courseId, params.lessonId, lesson.is_free)

  if (!accessCheck.hasAccess) {
    // Redirect to course page if no access
    redirect(`/courses/${params.courseId}`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2">
                <img src="/images/odontogeek-logo-new.png" alt="OdontoGeek" className="h-8 w-auto" />
              </Link>
              <div className="hidden md:block text-sm text-gray-600">
                <Link href={`/courses/${params.courseId}`} className="hover:text-blue-600">
                  {lesson.courses.title}
                </Link>
                <span className="mx-2">•</span>
                <span>{lesson.title}</span>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {user.role === "admin" ? (
                <Link href="/admin">
                  <Button variant="ghost" size="sm">
                    Panel Admin
                  </Button>
                </Link>
              ) : (
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm">
                    Mi Dashboard
                  </Button>
                </Link>
              )}
              <div className="flex items-center space-x-2 text-sm">
                <User className="w-4 h-4" />
                <span>{user.first_name || user.email}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <div className="mb-6">
            <Link href={`/courses/${params.courseId}`}>
              <Button variant="ghost" className="flex items-center">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver al Curso
              </Button>
            </Link>
          </div>

          {/* Lesson Header */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <Badge
                      variant={lesson.is_free ? "secondary" : "default"}
                      className={lesson.is_free ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"}
                    >
                      {lesson.is_free ? "Lección Gratuita" : "Lección Premium"}
                    </Badge>
                    {accessCheck.reason === "admin_access" && (
                      <Badge variant="outline" className="bg-purple-100 text-purple-800">
                        Acceso Admin
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-2xl mb-2">{lesson.title}</CardTitle>
                  <CardDescription className="text-base">{lesson.description}</CardDescription>
                </div>
                <div className="text-right">
                  <div className="flex items-center text-sm text-gray-600 mb-1">
                    <Clock className="w-4 h-4 mr-1" />
                    {lesson.duration_minutes} minutos
                  </div>
                  <div className="text-sm text-gray-600">Lección {lesson.order_index}</div>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Video Player */}
          <Card className="mb-6">
            <CardContent className="p-0">
              <div className="aspect-video bg-black rounded-lg overflow-hidden">
                {lesson.video_url ? (
                  <video controls className="w-full h-full" poster="/placeholder.svg?height=400&width=600">
                    <source src={lesson.video_url} type="video/mp4" />
                    Tu navegador no soporta el elemento de video.
                  </video>
                ) : (
                  <div className="flex items-center justify-center h-full text-white">
                    <div className="text-center">
                      <Play className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg">Video no disponible</p>
                      <p className="text-sm opacity-75">El contenido se agregará pronto</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Course Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                Información del Curso
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">Curso</h3>
                  <p className="text-gray-600">{lesson.courses.title}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">Instructor</h3>
                  <p className="text-gray-600">{lesson.courses.instructor}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">Tipo de Acceso</h3>
                  <p className="text-gray-600">
                    {accessCheck.reason === "admin_access" && "Acceso de Administrador"}
                    {accessCheck.reason === "free_lesson" && "Lección Gratuita"}
                    {accessCheck.reason === "enrolled" && "Curso Inscrito"}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">Estado</h3>
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-600 mr-1" />
                    <span className="text-green-600">Acceso Concedido</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">¿Te gusta este contenido?</h3>
                    <p className="text-sm text-gray-600">
                      {lesson.is_free
                        ? "Inscríbete al curso completo para acceder a todas las lecciones"
                        : "Continúa aprendiendo con el resto del curso"}
                    </p>
                  </div>
                  <Link href={`/courses/${params.courseId}`}>
                    <Button>{lesson.is_free ? "Ver Curso Completo" : "Continuar Curso"}</Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
