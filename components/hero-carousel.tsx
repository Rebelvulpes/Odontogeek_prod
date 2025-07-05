"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, Play, Clock, Users, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

interface Course {
  id: string
  title: string
  description: string
  price: number
  instructor_name: string
  thumbnail_url: string
  duration_hours: number
  students_count: number
  tags: Array<{
    id: string
    name: string
    color: string
  }>
  lessons: Array<{
    id: string
    title: string
    duration_minutes: number
    is_free: boolean
  }>
}

const featuredCourses = [
  {
    id: "1",
    title: "Implantología Avanzada: Técnicas Quirúrgicas Modernas",
    description:
      "Domina las técnicas más avanzadas en implantología dental con casos clínicos reales y protocolos actualizados. Aprende desde la planificación hasta la rehabilitación final.",
    price: 299,
    instructor_name: "Dr. Carlos Mendoza",
    thumbnail_url:
      "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=1080&h=1080&q=80",
    duration_hours: 12,
    students_count: 1247,
    tags: [
      { id: "1", name: "Cirugía", color: "#EF4444" },
      { id: "2", name: "Implantes", color: "#3B82F6" },
    ],
    lessons: [
      { id: "1", title: "Fundamentos de Implantología", duration_minutes: 45, is_free: true },
      { id: "2", title: "Planificación Digital", duration_minutes: 60, is_free: false },
    ],
  },
  {
    id: "2",
    title: "Endodoncia Clínica: Casos Complejos y Soluciones",
    description:
      "Perfecciona tus habilidades en endodoncia con técnicas avanzadas para casos complejos. Incluye instrumentación rotatoria y obturación tridimensional.",
    price: 249,
    instructor_name: "Dra. Ana Patricia Ruiz",
    thumbnail_url:
      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1080&h=1080&q=80",
    duration_hours: 10,
    students_count: 892,
    tags: [
      { id: "3", name: "Endodoncia", color: "#10B981" },
      { id: "4", name: "Clínica", color: "#F59E0B" },
    ],
    lessons: [
      { id: "3", title: "Diagnóstico Endodóntico", duration_minutes: 40, is_free: true },
      { id: "4", title: "Instrumentación Avanzada", duration_minutes: 55, is_free: false },
    ],
  },
  {
    id: "3",
    title: "Ortodoncia Digital: Planificación y Tratamiento",
    description:
      "Aprende las últimas tecnologías en ortodoncia digital, desde el escaneo intraoral hasta la planificación de movimientos dentarios con software especializado.",
    price: 349,
    instructor_name: "Dr. Miguel Ángel Torres",
    thumbnail_url:
      "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?ixlib=rb-4.0.3&auto=format&fit=crop&w=1080&h=1080&q=80",
    duration_hours: 15,
    students_count: 634,
    tags: [
      { id: "5", name: "Ortodoncia", color: "#8B5CF6" },
      { id: "6", name: "Digital", color: "#06B6D4" },
    ],
    lessons: [
      { id: "5", title: "Introducción a la Ortodoncia Digital", duration_minutes: 50, is_free: true },
      { id: "6", title: "Software de Planificación", duration_minutes: 65, is_free: false },
    ],
  },
  {
    id: "4",
    title: "Periodoncia Regenerativa: Técnicas Avanzadas",
    description:
      "Domina las técnicas de regeneración periodontal con biomateriales modernos. Aprende sobre injertos óseos, membranas y factores de crecimiento.",
    price: 279,
    instructor_name: "Dr. Roberto Silva",
    thumbnail_url:
      "https://images.unsplash.com/photo-1551601651-2a8555f1a136?ixlib=rb-4.0.3&auto=format&fit=crop&w=1080&h=1080&q=80",
    duration_hours: 11,
    students_count: 456,
    tags: [
      { id: "7", name: "Periodoncia", color: "#EC4899" },
      { id: "8", name: "Regeneración", color: "#84CC16" },
    ],
    lessons: [
      { id: "7", title: "Fundamentos de Periodoncia", duration_minutes: 42, is_free: true },
      { id: "8", title: "Biomateriales en Periodoncia", duration_minutes: 58, is_free: false },
    ],
  },
  {
    id: "5",
    title: "Odontología Estética: Carillas y Coronas",
    description:
      "Perfecciona tus habilidades en odontología estética con técnicas modernas para carillas de porcelana y coronas libres de metal.",
    price: 329,
    instructor_name: "Dra. Isabella Morales",
    thumbnail_url:
      "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1080&h=1080&q=80",
    duration_hours: 13,
    students_count: 789,
    tags: [
      { id: "9", name: "Estética", color: "#F97316" },
      { id: "10", name: "Prótesis", color: "#6366F1" },
    ],
    lessons: [
      { id: "9", title: "Principios de Estética Dental", duration_minutes: 48, is_free: true },
      { id: "10", title: "Técnicas de Preparación", duration_minutes: 62, is_free: false },
    ],
  },
]

