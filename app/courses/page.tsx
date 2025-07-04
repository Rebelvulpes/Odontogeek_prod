import { Suspense } from "react"
import { createClient } from "@supabase/supabase-js"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BookOpen, Clock, Users, Star, Play, ChevronRight } from "lucide-react"
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
        is_free,
        duration_minutes
      ),
      tags:course_tag_relations(
        course_tags(
          id,
          name,
          slug,
          color,
          description
        )
      )
    `)
    .eq("status", "published")
    .eq("archived", false)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error obteniendo cursos:", error)
    return []
  }

  // Transformar los datos para que tengan la estructura correcta
  return courses.map((course) => ({
    ...course,
    tags: course.tags?.map((relation: any) => relation.course_tags).filter(Boolean) || [],
    lessonsCount: course.lessons?.length || 0,
    freeLessonsCount: course.lessons?.filter((lesson: any) => lesson.is_free).length || 0,
    totalDuration: course.lessons?.reduce((acc: number, lesson: any) => acc + (lesson.duration_minutes || 0), 0) || 0,
    students: Math.floor(Math.random() * 500) + 50, // Placeholder
    rating: (Math.random() * 2 + 3).toFixed(1), // Rating entre 3.0 y 5.0
  }))
}

function CourseCard({ course }: { course: any }) {
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  return (
    <Card className="group hover:shadow-xl transition-all duration-500 border-0 bg-white overflow-hidden">
      <div className="relative">
        {/* Imagen del curso */}
        <div className="aspect-square bg-gradient-to-br from-blue-50 to-indigo-50 relative overflow-hidden">
          {course.thumbnail_url ? (
            <img
              src={course.thumbnail_url || "/placeholder.svg"}
              alt={course.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={(e) => {
                console.error("Error cargando imagen del curso:", course.thumbnail_url)
                e.currentTarget.src = "/placeholder.svg?height=400&width=400&text=Curso+Dental"
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <BookOpen className="w-16 h-16 text-blue-400" />
            </div>
          )}

          {/* Overlay con información adicional */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="absolute bottom-4 left-4 right-4">
              <div className="flex items-center justify-between text-white text-sm">
                <div className="flex items-center space-x-2">
                  <Play className="w-4 h-4" />
                  <span>{course.lessonsCount} lecciones</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span>{course.rating}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Badge de precio */}
          <div className="absolute top-4 right-4">
            <Badge className="bg-green-600 hover:bg-green-700 text-white font-semibold px-3 py-1">
              ${course.price}
            </Badge>
          </div>

          {/* Badge de lecciones gratis */}
          {course.freeLessonsCount > 0 && (
            <div className="absolute top-4 left-4">
              <Badge variant="secondary" className="bg-blue-100 text-blue-700 font-medium">
                {course.freeLessonsCount} gratis
              </Badge>
            </div>
          )}
        </div>

        <CardContent className="p-6">
          {/* Etiquetas */}
          <div className="flex flex-wrap gap-2 mb-3">
            {course.tags?.slice(0, 3).map((tag: any) => (
              <Badge
                key={tag.id}
                variant="secondary"
                className="text-xs font-medium"
                style={{
                  backgroundColor: tag.color + "20",
                  color: tag.color,
                  borderColor: tag.color + "40",
                }}
              >
                {tag.name}
              </Badge>
            ))}
            {course.tags?.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{course.tags.length - 3}
              </Badge>
            )}
          </div>

          {/* Título y descripción */}
          <h3 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {course.title}
          </h3>
          <p className="text-gray-600 text-sm mb-4 line-clamp-3">{course.description}</p>

          {/* Instructor */}
          <p className="text-sm text-gray-500 mb-4">
            Por <span className="font-medium text-gray-700">{course.instructor}</span>
          </p>

          {/* Estadísticas */}
          <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>{course.duration_hours || Math.ceil(course.totalDuration / 60)}h</span>
              </div>
              <div className="flex items-center space-x-1">
                <Users className="w-4 h-4" />
                <span>{course.students}</span>
              </div>
              <div className="flex items-center space-x-1">
                <BookOpen className="w-4 h-4" />
                <span>{course.lessonsCount}</span>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">{course.rating}</span>
            </div>
          </div>

          {/* Botón de acción */}
          <Link href={`/courses/${course.id}`}>
            <Button className="w-full group/btn bg-blue-600 hover:bg-blue-700 text-white">
              <span>Ver Curso</span>
              <ChevronRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </CardContent>
      </div>
    </Card>
  )
}

function CoursesLoading() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {[...Array(6)].map((_, i) => (
        <Card key={i} className="overflow-hidden">
          <div className="aspect-square bg-gray-200 animate-pulse" />
          <CardContent className="p-6">
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
              <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default async function CoursesPage() {
  const courses = await getCourses()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Cursos de Odontología</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Descubre nuestra colección de cursos especializados diseñados por expertos para llevar tu práctica dental
              al siguiente nivel
            </p>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Filtros y estadísticas */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
          <div className="mb-4 sm:mb-0">
            <p className="text-gray-600">
              <span className="font-semibold text-gray-900">{courses.length}</span> cursos disponibles
            </p>
          </div>

          {/* Aquí se pueden agregar filtros en el futuro */}
          <div className="flex items-center space-x-4">
            <Badge variant="outline" className="text-sm">
              Todos los cursos
            </Badge>
          </div>
        </div>

        {/* Grid de cursos */}
        <Suspense fallback={<CoursesLoading />}>
          {courses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {courses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No hay cursos disponibles</h3>
              <p className="text-gray-600">Los cursos se mostrarán aquí una vez que sean publicados.</p>
            </div>
          )}
        </Suspense>
      </div>
    </div>
  )
}
