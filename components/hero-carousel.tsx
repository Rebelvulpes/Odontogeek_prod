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
    title: "Cursos de Odontología Avanzada",
    subtitle: "Aprende con los mejores profesionales",
    description: "Descubre técnicas innovadoras y mejora tus habilidades clínicas con nuestros cursos especializados.",
    backgroundColor: "from-blue-900 to-indigo-900",
    promoImage: "/placeholder.svg?height=400&width=600",
    badge: "Nuevo",
    badgeColor: "bg-green-500",
    cta: "Ver Cursos",
    ctaLink: "/courses",
    type: "course",
    stats: [
      { icon: "Users", label: "Estudiantes", value: "1,000+" },
      { icon: "Play", label: "Lecciones", value: "20+" },
      { icon: "Award", label: "Certificado", value: "Incluido" },
    ],
  },
  {
    id: "2",
    title: "Especialización en Implantología",
    subtitle: "Técnicas quirúrgicas modernas",
    description: "Domina las últimas técnicas en implantología dental con casos clínicos reales.",
    backgroundColor: "from-purple-900 to-pink-900",
    promoImage: "/placeholder.svg?height=400&width=600",
    badge: "Popular",
    badgeColor: "bg-orange-500",
    cta: "Comenzar Ahora",
    ctaLink: "/courses",
    type: "course",
    stats: [
      { icon: "Users", label: "Estudiantes", value: "500+" },
      { icon: "Play", label: "Lecciones", value: "15+" },
      { icon: "Award", label: "Certificado", value: "Incluido" },
    ],
  },
]

export function HeroCarousel() {
  const [slides, setSlides] = useState<CarouselSlide[]>(defaultSlides)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSlides = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/carousel")

        if (!response.ok) {
          throw new Error("Error al cargar slides")
        }

        const result = await response.json()

        if (result.success && Array.isArray(result.data) && result.data.length > 0) {
          // Transformar datos de la API al formato esperado
          const transformedSlides = result.data.map((slide: any) => ({
            id: slide.id,
            title: slide.title || "",
            subtitle: slide.subtitle || "",
            description: slide.description || "",
            backgroundColor: slide.background_color || "from-blue-900 to-indigo-900",
            promoImage: slide.image_url || "/placeholder.svg?height=400&width=600",
            badge: slide.badge_text || "Nuevo",
            badgeColor: slide.badge_color || "bg-green-500",
            cta: slide.cta_text || "Ver más",
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
          // Usar slides por defecto si no hay datos
          setSlides(defaultSlides)
        }
      } catch (err) {
        console.error("Error fetching slides:", err)
        setError("Error al cargar el carousel")
        setSlides(defaultSlides) // Fallback a slides por defecto
      } finally {
        setLoading(false)
      }
    }

    fetchSlides()
  }, [])

  useEffect(() => {
    if (!slides || slides.length === 0) return

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)

    return () => clearInterval(timer)
  }, [slides])

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

  if (error) {
    return (
      <div className="relative h-[600px] bg-gradient-to-r from-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-center">
          <p className="text-lg mb-4">{error}</p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Reintentar
          </Button>
        </div>
      </div>
    )
  }

  if (!slides || slides.length === 0) {
    return (
      <div className="relative h-[600px] bg-gradient-to-r from-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-center">
          <h2 className="text-3xl font-bold mb-4">Bienvenido a OdontoGeek</h2>
          <p className="text-lg mb-6">Cursos especializados en odontología</p>
          <Button asChild>
            <a href="/courses">Ver Cursos</a>
          </Button>
        </div>
      </div>
    )
  }

  const currentSlideData = slides[currentSlide]

  if (!currentSlideData) {
    return null
  }

  return (
    <div className="relative h-[600px] overflow-hidden">
      <div
        className={`absolute inset-0 bg-gradient-to-r ${currentSlideData.backgroundColor} transition-all duration-1000`}
      >
        <div className="container mx-auto px-4 h-full flex items-center">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full">
            {/* Contenido del slide */}
            <div className="text-white space-y-6">
              <div className="space-y-4">
                <Badge className={`${currentSlideData.badgeColor} text-white px-3 py-1 text-sm font-medium`}>
                  {currentSlideData.badge}
                </Badge>
                <h1 className="text-4xl lg:text-5xl font-bold leading-tight">{currentSlideData.title}</h1>
                <p className="text-xl text-blue-100">{currentSlideData.subtitle}</p>
                <p className="text-lg text-blue-200 leading-relaxed">{currentSlideData.description}</p>
              </div>

              {/* Estadísticas */}
              <div className="grid grid-cols-3 gap-6">
                {Array.isArray(currentSlideData.stats) &&
                  currentSlideData.stats.map((stat, index) => (
                    <div key={index} className="text-center">
                      <div className="flex justify-center mb-2">{getIcon(stat.icon)}</div>
                      <div className="text-2xl font-bold">{stat.value}</div>
                      <div className="text-sm text-blue-200">{stat.label}</div>
                    </div>
                  ))}
              </div>

              {/* CTA Button */}
              <div className="pt-4">
                <Button size="lg" className="bg-white text-blue-900 hover:bg-blue-50" asChild>
                  <a href={currentSlideData.ctaLink}>{currentSlideData.cta}</a>
                </Button>
              </div>
            </div>

            {/* Imagen promocional */}
            <div className="relative">
              <div className="relative z-10">
                <img
                  src={currentSlideData.promoImage || "/placeholder.svg"}
                  alt={currentSlideData.title}
                  className="w-full h-auto rounded-lg shadow-2xl"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = "/placeholder.svg?height=400&width=600"
                  }}
                />
              </div>
              {/* Elementos decorativos */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-white/5 rounded-full blur-xl"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Controles de navegación */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-all duration-200"
            aria-label="Slide anterior"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-all duration-200"
            aria-label="Siguiente slide"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Indicadores de puntos */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-200 ${
                  index === currentSlide ? "bg-white" : "bg-white/50 hover:bg-white/75"
                }`}
                aria-label={`Ir al slide ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
