"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Play, Calendar, Users, Award, TrendingUp } from "lucide-react"

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

// Mapeo de iconos
const iconMap = {
  Users,
  Play,
  Award,
  Calendar,
  TrendingUp,
}

export function HeroCarousel() {
  const [slides, setSlides] = useState<CarouselSlide[]>([])
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSlides()
  }, [])

  useEffect(() => {
    if (!isAutoPlaying || slides.length === 0) return

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [isAutoPlaying, slides])

  const loadSlides = async () => {
    try {
      const response = await fetch("/api/carousel")
      const result = await response.json()

      if (result.success && result.data && Array.isArray(result.data)) {
        setSlides(result.data)
      } else {
        console.error("Error cargando slides:", result.message || "Datos inválidos")
        setSlides(getDefaultSlides())
      }
    } catch (error) {
      console.error("Error cargando slides del carrusel:", error)
      // Fallback a slides por defecto si hay error
      setSlides(getDefaultSlides())
    } finally {
      setLoading(false)
    }
  }

  const getDefaultSlides = (): CarouselSlide[] => [
    {
      id: "1",
      title: "Nuevo Curso: Férulas Oclusales",
      subtitle: "Incrementa tus ingresos rápidamente imprimiendo tus propias férulas",
      description: "Olvídate de mandar a laboratorio y hazlas tú mismo",
      backgroundColor: "from-blue-900 to-indigo-900",
      promoImage: "https://res.cloudinary.com/dxe6ugbzi/image/upload/v1746227801/fe%CC%81rulas_medit_qozti5.jpg",
      badge: "Nuevo Curso",
      badgeColor: "bg-green-500",
      cta: "Ver Curso",
      ctaLink: "/courses/1",
      type: "course",
      stats: [
        { icon: "Users", label: "1,250+ estudiantes", value: "1,250+" },
        { icon: "Play", label: "24 lecciones", value: "24" },
        { icon: "Award", label: "Certificado incluido", value: "Certificado" },
      ],
    },
  ]

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
    setIsAutoPlaying(false)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
    setIsAutoPlaying(false)
  }

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
    setIsAutoPlaying(false)
  }

  if (loading) {
    return (
      <div className="relative min-h-[500px] sm:min-h-[600px] lg:min-h-[700px] bg-gradient-to-br from-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin w-8 h-8 border-4 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Cargando carrusel...</p>
        </div>
      </div>
    )
  }

  if (!slides || slides.length === 0) {
    return (
      <div className="relative min-h-[500px] sm:min-h-[600px] lg:min-h-[700px] bg-gradient-to-br from-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center text-white max-w-2xl mx-auto px-4">
          <h2 className="text-4xl font-bold mb-4">Bienvenido a OdontoGeek</h2>
          <p className="text-xl mb-8 opacity-90">Plataforma de educación especializada en odontología</p>
          <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
            <Link href="/courses">Explorar Cursos</Link>
          </Button>
        </div>
      </div>
    )
  }

  const currentSlideData = slides && slides[currentSlide] ? slides[currentSlide] : getDefaultSlides()[0]

  return (
    <div className="relative min-h-[500px] sm:min-h-[600px] lg:min-h-[700px] overflow-hidden">
      {/* Color Background */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${currentSlideData.backgroundColor} transition-all duration-1000`}
      />

      {/* Mobile Background Image with High Transparency */}
      <div className="absolute inset-0 lg:hidden">
        <img
          src={currentSlideData.promoImage || "/placeholder.svg"}
          alt={currentSlideData.title}
          className="w-full h-full object-cover opacity-10"
          onError={(e) => {
            const target = e.target as HTMLImageElement
            target.src = "/placeholder.svg?height=500&width=400&text=Imagen+no+disponible"
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 h-full min-h-[500px] sm:min-h-[600px] lg:min-h-[700px] flex items-center">
        <div className="w-full lg:grid lg:grid-cols-2 lg:gap-12 lg:items-center">
          {/* Text Content */}
          <div className="text-white space-y-4 sm:space-y-6 text-center lg:text-left">
            {/* Badge */}
            <div className="flex justify-center lg:justify-start">
              <Badge className={`${currentSlideData.badgeColor} text-white border-0 text-xs sm:text-sm px-3 py-1`}>
                {currentSlideData.badge}
              </Badge>
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight">
              {currentSlideData.title}
            </h1>

            {/* Subtitle */}
            <h2 className="text-lg sm:text-xl md:text-2xl text-blue-100 font-medium">{currentSlideData.subtitle}</h2>

            {/* Description */}
            <p className="text-sm sm:text-base lg:text-lg text-blue-50 leading-relaxed max-w-lg mx-auto lg:mx-0">
              {currentSlideData.description}
            </p>

            {/* Stats - Mobile optimized */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 max-w-lg mx-auto lg:mx-0">
              {currentSlideData.stats.map((stat, index) => {
                const IconComponent = iconMap[stat.icon as keyof typeof iconMap] || Users
                return (
                  <div
                    key={index}
                    className="flex items-center justify-center lg:justify-start space-x-2 text-blue-100"
                  >
                    <IconComponent className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                    <div className="text-center lg:text-left">
                      <div className="font-bold text-white text-sm sm:text-base">{stat.value}</div>
                      <div className="text-xs sm:text-sm">{stat.label}</div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* CTA Buttons - Mobile optimized */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 sm:pt-6 max-w-lg mx-auto lg:mx-0">
              <Link href={currentSlideData.ctaLink} className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-3 bg-white text-blue-600 hover:bg-blue-50"
                >
                  {currentSlideData.cta}
                  <Play className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
              </Link>
              <Link href="/courses" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-3 border-white text-white hover:bg-white hover:text-blue-600 bg-transparent"
                >
                  Explorar Cursos
                </Button>
              </Link>
            </div>
          </div>

          {/* Promotional Image - Desktop Only */}
          <div className="hidden lg:flex lg:justify-center lg:items-center">
            <div className="relative">
              {/* Main promotional image - Square container for 1080x1080 images */}
              <div className="relative z-10 w-80 h-80 xl:w-96 xl:h-96">
                <img
                  src={currentSlideData.promoImage || "/placeholder.svg"}
                  alt={currentSlideData.title}
                  className="w-full h-full object-cover rounded-2xl shadow-2xl border-4 border-white/20"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = "/placeholder.svg?height=400&width=400&text=Imagen+no+disponible"
                  }}
                />
              </div>

              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-16 h-16 xl:w-20 xl:h-20 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce z-20">
                <Award className="w-6 h-6 xl:w-8 xl:h-8 text-yellow-800" />
              </div>
              <div className="absolute -bottom-4 -left-4 w-12 h-12 xl:w-16 xl:h-16 bg-green-400 rounded-full flex items-center justify-center animate-pulse z-20">
                <Users className="w-5 h-5 xl:w-6 xl:h-6 text-green-800" />
              </div>

              {/* Background glow effect */}
              <div className="absolute inset-0 bg-white/10 rounded-2xl blur-xl scale-110 -z-10"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Arrows - Mobile optimized */}
      {slides && slides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
            aria-label="Slide anterior"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
            aria-label="Siguiente slide"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </>
      )}

      {/* Dots Indicator - Mobile optimized */}
      {slides &&
        slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${
              index === currentSlide ? "bg-white scale-125" : "bg-white/50 hover:bg-white/75"
            }`}
            aria-label={`Ir al slide ${index + 1}`}
          />
        ))}

      {/* Progress Bar */}
      {slides && slides.length > 1 && (
        <div className="absolute bottom-0 left-0 w-full h-1 bg-white/20">
          <div
            className="h-full bg-white transition-all duration-300 ease-linear"
            style={{
              width: `${((currentSlide + 1) / slides.length) * 100}%`,
            }}
          />
        </div>
      )}

      {/* Auto-play indicator - Hidden on mobile */}
      {isAutoPlaying && slides && slides.length > 1 && (
        <div className="hidden sm:flex absolute top-4 right-4 z-20 items-center space-x-2 text-white/80 text-sm">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
          <span>Auto</span>
        </div>
      )}
    </div>
  )
}
