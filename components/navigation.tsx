"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, BookOpen, Users, Award, Phone, LogIn, UserPlus } from "lucide-react"

interface User {
  name: string
  email: string
  role?: string
}

interface NavigationProps {
  user: User | null
}

export function Navigation({ user }: NavigationProps) {
  const [isOpen, setIsOpen] = useState(false)

  const navigationItems = [
    { name: "Cursos", href: "/courses", icon: BookOpen },
    { name: "Nosotros", href: "/about", icon: Users },
    { name: "Certificaciones", href: "/certifications", icon: Award },
    { name: "Contacto", href: "/contact", icon: Phone },
  ]

  return (
    <header className="bg-white border-b sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <img src="/images/odontogeek-logo-new.png" alt="OdontoGeek" className="h-8 w-auto" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200 flex items-center space-x-1"
              >
                <item.icon className="w-4 h-4" />
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-3">
                <span className="text-gray-700">Hola, {user.name}</span>
                {user.role === "admin" && (
                  <Link href="/admin">
                    <Button variant="outline" size="sm">
                      Admin
                    </Button>
                  </Link>
                )}
                <Link href="/dashboard">
                  <Button variant="outline" size="sm">
                    Mi Panel
                  </Button>
                </Link>
              </div>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm" className="flex items-center space-x-1">
                    <LogIn className="w-4 h-4" />
                    <span>Iniciar Sesión</span>
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button size="sm" className="flex items-center space-x-1">
                    <UserPlus className="w-4 h-4" />
                    <span>Registrarse</span>
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="sm">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <div className="flex flex-col h-full">
                {/* Mobile Logo */}
                <div className="flex items-center justify-between pb-6 border-b">
                  <Link href="/" className="flex items-center space-x-2" onClick={() => setIsOpen(false)}>
                    <img src="/images/odontogeek-logo-new.png" alt="OdontoGeek" className="h-8 w-auto" />
                  </Link>
                </div>

                {/* Mobile Navigation */}
                <nav className="flex-1 py-6">
                  <div className="space-y-4">
                    {navigationItems.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200 py-2"
                        onClick={() => setIsOpen(false)}
                      >
                        <item.icon className="w-5 h-5" />
                        <span>{item.name}</span>
                      </Link>
                    ))}
                  </div>
                </nav>

                {/* Mobile Auth Buttons */}
                <div className="border-t pt-6 space-y-3">
                  {user ? (
                    <div className="space-y-3">
                      <div className="text-gray-700 font-medium">Hola, {user.name}</div>
                      {user.role === "admin" && (
                        <Link href="/admin" onClick={() => setIsOpen(false)}>
                          <Button variant="outline" className="w-full justify-start bg-transparent">
                            <Users className="w-4 h-4 mr-2" />
                            Panel de Admin
                          </Button>
                        </Link>
                      )}
                      <Link href="/dashboard" onClick={() => setIsOpen(false)}>
                        <Button variant="outline" className="w-full justify-start bg-transparent">
                          <BookOpen className="w-4 h-4 mr-2" />
                          Mi Panel
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <>
                      <Link href="/auth/login" onClick={() => setIsOpen(false)}>
                        <Button variant="outline" className="w-full justify-start bg-transparent">
                          <LogIn className="w-4 h-4 mr-2" />
                          Iniciar Sesión
                        </Button>
                      </Link>
                      <Link href="/auth/register" onClick={() => setIsOpen(false)}>
                        <Button className="w-full justify-start">
                          <UserPlus className="w-4 h-4 mr-2" />
                          Registrarse
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
