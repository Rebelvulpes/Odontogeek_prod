"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, Play, Star, BookOpen, Award, Zap, Target, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface Slide {
  id: number
  title: string
  subtitle: string
  description: string
  buttonText: string
  buttonLink: string
  stats: {
    students: string
    courses: string
    rating: string
  }
  features: string[]
  promoImage: string
  backgroundColor: string
}

const slides: Slide[] = [
  {
    id: 1,
    title: "Transforma tu Práctica Dental",
    subtitle: "Cursos Especializados en Odontología",
    description:
      "Accede a más de 100 cursos diseñados por expertos para llevar tu práctica dental al siguiente nivel. Desde técnicas básicas hasta procedimientos avanzados.",
    buttonText: "Explorar Cursos",
    buttonLink: "/courses",
    stats: {
      students: "5,000+",
      courses: "100+",
      rating: "4.9",
    },
    features: ["Certificación profesional", "Acceso de por vida", "Soporte 24/7", "Casos clínicos reales"],
    promoImage: "/placeholder.svg?height=1080&width=1080&text=Curso+Dental+1",
    backgroundColor: "from-blue-600 to-indigo-700",
  },
  {
    id: 2,
    title: "Domina las Técnicas Avanzadas",
    subtitle: "Implantología y Cirugía Oral",
    description:
      "Especialízate en implantología dental y cirugía oral con nuestros cursos avanzados. Aprende de los mejores profesionales del sector.",
    buttonText: "Ver Especialización",
    buttonLink: "/courses?category=implantologia",
    stats: {
      students: "2,500+",
      courses: "25+",
      rating: "4.8",
    },
    features: ["Simulaciones 3D", "Casos complejos", "Mentorías personalizadas", "Técnicas innovadoras"],
    promoImage: "/placeholder.svg?height=1080&width=1080&text=Implantología+Dental",
    backgroundColor: "from-purple-600 to-blue-600",
  },
  {
    id: 3,
    title: "Estética Dental Profesional",
    subtitle: "Sonrisas que Transforman Vidas",
    description:
      "Aprende las últimas técnicas en odontología estética. Desde blanqueamiento hasta carillas y diseño de sonrisa digital.",
    buttonText: "Comenzar Ahora",
    buttonLink: "/courses?category=estetica",
    stats: {
      students: "3,200+",
      courses: "30+",
      rating: "4.9",
    },
    features: [
      "Diseño digital de sonrisa",
      "Técnicas mínimamente invasivas",
      "Fotografía dental",
      "Casos antes y después",
    ],
    promoImage: "/placeholder.svg?height=1080&width=1080&text=Estética+Dental",
    backgroundColor: "from-red-500 to-pink-600",
  },
  {
    id: 4,
    title: "Ortodoncia Moderna",
    subtitle: "Alineadores y Técnicas Digitales",
    description:
      "Domina la ortodoncia del siglo XXI con alineadores invisibles, planificación digital y técnicas de vanguardia.",
    buttonText: "Descubrir Más",
    buttonLink: "/courses?category=ortodoncia",
    stats: {
      students: "1,800+",
      courses: "20+",
      rating: "4.7",
    },
    features: ["Planificación digital", "Alineadores invisibles", "Ortodoncia interceptiva", "Software especializado"],
    promoImage: "/placeholder.svg?height=1080&width=1080&text=Ortodoncia+Digital",
    backgroundColor: "from-green-500 to-teal-600",
  },
]