export function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [courses, setCourses] = useState<Course[]>(featuredCourses)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % courses.length)
    }, 8000)

    return () => clearInterval(timer)
  }, [courses.length])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % courses.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + courses.length) % courses.length)
  }

  const currentCourse = courses[currentSlide]

  return (
    <div className="relative w-full h-[600px] lg:h-[700px] overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width%3D%2260%22 height%3D%2260%22 viewBox%3D%220 0 60 60%22 xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg fill%3D%22none%22 fillRule%3D%22evenodd%22%3E%3Cg fill%3D%22%23ffffff%22 fillOpacity%3D%220.1%22%3E%3Ccircle cx%3D%2230%22 cy%3D%2230%22 r%3D%222%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')]"></div>
      </div>

      <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center w-full">
            {/* Content */}
            <div className="text-white space-y-6 lg:space-y-8">
              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {currentCourse.tags.slice(0, 2).map((tag) => (
                  <Badge
                    key={tag.id}
                    variant="secondary"
                    className="text-xs font-medium px-3 py-1.5"
                    style={{
                      backgroundColor: tag.color + "20",
                      color: tag.color,
                      borderColor: tag.color + "40",
                    }}
                  >
                    {tag.name}
                  </Badge>
                ))}
              </div>

              {/* Title */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">{currentCourse.title}</h1>

              {/* Description */}
              <p className="text-lg sm:text-xl text-blue-100 leading-relaxed max-w-2xl">{currentCourse.description}</p>

              {/* Course Stats */}
              <div className="flex flex-wrap items-center gap-6 text-blue-200">
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5" />
                  <span className="font-medium">{currentCourse.duration_hours}h de contenido</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span className="font-medium">{currentCourse.students_count.toLocaleString()} estudiantes</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <span className="font-medium">4.8 (324 reseñas)</span>
                </div>
              </div>

              {/* Instructor */}
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-white">{currentCourse.instructor_name}</p>
                  <p className="text-sm text-blue-200">Especialista en Odontología</p>
                </div>
              </div>

              {/* Price and CTA */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="text-3xl font-bold text-white">
                  ${currentCourse.price}
                  <span className="text-lg text-blue-200 ml-2">USD</span>
                </div>
                <div className="flex gap-3">
                  <Button asChild size="lg" className="bg-white text-blue-900 hover:bg-blue-50 font-semibold px-8">
                    <Link href={`/courses/${currentCourse.id}`}>
                      <Play className="w-5 h-5 mr-2" />
                      Ver Curso
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="border-white text-white hover:bg-white hover:text-blue-900 font-semibold px-6 bg-transparent"
                  >
                    <Link href="/courses">Explorar Más</Link>
                  </Button>
                </div>
              </div>
            </div>

            {/* Course Image */}
            <div className="relative">
              <div className="w-80 h-80 xl:w-96 xl:h-96 mx-auto relative">
                {/* Main course image */}
                <div className="w-full h-full rounded-2xl overflow-hidden shadow-2xl bg-white/10 backdrop-blur-sm border border-white/20">
                  <img
                    src={currentCourse.thumbnail_url || "/placeholder.svg"}
                    alt={currentCourse.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = "/placeholder.svg?height=400&width=400&text=Curso+de+Odontología"
                    }}
                  />

                  {/* Overlay with play button */}
                  <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg">
                      <Play className="w-8 h-8 text-blue-600 ml-1" />
                    </div>
                  </div>
                </div>

                {/* Floating stats card */}
                <div className="absolute -bottom-6 -right-6 bg-white rounded-xl shadow-xl p-4 border">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <Play className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{currentCourse.lessons.length} Lecciones</p>
                      <p className="text-xs text-gray-500">
                        {currentCourse.lessons.filter((l) => l.is_free).length} gratuitas
                      </p>
                    </div>
                  </div>
                </div>

                {/* Floating price badge */}
                <div className="absolute -top-4 -left-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full px-4 py-2 shadow-lg">
                  <span className="text-sm font-bold">${currentCourse.price}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors duration-200"
        aria-label="Curso anterior"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors duration-200"
        aria-label="Siguiente curso"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {courses.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-colors duration-200 ${
              index === currentSlide ? "bg-white" : "bg-white/40"
            }`}
            aria-label={`Ir al curso ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
