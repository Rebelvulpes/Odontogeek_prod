"use client"

import { notFound, redirect } from "next/navigation"
import { ArrowLeft, Clock, BookOpen, Lock } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { createClient } from "@/lib/supabase"
import { cookies } from "next/headers"

interface Lesson {
  id: string
  title: string
  description: string
  video_url: string
  duration: number
  order_index: number
  is_free: boolean
  course_id: string
}

interface Course {
  id: string
  title: string
  description: string
  instructor: string
  duration: number
  level: string
  price: number
  thumbnail_url: string
}

interface User {
  id: string
  email: string
  full_name: string
  role: string
}

async function getUser(): Promise<User | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth-token")?.value

  if (!token) {
    return null
  }

  try {
    const supabase = createClient()
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token)

    if (error || !user) {
      return null
    }

    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id, email, full_name, role")
      .eq("id", user.id)
      .single()

    if (userError || !userData) {
      return null
    }

    return userData
  } catch (error) {
    console.error("Error getting user:", error)
    return null
  }
}

async function getLesson(courseId: string, lessonId: string): Promise<Lesson | null> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("lessons")
      .select("*")
      .eq("id", lessonId)
      .eq("course_id", courseId)
      .single()

    if (error) {
      console.error("Error fetching lesson:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Error fetching lesson:", error)
    return null
  }
}

async function getCourse(courseId: string): Promise<Course | null> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase.from("courses").select("*").eq("id", courseId).single()

    if (error) {
      console.error("Error fetching course:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Error fetching course:", error)
    return null
  }
}

async function hasAccess(userId: string, courseId: string): Promise<boolean> {
  try {
    const supabase = createClient()

    // Check if user is admin
    const { data: userData, error: userError } = await supabase.from("users").select("role").eq("id", userId).single()

    if (!userError && userData?.role === "admin") {
      return true
    }

    // Check if user is enrolled
    const { data, error } = await supabase
      .from("enrollments")
      .select("id")
      .eq("user_id", userId)
      .eq("course_id", courseId)
      .single()

    return !error && !!data
  } catch (error) {
    console.error("Error checking access:", error)
    return false
  }
}

export default async function LessonPage({
  params,
}: {
  params: { courseId: string; lessonId: string }
}) {
  const user = await getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const lesson = await getLesson(params.courseId, params.lessonId)
  const course = await getCourse(params.courseId)

  if (!lesson || !course) {
    notFound()
  }

  const userHasAccess = await hasAccess(user.id, params.courseId)
  const canViewLesson = userHasAccess || lesson.is_free

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Floating animated elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-20 h-20 bg-blue-200/30 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-purple-200/30 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute bottom-40 left-20 w-12 h-12 bg-indigo-200/30 rounded-full animate-pulse delay-2000"></div>
        <div className="absolute bottom-20 right-10 w-24 h-24 bg-pink-200/30 rounded-full animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Link
                href={`/courses/${params.courseId}`}
                className="flex items-center text-gray-600 hover:text-blue-600 transition-colors group"
              >
                <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                Volver al curso
              </Link>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Course Info */}
              <div className="animate-fade-in-up">
                <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                  <BookOpen className="h-4 w-4" />
                  <span>{course.title}</span>
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                  {lesson.title}
                </h1>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center text-gray-600">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>{lesson.duration} minutos</span>
                  </div>
                  <Badge
                    variant="secondary"
                    className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 border-0"
                  >
                    Lección {lesson.order_index}
                  </Badge>
                  {lesson.is_free && (
                    <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0">
                      Gratuita
                    </Badge>
                  )}
                </div>
              </div>

              {/* Video Player */}
              <div className="animate-fade-in-up delay-200">
                {canViewLesson ? (
                  <div className="w-full bg-white/80 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden">
                    <iframe
                      src={lesson.video_url}
                      title={lesson.title}
                      className="w-full h-[400px]"
                      allowFullScreen
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    />
                  </div>
                ) : (
                  <div className="w-full h-[400px] bg-white/80 backdrop-blur-sm rounded-lg shadow-lg flex items-center justify-center">
                    <div className="text-center">
                      <Lock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">Contenido no disponible</h3>
                      <p className="text-gray-500 mb-4">
                        Necesitas estar inscrito en este curso para ver esta lección.
                      </p>
                      <Link href={`/courses/${params.courseId}`}>
                        <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0">
                          Ver curso
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Lesson Content */}
              <Card className="animate-fade-in-up delay-300 bg-white/80 backdrop-blur-sm border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-xl text-gray-800">Contenido de la lección</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 leading-relaxed">
                    {lesson.description || "Esta lección no tiene descripción disponible."}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Course Info Card */}
              <Card className="animate-fade-in-up delay-400 bg-white/80 backdrop-blur-sm border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-800">Información del curso</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">{course.title}</h3>
                    <p className="text-sm text-gray-600">{course.description}</p>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Instructor:</span>
                      <span className="font-medium text-gray-800">{course.instructor}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Duración:</span>
                      <span className="font-medium text-gray-800">{course.duration} min</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Nivel:</span>
                      <span className="font-medium text-gray-800">{course.level}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Access Status */}
              {!canViewLesson && (
                <Card className="animate-fade-in-up delay-500 bg-white/80 backdrop-blur-sm border-gray-200/50 shadow-lg">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <Lock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 mb-4">Contenido no disponible</p>
                      <Link href={`/courses/${params.courseId}`}>
                        <Button
                          size="sm"
                          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0"
                        >
                          Inscribirse al curso
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
        }
        
        .delay-200 {
          animation-delay: 0.2s;
        }
        
        .delay-300 {
          animation-delay: 0.3s;
        }
        
        .delay-400 {
          animation-delay: 0.4s;
        }
        
        .delay-500 {
          animation-delay: 0.5s;
        }
        
        .delay-1000 {
          animation-delay: 1s;
        }
        
        .delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  )
}
