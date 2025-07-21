"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, Users, Trophy, BookOpen, Star, Target, Eye, ArrowRight, Quote, Sparkles } from "lucide-react"
import Link from "next/link"

export default function NosotrosPage() {
  const [user, setUser] = useState<any | null>(null)

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await fetch("/api/auth/me", {
          credentials: "include",
        })
        if (response.ok) {
          const userData = await response.json()
          setUser(userData.user)
        }
      } catch (error) {
        console.error("Error checking auth status:", error)
      }
    }

    checkAuthStatus()
  }, [])

  const valores = [
    {
      icon: Heart,
      title: "Pasión por la Educación",
      description: "Creemos que la educación continua es la clave del éxito profesional en odontología.",
      color: "text-red-500",
    },
    {
      icon: Users,
      title: "Comunidad Profesional",
      description: "Fomentamos una red de profesionales que se apoyan mutuamente en su crecimiento.",
      color: "text-blue-500",
    },
    {
      icon: Trophy,
      title: "Excelencia Académica",
      description: "Mantenemos los más altos estándares de calidad en todos nuestros contenidos.",
      color: "text-yellow-500",
    },
    {
      icon: BookOpen,
      title: "Aprendizaje Práctico",
      description: "Enfocamos nuestros cursos en aplicaciones reales y casos clínicos actuales.",
      color: "text-green-500",
    },
  ]

  const logros = [
    { numero: "5,000+", texto: "Estudiantes Graduados" },
    { numero: "150+", texto: "Cursos Disponibles" },
    { numero: "98%", texto: "Satisfacción del Cliente" },
    { numero: "15+", texto: "Años de Experiencia" },
  ]

  const testimonios = [
    {
      nombre: "Dr. Carlos Mendoza",
      especialidad: "Endodoncista",
      comentario:
        "Los cursos de OdontoGeek han transformado mi práctica clínica. La calidad del contenido es excepcional.",
      rating: 5,
    },
    {
      nombre: "Dra. Ana Rodríguez",
      especialidad: "Ortodoncista",
      comentario: "Una plataforma increíble con instructores de primer nivel. Recomiendo totalmente sus programas.",
      rating: 5,
    },
    {
      nombre: "Dr. Miguel Torres",
      especialidad: "Cirujano Oral",
      comentario: "La flexibilidad de estudiar a mi ritmo y la calidad de los videos es impresionante.",
      rating: 5,
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navigation user={user} />

      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10" />
        <div className="absolute top-10 left-10 w-20 h-20 bg-blue-200 rounded-full opacity-50 animate-pulse" />
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-purple-200 rounded-full opacity-30 animate-pulse delay-1000" />

        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <div className="animate-fade-in-up">
            <Badge className="mb-6 bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0 px-4 py-2">
              <Sparkles className="w-4 h-4 mr-2" />
              Educación Odontológica de Excelencia
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Sobre OdontoGeek
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Somos la plataforma líder en educación odontológica online, comprometidos con formar profesionales de
              excelencia a través de contenido innovador y práctico.
            </p>
          </div>
        </div>
      </section>

      {/* Fundadora Section */}
      <section className="py-20 px-4 bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in-left">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-blue-400 to-purple-400 rounded-2xl opacity-20 blur-lg" />
                <div className="relative bg-white rounded-2xl p-8 shadow-xl">
                  <div className="w-64 h-64 mx-auto bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-6">
                    <img
                      src="/placeholder.svg?height=200&width=200&text=Foto+de+la+Fundadora"
                      alt="Fundadora de OdontoGeek"
                      className="w-48 h-48 rounded-full object-cover border-4 border-white shadow-lg"
                    />
                  </div>
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Dra. [Nombre de la Fundadora]</h3>
                    <p className="text-blue-600 font-semibold mb-4">Fundadora y Directora Académica</p>
                    <div className="flex flex-wrap justify-center gap-2">
                      <Badge variant="secondary">Especialista en Endodoncia</Badge>
                      <Badge variant="secondary">Magíster en Educación</Badge>
                      <Badge variant="secondary">15+ años experiencia</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="animate-fade-in-right">
              <h2 className="text-4xl font-bold mb-6 text-gray-900">
                Nuestra{" "}
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Fundadora
                </span>
              </h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  Con más de 15 años de experiencia en odontología clínica y educación, nuestra fundadora ha dedicado su
                  carrera a elevar los estándares de la educación odontológica en América Latina.
                </p>
                <p>
                  Graduada con honores de [Universidad], especialista en Endodoncia y con una Maestría en Educación,
                  combina su experiencia clínica con metodologías pedagógicas innovadoras.
                </p>
                <p>
                  Su visión de democratizar el acceso a educación odontológica de calidad la llevó a crear OdontoGeek,
                  una plataforma que ha transformado la vida profesional de miles de odontólogos.
                </p>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">5,000+</div>
                  <div className="text-sm text-gray-600">Estudiantes Impactados</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">150+</div>
                  <div className="text-sm text-gray-600">Cursos Creados</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Valores Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-4xl font-bold mb-6 text-gray-900">
              Nuestros{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Valores
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Los principios que guían cada decisión y nos mantienen comprometidos con la excelencia educativa.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {valores.map((valor, index) => (
              <Card
                key={index}
                className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-0 bg-white/80 backdrop-blur-sm animate-fade-in-up"
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <CardContent className="p-6 text-center">
                  <div
                    className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                  >
                    <valor.icon className={`w-8 h-8 ${valor.color}`} />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-gray-900">{valor.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{valor.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Logros Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-4xl font-bold mb-6">Nuestros Logros</h2>
            <p className="text-xl opacity-90 max-w-3xl mx-auto">
              Números que reflejan nuestro compromiso con la excelencia educativa
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {logros.map((logro, index) => (
              <div
                key={index}
                className="text-center animate-fade-in-up"
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <div className="text-5xl font-bold mb-2 bg-white bg-clip-text text-transparent">{logro.numero}</div>
                <div className="text-lg opacity-90">{logro.texto}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Misión y Visión */}
      <section className="py-20 px-4 bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12">
            <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm animate-fade-in-left">
              <CardContent className="p-8">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mr-4">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Nuestra Misión</h3>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  Democratizar el acceso a educación odontológica de excelencia, proporcionando herramientas y
                  conocimientos actualizados que permitan a los profesionales brindar la mejor atención a sus pacientes
                  y alcanzar el éxito en sus carreras.
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm animate-fade-in-right">
              <CardContent className="p-8">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mr-4">
                    <Eye className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Nuestra Visión</h3>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  Ser la plataforma educativa líder en América Latina para profesionales de la salud oral, reconocida
                  por la calidad de nuestros contenidos, la innovación en metodologías de enseñanza y el impacto
                  positivo en la práctica clínica de nuestros estudiantes.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonios */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-4xl font-bold mb-6 text-gray-900">
              Lo que dicen nuestros{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Estudiantes
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Testimonios reales de profesionales que han transformado su práctica con nuestros cursos.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonios.map((testimonio, index) => (
              <Card
                key={index}
                className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-0 bg-white/80 backdrop-blur-sm animate-fade-in-up"
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <Quote className="w-8 h-8 text-blue-500 opacity-50" />
                  </div>
                  <p className="text-gray-600 mb-6 leading-relaxed italic">"{testimonio.comentario}"</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-gray-900">{testimonio.nombre}</div>
                      <div className="text-sm text-gray-500">{testimonio.especialidad}</div>
                    </div>
                    <div className="flex">
                      {[...Array(testimonio.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="animate-fade-in-up">
            <h2 className="text-4xl font-bold mb-6">¿Listo para transformar tu práctica odontológica?</h2>
            <p className="text-xl mb-8 opacity-90">
              Únete a miles de profesionales que ya han elevado su nivel con nuestros cursos.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/courses">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 font-semibold px-8 py-3">
                  Explorar Cursos
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              {!user && (
                <Link href="/auth/register">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white text-white hover:bg-white hover:text-blue-600 font-semibold px-8 py-3 bg-transparent"
                  >
                    Crear Cuenta Gratis
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fade-in-left {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes fade-in-right {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
        }
        
        .animate-fade-in-left {
          animation: fade-in-left 0.8s ease-out forwards;
        }
        
        .animate-fade-in-right {
          animation: fade-in-right 0.8s ease-out forwards;
        }
      `}</style>
    </div>
  )
}
