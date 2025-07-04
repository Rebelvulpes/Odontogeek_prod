import { createClient } from "@supabase/supabase-js"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BookOpen, Clock, Users, Star, Play } from "lucide-react"
import Link from "next/link"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

async function getCourses() {
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  const { data: courses, error } = await supabase
    .from("courses")
    .select(`
      *,
      lessons:lessons(
        id,
        title,
        duration_minutes,
        is_free
      ),
      tags:course_tag_relations(
        course_tags(
          id,
          name,
          color
        )
      )
    `)
    .eq("status", "published")
    .eq("archived", false)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching courses:", error)
    return []
  }

  return courses.map((course) => ({
    ...course,
    tags: course.tags?.map((relation: any) => relation.course_tags).filter(Boolean) || [],
    lessonsCount: course.lessons?.length || 0,
    freeLessonsCount: course.lessons?.filter((lesson: any) => lesson.is_free).length || 0,
    totalDuration:
      course.lessons?.reduce((total: number, lesson: any) => total + (lesson.duration_minutes || 0), 0) || 0,
  }))
}

export default async function CoursesPage() {
  const courses = await getCourses()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">Cursos de Odontología</h1>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              Descubre nuestra colección de cursos especializados diseñados por expertos para impulsar tu carrera
              profesional
            </p>
          </div>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {courses.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No hay cursos disponibles</h3>
            <p className="text-gray-600">Los cursos estarán disponibles próximamente.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course) => (
              <Card key={course.id} className="group hover:shadow-xl transition-all duration-500 overflow-hidden">
                <div className="relative">
                  {/* Course Image */}
                  <div className="aspect-square bg-gradient-to-br from-blue-50 to-indigo-50 relative overflow-hidden">
                    {course.thumbnail_url ? (
                      <img
                        src={course.thumbnail_url || "/placeholder.svg"}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          console.error("Error loading course image:", course.thumbnail_url)
                          e.currentTarget.src = "/placeholder.svg?height=400&width=400&text=Curso+Dental"
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="w-16 h-16 text-blue-400" />
                      </div>
                    )}

                    {/* Price Badge */}
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-white/90 text-gray-900 font-semibold px-3 py-1">${course.price}</Badge>
                    </div>

                    {/* Free Lessons Badge */}
                    {course.freeLessonsCount > 0 && (
                      <div className="absolute top-4 left-4">
                        <Badge variant="secondary" className="bg-green-100 text-green-800 font-medium">
                          <Play className="w-3 h-3 mr-1" />
                          {course.freeLessonsCount} gratis
                        </Badge>
                      </div>
                    )}

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <Button asChild className="bg-white text-gray-900 hover:bg-gray-100">
                        <Link href={`/courses/${course.id}`}>Ver Curso</Link>
                      </Button>
                    </div>
                  </div>

                  <CardContent className="p-6">
                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {course.tags.slice(0, 3).map((tag) => (
                        <Badge
                          key={tag.id}
                          variant="secondary"
                          className="text-xs"
                          style={{
                            backgroundColor: tag.color + "20",
                            color: tag.color,
                            borderColor: tag.color + "40",
                          }}
                        >
                          {tag.name}
                        </Badge>
                      ))}
                      {course.tags.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{course.tags.length - 3}
                        </Badge>
                      )}
                    </div>

                    {/* Course Title */}
                    <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {course.title}
                    </h3>

                    {/* Course Description */}
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">{course.description}</p>

                    {/* Instructor */}
                    <div className="flex items-center mb-4">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-blue-600 font-semibold text-sm">
                          {course.instructor_name?.charAt(0) || "?"}
                        </span>
                      </div>
                      <span className="text-sm text-gray-700 font-medium">
                        {course.instructor_name || "Instructor"}
                      </span>
                    </div>

                    {/* Course Stats */}
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <BookOpen className="w-4 h-4 mr-1" />
                          <span>{course.lessonsCount} lecciones</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          <span>
                            {Math.floor(course.totalDuration / 60)}h {course.totalDuration % 60}m
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(4.5) ? "text-yellow-400 fill-current" : "text-gray-300"
                            }`}
                          />
                        ))}
                        <span className="text-sm text-gray-600 ml-2">4.5 (127)</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Users className="w-4 h-4 mr-1" />
                        <span>{Math.floor(Math.random() * 500) + 100} estudiantes</span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <Button asChild className="w-full mt-4" size="lg">
                      <Link href={`/courses/${course.id}`}>Ver Detalles del Curso</Link>
                    </Button>
                  </CardContent>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