export function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  useEffect(() => {
    if (!isAutoPlaying) return

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 6000)

    return () => clearInterval(interval)
  }, [isAutoPlaying])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
  }

  const currentSlideData = slides[currentSlide]

  return (
    <div
      className={`relative min-h-[600px] lg:min-h-[700px] bg-gradient-to-br ${currentSlideData.backgroundColor} transition-all duration-1000 overflow-hidden`}
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      {/* Elementos decorativos de fondo */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-white/5 rounded-full animate-bounce"></div>
        <div className="absolute bottom-20 left-20 w-12 h-12 bg-white/10 rounded-full animate-pulse"></div>
        <div className="absolute bottom-40 right-10 w-24 h-24 bg-white/5 rounded-full animate-bounce"></div>

        {/* Iconos flotantes */}
        <div className="absolute top-32 left-1/4 text-white/20 animate-float">
          <BookOpen className="w-8 h-8" />
        </div>
        <div className="absolute top-60 right-1/3 text-white/20 animate-float-delayed">
          <Award className="w-6 h-6" />
        </div>
        <div className="absolute bottom-32 left-1/3 text-white/20 animate-float">
          <Zap className="w-7 h-7" />
        </div>
        <div className="absolute bottom-60 right-1/4 text-white/20 animate-float-delayed">
          <Target className="w-6 h-6" />
        </div>
      </div>

      {/* Imagen promocional como fondo en móvil */}
      <div className="absolute inset-0 lg:hidden">
        <img
          src={currentSlideData.promoImage || "/placeholder.svg"}
          alt={currentSlideData.title}
          className="w-full h-full object-cover opacity-10"
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[500px]">
          {/* Contenido del texto */}
          <div className="text-white space-y-8">
            <div className="space-y-4">
              <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                {currentSlideData.subtitle}
              </Badge>
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight">{currentSlideData.title}</h1>
              <p className="text-xl lg:text-2xl text-white/90 leading-relaxed">{currentSlideData.description}</p>
            </div>

            {/* Estadísticas */}
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl lg:text-3xl font-bold">{currentSlideData.stats.students}</div>
                <div className="text-white/80 text-sm">Estudiantes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl lg:text-3xl font-bold">{currentSlideData.stats.courses}</div>
                <div className="text-white/80 text-sm">Cursos</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center space-x-1">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span className="text-2xl lg:text-3xl font-bold">{currentSlideData.stats.rating}</span>
                </div>
                <div className="text-white/80 text-sm">Valoración</div>
              </div>
            </div>

            {/* Características */}
            <div className="grid grid-cols-2 gap-3">
              {currentSlideData.features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-2 text-white/90">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span className="text-sm lg:text-base">{feature}</span>
                </div>
              ))}
            </div>

            {/* Botones de acción */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="bg-white text-gray-900 hover:bg-white/90 font-semibold px-8 py-4 text-lg"
                asChild
              >
                <a href={currentSlideData.buttonLink}>
                  {currentSlideData.buttonText}
                  <Play className="ml-2 w-5 h-5" />
                </a>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 font-semibold px-8 py-4 text-lg bg-transparent"
                asChild
              >
                <a href="/about">
                  Conocer Más
                  <TrendingUp className="ml-2 w-5 h-5" />
                </a>
              </Button>
            </div>
          </div>

          {/* Imagen promocional - Solo visible en desktop */}
          <div className="hidden lg:flex justify-center items-center">
            <div className="relative">
              {/* Efectos de fondo */}
              <div className="absolute -inset-4 bg-white/10 rounded-3xl blur-xl"></div>
              <div className="absolute -inset-2 bg-gradient-to-r from-white/20 to-transparent rounded-2xl"></div>

              {/* Contenedor cuadrado para imagen 1080x1080 */}
              <div className="relative z-10 w-80 h-80 xl:w-96 xl:h-96">
                <img
                  src={currentSlideData.promoImage || "/placeholder.svg"}
                  alt={currentSlideData.title}
                  className="w-full h-full object-cover rounded-2xl shadow-2xl border-4 border-white/20"
                />
              </div>

              {/* Elementos decorativos alrededor de la imagen */}
              <div className="absolute -top-4 -right-4 w-8 h-8 bg-yellow-400 rounded-full animate-bounce"></div>
              <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-green-400 rounded-full animate-pulse"></div>
              <div className="absolute top-1/2 -left-8 w-4 h-4 bg-blue-400 rounded-full animate-ping"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Controles de navegación */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={prevSlide} className="text-white hover:bg-white/20 p-2">
            <ChevronLeft className="w-5 h-5" />
          </Button>

          <div className="flex space-x-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentSlide ? "bg-white scale-125" : "bg-white/50 hover:bg-white/70"
                }`}
              />
            ))}
          </div>

          <Button variant="ghost" size="sm" onClick={nextSlide} className="text-white hover:bg-white/20 p-2">
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Indicador de progreso */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-white/20">
        <div
          className="h-full bg-white transition-all duration-300 ease-out"
          style={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
        />
      </div>
    </div>
  )
}

// Estilos CSS personalizados para las animaciones
const styles = `
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
  }
  
  @keyframes float-delayed {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-15px); }
  }
  
  .animate-float {
    animation: float 3s ease-in-out infinite;
  }
  
  .animate-float-delayed {
    animation: float-delayed 3s ease-in-out infinite 1.5s;
  }
`

// Inyectar estilos
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style")
  styleSheet.textContent = styles
  document.head.appendChild(styleSheet)
}
