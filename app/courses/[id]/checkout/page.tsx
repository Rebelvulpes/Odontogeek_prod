"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, Clock, Users, Award, CreditCard } from "lucide-react"

const courseData = {
  1: {
    title: "Implantología Avanzada",
    description: "Técnicas modernas de implantes dentales con casos clínicos reales",
    price: 299,
    originalPrice: 399,
    duration: "12 horas",
    lessons: 24,
    students: 1250,
    instructor: "Dr. María González",
    features: [
      "24 lecciones en video HD",
      "Casos clínicos reales",
      "Certificado de finalización",
      "Acceso de por vida",
      "Soporte del instructor",
      "Recursos descargables",
    ],
  },
}

export default function CheckoutPage() {
  const params = useParams()
  const courseId = params.id as string
  const course = courseData[courseId as keyof typeof courseData]
  const [isProcessing, setIsProcessing] = useState(false)

  const handlePayment = async () => {
    setIsProcessing(true)
    // Aquí implementarías la integración con Stripe
    console.log("Procesando pago para curso:", courseId)

    // Simular procesamiento
    setTimeout(() => {
      setIsProcessing(false)
      // Redirigir al dashboard con el curso desbloqueado
      window.location.href = "/dashboard"
    }, 2000)
  }

  if (!course) {
    return <div>Curso no encontrado</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Course Details */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="aspect-video bg-gray-200 rounded-lg mb-4">
                  <img
                    src="/placeholder.svg?height=200&width=400"
                    alt={course.title}
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
                <CardTitle className="text-2xl">{course.title}</CardTitle>
                <CardDescription className="text-base">{course.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">{course.duration}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">{course.students} estudiantes</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Award className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">Certificado incluido</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">{course.lessons} lecciones</span>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Lo que incluye este curso:</h3>
                  <ul className="space-y-2">
                    {course.features.map((feature, index) => (
                      <li key={index} className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Card */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Resumen de Compra
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{course.title}</span>
                  <div className="text-right">
                    <span className="text-lg font-bold">${course.price}</span>
                    {course.originalPrice && (
                      <div className="text-sm text-gray-500 line-through">${course.originalPrice}</div>
                    )}
                  </div>
                </div>

                {course.originalPrice && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Ahorra ${course.originalPrice - course.price}
                  </Badge>
                )}

                <Separator />

                <div className="flex justify-between items-center font-semibold text-lg">
                  <span>Total</span>
                  <span>${course.price}</span>
                </div>

                <Button onClick={handlePayment} className="w-full" size="lg" disabled={isProcessing}>
                  {isProcessing ? "Procesando..." : "Comprar Ahora"}
                </Button>

                <div className="text-center text-sm text-gray-500">
                  <p>Pago seguro con Stripe</p>
                  <p>Garantía de devolución de 30 días</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Instructor</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                    <Award className="w-6 h-6 text-gray-500" />
                  </div>
                  <div>
                    <p className="font-medium">{course.instructor}</p>
                    <p className="text-sm text-gray-600">Especialista en Implantología</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
