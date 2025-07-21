"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Heart, Users, Award, BookOpen, Star, ArrowRight, Quote } from "lucide-react"

export default function AboutPage() {
  const [user, setUser] = useState(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    checkAuthStatus()
    setIsVisible(true)
  }, [])

  const checkAuthStatus = async () => {
    try {
      const response = await fetch("/api/auth/me")
      if (response.ok) {
        const userData = await response.json()
        setUser(userData.user)
      }
    } catch (error) {
      console.log("No authenticated user")
    }
  }

  const values = [
    {
      icon: Heart,
      title: "Pasión por la Educación",
      description:
        "Creemos que la educación continua es la clave para brindar la mejor atención dental a nuestros pacientes.",
      color: "text-red-500",
    },
    {
      icon: Users,
      title: "Comunidad Profesional",
      description: "Fomentamos una comunidad donde los profesionales pueden aprender, compartir y crecer juntos.",
      color: "text-blue-500",
    },
    {
      icon: Award,
      title: "Excelencia Académica",
      description: "Nuestros cursos están diseñados por expertos reconocidos en el campo de la odontología.",
      color: "text-yellow-500",
    },
    {
      icon: BookOpen,
      title: "Aprendizaje Práctico",
      description: "Combinamos teoría sólida con aplicaciones prácticas para un aprendizaje efectivo.",
      color: "text-green-500",
    },
  ]

  const achievements = [
    { number: "500+", label: "Estudiantes Graduados" },
    { number: "50+", label: "Cursos Especializados" },
    { number: "15+", label: "Años de Experiencia" },
    { number: "98%", label: "Satisfacción del Cliente" },
  ]

  const testimonials = [
    {
      name: "Dr. María González",
      role: "Ortodoncista",
      content:
        "Los cursos de OdontoGeek han transformado mi práctica profesional. La calidad del contenido es excepcional.",
      rating: 5,
    },
    {
      name: "Dr. Carlos Rodríguez",
      role: "Cirujano Oral",
      content:
        "Una plataforma increíble con instructores de primer nivel. Altamente recomendado para cualquier profesional dental.",
      rating: 5,
    },
    {
      name: "Dra. Ana Martínez",
      role: "Endodoncista",
      content:
        "La flexibilidad de estudiar a mi ritmo y la calidad de los materiales hacen de OdontoGeek mi primera opción.",
      rating: 5,
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navigation user={user} />

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10" />
        <div className="container mx-auto px-4 relative">
          <div
            className={`text-center transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
          >
            <Badge variant="outline" className="mb-4 text-blue-600 border-blue-200">
              Sobre Nosotros
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
              Transformando la Educación Dental
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              En OdontoGeek, creemos que cada profesional dental merece acceso a la mejor educación continua. Nuestra
              misión es democratizar el conocimiento especializado y crear una comunidad global de excelencia.
            </p>
          </div>
        </div>
      </section>

      {/* Founder Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div
              className={`transition-all duration-1000 delay-200 ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10"}`}
            >
              <Badge variant="outline" className="mb-4 text-purple-600 border-purple-200">
                Nuestra Fundadora
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Dra. [Nombre de la Fundadora]</h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  Con más de 15 años de experiencia en odontología especializada, nuestra fundadora identificó la
                  necesidad de crear una plataforma que conectara a los mejores especialistas con profesionales que
                  buscan actualizar sus conocimientos.
                </p>
                <p>
                  Su visión era simple pero poderosa: hacer que la educación dental de calidad fuera accesible para
                  todos los profesionales, sin importar su ubicación geográfica.
                </p>
                <div className="flex flex-wrap gap-2 mt-6">
                  <Badge variant="secondary">Especialista en Implantología</Badge>
                  <Badge variant="secondary">Educadora Certificada</Badge>
                  <Badge variant="secondary">Conferencista Internacional</Badge>
                </div>
              </div>
            </div>
            <div
              className={`transition-all duration-1000 delay-400 ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10"}`}
            >
              <div className="relative">
                <div className="aspect-square bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-32 h-32 bg-gradient-to-br from-blue-200 to-purple-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <Users className="w-16 h-16 text-blue-600" />
                    </div>
                    <p className="text-gray-500 font-medium">Espacio para imagen de la fundadora</p>
                    <p className="text-sm text-gray-400 mt-2">Imagen profesional de alta calidad</p>
                  </div>
                </div>
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full opacity-20 animate-pulse" />
                <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full opacity-20 animate-pulse delay-1000" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4 text-blue-600 border-blue-200">
              Nuestros Valores
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Lo que nos Define</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Estos principios guían cada decisión que tomamos y cada curso que creamos.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <Card
                key={index}
                className={`group hover:shadow-xl transition-all duration-500 hover:-translate-y-2 ${
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                }`}
                style={{ transitionDelay: `${600 + index * 100}ms` }}
              >
                <CardContent className="p-6 text-center">
                  <div
                    className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                  >
                    <value.icon className={`w-8 h-8 ${value.color}`} />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{value.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Achievements Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4 text-green-600 border-green-200">
              Nuestros Logros
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Números que nos Enorgullecen</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {achievements.map((achievement, index) => (
              <div
                key={index}
                className={`text-center transition-all duration-1000 ${
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                }`}
                style={{ transitionDelay: `${1000 + index * 100}ms` }}
              >
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  {achievement.number}
                </div>
                <div className="text-gray-600 font-medium">{achievement.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 bg-gradient-to-br from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12">
            <div
              className={`transition-all duration-1000 ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10"}`}
            >
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mr-4">
                    <Heart className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-bold">Nuestra Misión</h3>
                </div>
                <p className="text-white/90 leading-relaxed">
                  Democratizar el acceso a la educación dental especializada, proporcionando cursos de alta calidad que
                  permitan a los profesionales mantenerse actualizados con las últimas técnicas y tecnologías en
                  odontología.
                </p>
              </div>
            </div>

            <div
              className={`transition-all duration-1000 delay-200 ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10"}`}
            >
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mr-4">
                    <Star className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-bold">Nuestra Visión</h3>
                </div>
                <p className="text-white/90 leading-relaxed">
                  Ser la plataforma líder en educación dental en línea, reconocida por la excelencia de nuestros
                  contenidos y por formar una comunidad global de profesionales comprometidos con la mejora continua.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4 text-purple-600 border-purple-200">
              Testimonios
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Lo que Dicen Nuestros Estudiantes</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card
                key={index}
                className={`group hover:shadow-xl transition-all duration-500 hover:-translate-y-2 ${
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                }`}
                style={{ transitionDelay: `${1400 + index * 100}ms` }}
              >
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <Quote className="w-8 h-8 text-blue-500 mr-3" />
                    <div className="flex">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-600 mb-4 leading-relaxed">"{testimonial.content}"</p>
                  <div className="border-t pt-4">
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-500">{testimonial.role}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 text-center">
          <div
            className={`transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">¿Listo para Transformar tu Práctica?</h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Únete a nuestra comunidad de profesionales y lleva tu carrera al siguiente nivel.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                Explorar Cursos
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button size="lg" variant="outline">
                Contactar
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
