"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { User, LogOut, Settings } from "lucide-react"

interface NavigationProps {
  user?: {
    name: string
    email: string
    role?: string
  } | null
}

export function Navigation({ user }: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  return (
    <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Logo - Mobile optimized */}
          <div className="flex-shrink-0">
            <img
              src="/images/odontogeek-logo-new.png"
              alt="OdontoGeek"
              className="h-8 sm:h-10 md:h-12 w-auto max-w-[120px] sm:max-w-[150px] md:max-w-[200px]"
            />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6">
            <Link href="/courses" className="text-gray-600 hover:text-blue-600 transition-colors">
              Cursos
            </Link>
            <Link href="/about" className="text-gray-600 hover:text-blue-600 transition-colors">
              Nosotros
            </Link>
            <Link href="/contact" className="text-gray-600 hover:text-blue-600 transition-colors">
              Contacto
            </Link>
            {user?.role === "admin" && (
              <Link href="/admin" className="text-gray-600 hover:text-blue-600 transition-colors">
                Admin
              </Link>
            )}
          </nav>

          {/* Auth Buttons - Mobile optimized */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="hidden sm:flex flex-col">
                    <span className="text-sm font-medium text-gray-900">{user.name}</span>
                    <span className="text-xs text-gray-500">{user.email}</span>
                  </div>
                  {user.role === "admin" && (
                    <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                      Admin
                    </Badge>
                  )}
                </div>
                <Button variant="ghost" size="sm" className="hidden sm:flex">
                  <Settings className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" className="hidden sm:flex">
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm" className="text-xs sm:text-sm px-2 sm:px-3">
                    Iniciar Sesión
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button size="sm" className="text-xs sm:text-sm px-2 sm:px-3">
                    Registrarse
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
