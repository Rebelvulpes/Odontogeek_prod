"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, Users, Play, Award } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface CarouselSlide {
  id: string
  title: string
  subtitle: string
  description: string
  backgroundColor: string
  promoImage: string
  badge: string
  badgeColor: string
  cta: string
  ctaLink: string
  type: string
  stats: Array<{
    icon: string
    label: string
    value: string
  }>
}

const defaultSlides: CarouselSlide[] = [
  {
    id: "1",
    title: "Curso Completo de Odontología Digital",
    subtitle: "Aprende las últimas técnicas",
    description: "Domina las herramientas digitales más avanzadas en odontología moderna",
    backgroundColor: "from-blue-900 to-indigo-900",
    promoImage: "/placeholder.svg?height=400&width=600&text=Odontología+Digital",
    badge: "Nuevo",
    badgeColor: "bg-green-500",
    cta: "Comenzar Curso",
    ctaLink: "/courses",
    type: "course",
    stats: [
      { icon: "Users", label: "Estudiantes", value: "1,200+" },
      { icon: "Play", label: "Lecciones", value: "24" },
      { icon: "Award", label: "Certificado", value: "Incluido" },
    ],
  },
  {
    id: "2",
    title: "Especialización en Implantología",
    subtitle: "Técnicas avanzadas",
    description: "Conviértete en un experto en implantes dentales con casos reales",
    backgroundColor: "from-purple-900 to-pink-900",
    promoImage: "/placeholder.svg?height=400&width=600&text=Implantología",
    badge: "Popular",
    badgeColor: "bg-orange-500",
    cta: "Ver Detalles",
    ctaLink: "/courses",
    type: "course",
    stats: [
      { icon: "Users", label: "Estudiantes", value: "800+" },
      { icon: "Play", label: "Lecciones", value: "18" },
      { icon: "Award", label: "Certificado", value: "Incluido" },
    ],
  },
]

export function HeroCarousel() {
  const [slides, setSlides] = useState<CarouselSlide[]>(defaultSlides)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCarouselData()
  }, [])

  useEffect(() => {
    if (!slides || slides.length === 0) return

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)

    return () => clearInterval(timer)
  }, [slides])

  const fetchCarouselData = async () => {
    try {
      const response = await fetch("/api/carousel")
      if (response.ok) {
        const result = await response.json()
        if (result.success && Array.isArray(result.data) && result.data.length > 0) {
          // Transformar los datos de la API al formato esperado
          const transformedSlides = result.data.map((slide: any) => ({
            id: slide.id,
            title: slide.title || "Curso de Odontología",
            subtitle: slide.subtitle || "Aprende con expertos",
            description: slide.description || "Descripción del curso",
            backgroundColor: slide.background_color || "from-blue-900 to-indigo-900",
            promoImage: slide.image_url || "/placeholder.svg?height=400&width=600&text=Curso",
            badge: slide.badge_text || "Nuevo",
            badgeColor: slide.badge_color || "bg-green-500",
            cta: slide.cta_text || "Ver Curso",
            ctaLink: slide.cta_link || "/courses",
            type: slide.slide_type || "course",
            stats: [
              { icon: "Users", label: "Estudiantes", value: "1,000+" },
              { icon: "Play", label: "Lecciones", value: "20+" },
              { icon: "Award", label: "Certificado", value: "Incluido" },
            ],
          }))
          setSlides(transformedSlides)
        } else {
          // Si no hay datos de la API, usar slides por defecto
          setSlides(defaultSlides)
        }
      } else {
        setSlides(defaultSlides)
      }
    } catch (error) {
      console.error("Error fetching carousel data:", error)
      setSlides(defaultSlides)
    } finally {
      setLoading(false)
    }
  }

  const nextSlide = () => {
    if (!slides || slides.length === 0) return
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    if (!slides || slides.length === 0) return
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
  }

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "Users":
        return <Users className="w-5 h-5" />
      case "Play":
        return <Play className="w-5 h-5" />
      case "Award":
        return <Award className="w-5 h-5" />
      default:
        return <Users className="w-5 h-5" />
    }
  }

  if (loading) {
    return (
      <div className="relative h-[600px] bg-gradient-to-r from-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Cargando...</p>
        </div>
      </div>
    )
  }

  if (!slides || slides.length === 0) {
    return (
      <div className="relative h-[600px] bg-gradient-to-r from-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-center">
          <h2 className="text-3xl font-bold mb-4">Bienvenido a OdontoGeek</h2>
          <p className="text-xl mb-8">Cursos de odontología de alta calidad</p>
          <Button size="lg" className="bg-white text-blue-900 hover:bg-gray-100">
            Explorar Cursos
          </Button>
        </div>
      </div>
    )
  }

  const currentSlideData = slides[currentSlide]

  if (!currentSlideData) {
    return (
      <div className="relative h-[600px] bg-gradient-to-r from-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-center">
          <h2 className="text-3xl font-bold mb-4">Error al cargar el contenido</h2>
          <Button size="lg" className="bg-white text-blue-900 hover:bg-gray-100">
            Recargar
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative h-[600px] bg-gradient-to-r ${currentSlideData.backgroundColor} overflow-hidden`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[url('/placeholder.svg?height=100&width=100&text=Pattern')] bg-repeat opacity-20"></div>
      </div>

      {/* Main Content */}
      <div className="relative h-full flex items-center">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-white space-y-6">
              <div className="space-y-4">
                <Badge className={`${currentSlideData.badgeColor} text-white border-0 px-3 py-1`}>
                  {currentSlideData.badge}
                </Badge>
                <h1 className="text-4xl lg:text-6xl font-bold leading-tight">{currentSlideData.title}</h1>
                <p className="text-xl lg:text-2xl text-blue-100">{currentSlideData.subtitle}</p>
                <p className="text-lg text-blue-200 max-w-lg">{currentSlideData.description}</p>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-6">
                {Array.isArray(currentSlideData.stats) &&
                  currentSlideData.stats.map((stat, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      {getIcon(stat.icon)}
                      <div>
                        <div className="font-semibold">{stat.value}</div>
                        <div className="text-sm text-blue-200">{stat.label}</div>
                      </div>
                    </div>
                  ))}
              </div>

              {/* CTA Button */}
              <div className="pt-4">
                <Button
                  size="lg"
                  className="bg-white text-blue-900 hover:bg-gray-100 px-8 py-3 text-lg font-semibold"
                  onClick={() => (window.location.href = currentSlideData.ctaLink)}
                >
                  {currentSlideData.cta}
                </Button>
              </div>
            </div>

            {/* Right Content - Image */}
            <div className="relative">
              <div className="relative z-10">
                <img
                  src={currentSlideData.promoImage || "/placeholder.svg"}
                  alt={currentSlideData.title}
                  className="w-full h-auto max-w-lg mx-auto rounded-lg shadow-2xl"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = "/placeholder.svg?height=400&width=600&text=Curso+de+Odontología"
                  }}
                />
              </div>
              {/* Decorative Elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-white/5 rounded-full blur-xl"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-all duration-200"
            aria-label="Slide anterior"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-all duration-200"
            aria-label="Siguiente slide"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {slides.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-200 ${
                index === currentSlide ? "bg-white" : "bg-white/40 hover:bg-white/60"
              }`}
              aria-label={`Ir al slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
