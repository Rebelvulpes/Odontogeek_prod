"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface CarouselSlide {
  id: string
  title: string
  description: string
  image_url: string
  link_url?: string
  is_active: boolean
  order_index: number
}

interface Stats {
  totalCourses: number
  totalStudents: number
  totalInstructors: number
}

export function HeroCarousel() {
  const [slides, setSlides] = useState<CarouselSlide[]>([])
  const [stats, setStats] = useState<Stats>({ totalCourses: 0, totalStudents: 0, totalInstructors: 0 })
  const [currentSlide, setCurrentSlide] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Slides por defecto como fallback
  const defaultSlides: CarouselSlide[] = [
    {
      id: "default-1",
      title: "Bienvenido a OdontoGeek",
      description: "La plataforma líder en educación odontológica online",
      image_url: "/placeholder.svg?height=400&width=800&text=Educación+Odontológica",
      is_active: true,
      order_index: 1,
    },
    {
      id: "default-2",
      title: "Cursos Especializados",
      description: "Aprende de los mejores profesionales del sector",
      image_url: "/placeholder.svg?height=400&width=800&text=Cursos+Especializados",
      is_active: true,
      order_index: 2,
    },
    {
      id: "default-3",
      title: "Certificación Profesional",
      description: "Obtén certificados reconocidos en la industria",
      image_url: "/placeholder.svg?height=400&width=800&text=Certificación+Profesional",
      is_active: true,
      order_index: 3,
    },
  ]

  useEffect(() => {
    fetchCarouselData()
    fetchStats()
  }, [])

  useEffect(() => {
    if (slides.length > 0) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length)
      }, 5000)
      return () => clearInterval(timer)
    }
  }, [slides.length])

  const fetchCarouselData = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/carousel")
      const result = await response.json()

      if (response.ok && result.success) {
        const activeSlides = (result.data || [])
          .filter((slide: CarouselSlide) => slide.is_active)
          .sort((a: CarouselSlide, b: CarouselSlide) => a.order_index - b.order_index)

        if (activeSlides.length > 0) {
          setSlides(activeSlides)
        } else {
          // Usar slides por defecto si no hay slides activos
          setSlides(defaultSlides)
        }
        setError(null)
      } else {
        console.error("Error fetching carousel:", result.message)
        setSlides(defaultSlides)
        setError("Error cargando carousel, usando contenido por defecto")
      }
    } catch (error) {
      console.error("Error fetching carousel:", error)
      setSlides(defaultSlides)
      setError("Error de conexión, usando contenido por defecto")
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/admin/stats")
      const result = await response.json()

      if (response.ok && result.success) {
        setStats({
          totalCourses: result.data.totalCourses || 0,
          totalStudents: result.data.totalUsers || 0,
          totalInstructors: Math.ceil((result.data.totalCourses || 0) / 3), // Estimación
        })
      }
    } catch (error) {
      console.error("Error fetching stats:", error)
      // Mantener valores por defecto
    }
  }

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
  }

  if (loading) {
    return (
      <div className="relative w-full h-96 bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Cargando...</p>
        </div>
      </div>
    )
  }

  if (!slides || slides.length === 0) {
    return (
      <div className="relative w-full h-96 bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
        <div className="text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Bienvenido a OdontoGeek</h2>
          <p className="text-xl">La plataforma líder en educación odontológica online</p>
        </div>
      </div>
    )
  }

  const currentSlideData = slides[currentSlide]

  return (
    <div className="relative w-full h-96 overflow-hidden rounded-lg">
      {error && (
        <div className="absolute top-2 right-2 z-20 bg-yellow-500 text-white px-3 py-1 rounded text-sm">{error}</div>
      )}

      {/* Slide actual */}
      <div
        className="relative w-full h-full bg-cover bg-center transition-all duration-500"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${currentSlideData.image_url})`,
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white px-4 max-w-4xl">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">{currentSlideData.title}</h2>
            <p className="text-xl md:text-2xl mb-8">{currentSlideData.description}</p>
            {currentSlideData.link_url && (
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                <a href={currentSlideData.link_url} className="text-white">
                  Explorar Cursos
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Controles de navegación */}
      {slides.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white"
            onClick={prevSlide}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white"
            onClick={nextSlide}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>

          {/* Indicadores de puntos */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {slides.map((_, index) => (
              <button
                key={index}
                className={`w-3 h-3 rounded-full transition-all ${index === currentSlide ? "bg-white" : "bg-white/50"}`}
                onClick={() => goToSlide(index)}
              />
            ))}
          </div>
        </>
      )}

      {/* Estadísticas */}
      <div className="absolute bottom-4 right-4 bg-black/20 backdrop-blur-sm rounded-lg p-4 text-white">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold">{stats.totalCourses}</div>
            <div className="text-sm">Cursos</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{stats.totalStudents}</div>
            <div className="text-sm">Estudiantes</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{stats.totalInstructors}</div>
            <div className="text-sm">Instructores</div>
          </div>
        </div>
      </div>
    </div>
  )
}
