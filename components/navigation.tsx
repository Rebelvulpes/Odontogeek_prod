"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Menu, User, Settings, LogOut, BookOpen, Users, BarChart3, Home, Phone, Info } from "lucide-react"

interface NavigationProps {
  user?: {
    name: string
    email: string
    role: "admin" | "user"
  }
}

export function Navigation({ user }: NavigationProps) {
  const [isOpen, setIsOpen] = useState(false)

  const navigationLinks = [
    { href: "/", label: "Inicio", icon: Home },
    { href: "/courses", label: "Cursos", icon: BookOpen },
    { href: "/about", label: "Nosotros", icon: Info },
    { href: "/contact", label: "Contacto", icon: Phone },
  ]

  const adminLinks = [
    { href: "/admin", label: "Panel Admin", icon: BarChart3 },
    { href: "/admin/users", label: "Usuarios", icon: Users },
  ]

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/images/odontogeek-logo-new.png"
              alt="OdontoGeek"
              width={40}
              height={40}
              className="w-10 h-10"
            />
            <span className="text-xl font-bold text-gray-900">OdontoGeek</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigationLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-gray-600 hover:text-blue-600 transition-colors font-medium"
              >
                {link.label}
              </Link>
            ))}

            {user?.role === "admin" && (
              <>
                <div className="w-px h-6 bg-gray-300" />
                {adminLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-gray-600 hover:text-blue-600 transition-colors font-medium"
                  >
                    {link.label}
                  </Link>
                ))}
              </>
            )}
          </div>

          {/* Desktop User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      <div className="flex items-center space-x-1">
                        <div className="text-xs text-gray-500">{user.email}</div>
                        {user.role === "admin" && (
                          <Badge variant="secondary" className="text-xs">
                            Admin
                          </Badge>
                        )}
                      </div>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="flex items-center">
                      <User className="w-4 h-4 mr-2" />
                      Mi Perfil
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="flex items-center">
                      <Settings className="w-4 h-4 mr-2" />
                      Configuración
                    </Link>
                  </DropdownMenuItem>
                  {user.role === "admin" && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="flex items-center">
                          <BarChart3 className="w-4 h-4 mr-2" />
                          Panel Admin
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600">
                    <LogOut className="w-4 h-4 mr-2" />
                    Cerrar Sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" asChild>
                  <Link href="/auth/login">Iniciar Sesión</Link>
                </Button>
                <Button asChild>
                  <Link href="/auth/register">Registrarse</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <div className="flex flex-col h-full">
                {/* Mobile Logo */}
                <div className="flex items-center space-x-2 pb-6 border-b">
                  <Link href="/" onClick={() => setIsOpen(false)} className="flex items-center space-x-2">
                    <Image
                      src="/images/odontogeek-logo-new.png"
                      alt="OdontoGeek"
                      width={32}
                      height={32}
                      className="w-8 h-8"
                    />
                    <span className="text-lg font-bold text-gray-900">OdontoGeek</span>
                  </Link>
                </div>

                {/* Mobile Navigation Links */}
                <div className="flex-1 py-6">
                  <div className="space-y-1">
                    {navigationLinks.map((link) => {
                      const Icon = link.icon
                      return (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={() => setIsOpen(false)}
                          className="flex items-center space-x-3 px-3 py-2 rounded-md text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        >
                          <Icon className="w-5 h-5" />
                          <span className="font-medium">{link.label}</span>
                        </Link>
                      )
                    })}

                    {user?.role === "admin" && (
                      <>
                        <div className="my-4 border-t border-gray-200" />
                        <div className="px-3 py-2">
                          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Administración
                          </div>
                        </div>
                        {adminLinks.map((link) => {
                          const Icon = link.icon
                          return (
                            <Link
                              key={link.href}
                              href={link.href}
                              onClick={() => setIsOpen(false)}
                              className="flex items-center space-x-3 px-3 py-2 rounded-md text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            >
                              <Icon className="w-5 h-5" />
                              <span className="font-medium">{link.label}</span>
                            </Link>
                          )
                        })}
                      </>
                    )}
                  </div>
                </div>

                {/* Mobile User Section */}
                <div className="border-t pt-6">
                  {user ? (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3 px-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="flex items-center space-x-2">
                            <div className="text-xs text-gray-500">{user.email}</div>
                            {user.role === "admin" && (
                              <Badge variant="secondary" className="text-xs">
                                Admin
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <Link
                          href="/dashboard"
                          onClick={() => setIsOpen(false)}
                          className="flex items-center space-x-3 px-3 py-2 rounded-md text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        >
                          <User className="w-5 h-5" />
                          <span className="font-medium">Mi Perfil</span>
                        </Link>
                        <Link
                          href="/settings"
                          onClick={() => setIsOpen(false)}
                          className="flex items-center space-x-3 px-3 py-2 rounded-md text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        >
                          <Settings className="w-5 h-5" />
                          <span className="font-medium">Configuración</span>
                        </Link>
                        <button className="flex items-center space-x-3 px-3 py-2 rounded-md text-red-600 hover:bg-red-50 transition-colors w-full text-left">
                          <LogOut className="w-5 h-5" />
                          <span className="font-medium">Cerrar Sesión</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Button asChild className="w-full" onClick={() => setIsOpen(false)}>
                        <Link href="/auth/login">Iniciar Sesión</Link>
                      </Button>
                      <Button
                        variant="outline"
                        asChild
                        className="w-full bg-transparent"
                        onClick={() => setIsOpen(false)}
                      >
                        <Link href="/auth/register">Registrarse</Link>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  )
}
