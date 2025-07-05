"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X, User } from "lucide-react"

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <img src="/images/odontogeek-logo-new.png" alt="OdontoGeek" className="h-8 w-auto" />
            <span className="font-bold text-xl text-gray-900">OdontoGeek</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
              Inicio
            </Link>
            <Link href="/courses" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
              Cursos
            </Link>
            <Link href="/about" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
              Nosotros
            </Link>
            <Link href="/contact" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
              Contacto
            </Link>
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/auth/login">
              <Button variant="ghost" className="text-gray-700 hover:text-blue-600">
                <User className="w-4 h-4 mr-2" />
                Iniciar Sesión
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">Registrarse</Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="md:hidden p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-100"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t bg-white">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link
                href="/"
                className="block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Inicio
              </Link>
              <Link
                href="/courses"
                className="block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Cursos
              </Link>
              <Link
                href="/about"
                className="block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Nosotros
              </Link>
              <Link
                href="/contact"
                className="block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Contacto
              </Link>
              <div className="border-t pt-3 mt-3">
                <Link
                  href="/auth/login"
                  className="block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <User className="w-4 h-4 mr-2 inline" />
                  Iniciar Sesión
                </Link>
                <Link
                  href="/auth/register"
                  className="block px-3 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-md font-medium mt-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Registrarse
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
