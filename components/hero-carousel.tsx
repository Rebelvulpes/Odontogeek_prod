"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Play, Calendar, Users, Award, TrendingUp } from "lucide-react"

const slides = [
  {
    id: 1,
    type: "course",
    title: "Nuevo Curso: Férulas Oclusales",
    subtitle: "Incrementa tus ingresos rápidamente imprimiendo tus propias férulas",
    description: "Olvídate de mandar a laboratorio y hazlas tú mismo",
    backgroundColor: "from-blue-900 to-indigo-900",
    promoImage: "https://res.cloudinary.com/dxe6ugbzi/image/upload/v1746227801/fe%CC%81rulas_medit_qozti5.jpg",
    badge: "Nuevo Curso",
    badgeColor: "bg-green-500",
    cta: "Ver Curso",
    ctaLink: "/courses/1",
    stats: [
      { icon: Users, label: "1,250+ estudiantes", value: "1,250+" },
      { icon: Play, label: "24 lecciones", value: "24" },
      { icon: Award, label: "Certificado incluido", value: "Certificado" },
    ],
  },
  {
    id: 2,
    type: "news",
    title: "Congreso Internacional de Odontología 2024",
    subtitle: "Participa en el Evento Dental del Año",
    description: "Únete a más de 5,000 profesionales dentales en el congreso más importante de Latinoamérica.",
    backgroundColor: "from-purple-900 to-blue-900",
    promoImage: "/placeholder.svg?height=500&width=400&text=Congreso+2024",
    badge: "Evento Especial",
    badgeColor: "bg-blue-500",
    cta: "Más Información",
    ctaLink: "/events/congress-2024",
    stats: [
      { icon: Calendar, label: "15-17 Marzo", value: "3 días" },
      { icon: Users, label: "5,000+ asistentes", value: "5,000+" },
      { icon: Award, label: "50+ ponentes", value: "50+" },
    ],
  },
  {
    id: 3,
    type: "promotion",
    title: "Oferta Especial: 40% de Descuento",
    subtitle: "Acceso Completo a Todos los Cursos",
    description:
      "Por tiempo limitado, obtén acceso a nuestra biblioteca completa de cursos dentales con un descuento exclusivo.",
    backgroundColor: "from-red-900 to-pink-900",
    promoImage: "/placeholder.svg?height=500&width=400&text=40%+Descuento",
    badge: "Oferta Limitada",
    badgeColor: "bg-red-500",
    cta: "Aprovechar Oferta",
    ctaLink: "/courses?promo=special40",
    stats: [
      { icon: TrendingUp, label: "40% descuento", value: "40%" },
      { icon: Play, label: "15+ cursos", value: "15+" },
      { icon: Calendar, label: "Válido hasta fin de mes", value: "Limitado" },
    ],
  },
  {
    id: 4,
    type: "success",
    title: "Más de 10,000 Profesionales Capacitados",
    subtitle: "Únete a la Comunidad OdontoGeek",
    description:
      "Miles de dentistas ya han mejorado sus habilidades con nuestros cursos. Forma parte de la comunidad más grande.",
    backgroundColor: "from-green-900 to-teal-900",
    promoImage: "/placeholder.svg?height=500&width=400&text=10K+Profesionales",
    badge: "Comunidad",
    badgeColor: "bg-purple-500",
    cta: "Únete Ahora",
    ctaLink: "/auth/register",
    stats: [
      { icon: Users, label: "10,000+ profesionales", value: "10,000+" },
      { icon: Award, label: "5,000+ certificados", value: "5,000+" },
      { icon: TrendingUp, label: "95% satisfacción", value: "95%" },
    ],
  },
]

export function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying) return

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [isAutoPlaying])

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

  const currentSlideData = slides[currentSlide]

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
              {currentSlideData.stats.map((stat, index) => (
                <div key={index} className="flex items-center justify-center lg:justify-start space-x-2 text-blue-100">
                  <stat.icon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                  <div className="text-center lg:text-left">
                    <div className="font-bold text-white text-sm sm:text-base">{stat.value}</div>
                    <div className="text-xs sm:text-sm">{stat.label}</div>
                  </div>
                </div>
              ))}
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
              {/* Main promotional image */}
              <div className="relative z-10">
                <img
                  src={currentSlideData.promoImage || "/placeholder.svg"}
                  alt={currentSlideData.title}
                  className="w-80 h-96 xl:w-96 xl:h-[480px] object-cover rounded-2xl shadow-2xl border-4 border-white/20"
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

      {/* Dots Indicator - Mobile optimized */}
      <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-20 flex space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${
              index === currentSlide ? "bg-white scale-125" : "bg-white/50 hover:bg-white/75"
            }`}
            aria-label={`Ir al slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-white/20">
        <div
          className="h-full bg-white transition-all duration-300 ease-linear"
          style={{
            width: `${((currentSlide + 1) / slides.length) * 100}%`,
          }}
        />
      </div>

      {/* Auto-play indicator - Hidden on mobile */}
      {isAutoPlaying && (
        <div className="hidden sm:flex absolute top-4 right-4 z-20 items-center space-x-2 text-white/80 text-sm">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
          <span>Auto</span>
        </div>
      )}
    </div>
  )
}
