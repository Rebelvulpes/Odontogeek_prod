"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Calendar, TrendingUp, Users, Award } from "lucide-react"

const newsItems = [
  {
    id: 1,
    type: "course",
    icon: Award,
    text: "Nuevo curso disponible: Cirugía Oral Avanzada - ¡Inscríbete ahora!",
    badge: "Nuevo",
    badgeColor: "bg-green-500",
  },
  {
    id: 2,
    type: "event",
    icon: Calendar,
    text: "Webinar gratuito: 'Tendencias en Odontología Digital' - 25 de Marzo, 7:00 PM",
    badge: "Gratis",
    badgeColor: "bg-blue-500",
  },
  {
    id: 3,
    type: "milestone",
    icon: Users,
    text: "¡Celebramos 10,000 profesionales capacitados en nuestra plataforma!",
    badge: "Logro",
    badgeColor: "bg-purple-500",
  },
  {
    id: 4,
    type: "promotion",
    icon: TrendingUp,
    text: "Oferta especial: 30% de descuento en todos los cursos hasta fin de mes",
    badge: "Oferta",
    badgeColor: "bg-red-500",
  },
]

export function NewsTicker() {
  const [currentNews, setCurrentNews] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentNews((prev) => (prev + 1) % newsItems.length)
    }, 4000)

    return () => clearInterval(interval)
  }, [])

  const currentItem = newsItems[currentNews]

  return (
    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center space-x-4 animate-fade-in">
          <Badge className={`${currentItem.badgeColor} text-white border-0 text-xs px-2 py-1`}>
            {currentItem.badge}
          </Badge>

          <div className="flex items-center space-x-2">
            <currentItem.icon className="w-4 h-4" />
            <span className="text-sm md:text-base font-medium">{currentItem.text}</span>
          </div>

          {/* Progress dots */}
          <div className="hidden md:flex space-x-1">
            {newsItems.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentNews ? "bg-white" : "bg-white/40"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
