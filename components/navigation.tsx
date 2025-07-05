"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Menu, User, LogOut, Users, BarChart3 } from "lucide-react"

interface NavigationProps {
  user?: {
    name: string
    email: string
    role?: string
  }
}

export function Navigation({ user }: NavigationProps) {
  const [isOpen, setIsOpen] = useState(false)

  const navItems = [
    { href: "/", label: "Inicio" },
    { href: "/courses", label: "Cursos" },
    { href: "/about", label: "Nosotros" },
    { href: "/contact", label: "Contacto" },
  ]

  const adminItems = [
    { href: "/admin", label: "Panel Admin", icon: BarChart3 },
    { href: "/admin/users", label: "Usuarios", icon: Users },
  ]

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="relative w-8 h-8 sm:w-10 sm:h-10">
              <Image src="/images/odontogeek-logo-new.png" alt="OdontoGeek" fill className="object-contain" priority />
            </div>
            <span className="text-xl sm:text-2xl font-bold text-blue-600">OdontoGeek</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
              >
                {item.label}
              </Link>
            ))}

            {/* Admin Links */}
            {user?.role === "admin" && (
              <>
                {adminItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors font-medium"
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                ))}
              </>
            )}

            {/* User Section */}
            {user ? (
              <div className="flex items-center space-x-4">
                {user.role === "admin" && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800 font-medium">
                    Admin
                  </Badge>
                )}
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="hidden lg:block">
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link href="/auth/login">
                  <Button variant="ghost">Iniciar Sesión</Button>
                </Link>
                <Link href="/auth/register">
                  <Button>Registrarse</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-500 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block py-2 text-gray-700 hover:text-blue-600 transition-colors font-medium"
                >
                  {item.label}
                </Link>
              ))}

              {/* Admin Links */}
              {user?.role === "admin" && (
                <>
                  {adminItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center space-x-1 py-2 text-gray-700 hover:text-blue-600 transition-colors font-medium"
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </Link>
                  ))}
                </>
              )}

              {/* User Section */}
              {user ? (
                <div className="flex flex-col items-start space-y-2 pt-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-start space-y-2 pt-4">
                  <Link href="/auth/login">
                    <Button variant="ghost">Iniciar Sesión</Button>
                  </Link>
                  <Link href="/auth/register">
                    <Button>Registrarse</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
