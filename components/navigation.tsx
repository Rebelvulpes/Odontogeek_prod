"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Menu, Home, BookOpen, Users, Settings, LogOut, User, Shield } from "lucide-react"

interface NavigationProps {
  user?: {
    name: string
    email: string
    role: "admin" | "user"
    avatar?: string
  }
}

export function Navigation({ user }: NavigationProps) {
  const [isOpen, setIsOpen] = useState(false)

  const navigationLinks = [
    { href: "/", label: "Inicio", icon: Home },
    { href: "/courses", label: "Cursos", icon: BookOpen },
    { href: "/about", label: "Nosotros", icon: Users },
  ]

  const adminLinks = [
    { href: "/admin", label: "Panel Admin", icon: Shield },
    { href: "/admin/users", label: "Usuarios", icon: Users },
  ]

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <img
              src="/images/odontogeek-logo-new.png"
              alt="OdontoGeek"
              className="h-8 w-auto"
              onError={(e) => {
                e.currentTarget.style.display = "none"
                e.currentTarget.nextElementSibling?.classList.remove("hidden")
              }}
            />
            <div className="hidden text-xl font-bold text-blue-600">OdontoGeek</div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigationLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors"
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
                    className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors flex items-center space-x-1"
                  >
                    <link.icon className="w-4 h-4" />
                    <span>{link.label}</span>
                  </Link>
                ))}
              </>
            )}
          </div>

          {/* User Menu / Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                      <AvatarFallback className="bg-blue-100 text-blue-600">
                        {user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <div className="flex items-center space-x-2">
                        <p className="font-medium">{user.name}</p>
                        {user.role === "admin" && (
                          <Badge variant="secondary" className="text-xs">
                            Admin
                          </Badge>
                        )}
                      </div>
                      <p className="w-[200px] truncate text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      <span>Mi Perfil</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Configuración</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="flex items-center text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Cerrar Sesión</span>
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

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="h-10 w-10 p-0">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Abrir menú</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col h-full">
                  {/* Header */}
                  <div className="flex items-center justify-between pb-4 border-b">
                    <Link href="/" onClick={() => setIsOpen(false)} className="flex items-center space-x-2">
                      <img
                        src="/images/odontogeek-logo-new.png"
                        alt="OdontoGeek"
                        className="h-8 w-auto"
                        onError={(e) => {
                          e.currentTarget.style.display = "none"
                          e.currentTarget.nextElementSibling?.classList.remove("hidden")
                        }}
                      />
                      <div className="hidden text-xl font-bold text-blue-600">OdontoGeek</div>
                    </Link>
                  </div>

                  {/* Navigation Links */}
                  <div className="flex-1 py-6">
                    <div className="space-y-1">
                      {navigationLinks.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={() => setIsOpen(false)}
                          className="flex items-center space-x-3 px-3 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <link.icon className="w-5 h-5" />
                          <span className="font-medium">{link.label}</span>
                        </Link>
                      ))}

                      {user?.role === "admin" && (
                        <>
                          <div className="my-4 border-t border-gray-200" />
                          <div className="px-3 py-2">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                              Administración
                            </p>
                          </div>
                          {adminLinks.map((link) => (
                            <Link
                              key={link.href}
                              href={link.href}
                              onClick={() => setIsOpen(false)}
                              className="flex items-center space-x-3 px-3 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <link.icon className="w-5 h-5" />
                              <span className="font-medium">{link.label}</span>
                            </Link>
                          ))}
                        </>
                      )}
                    </div>
                  </div>

                  {/* User Section */}
                  <div className="border-t pt-6">
                    {user ? (
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3 px-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                            <AvatarFallback className="bg-blue-100 text-blue-600">
                              {user.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <p className="font-medium text-gray-900 truncate">{user.name}</p>
                              {user.role === "admin" && (
                                <Badge variant="secondary" className="text-xs">
                                  Admin
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-500 truncate">{user.email}</p>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <Link
                            href="/dashboard"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center space-x-3 px-3 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <User className="w-5 h-5" />
                            <span className="font-medium">Mi Perfil</span>
                          </Link>
                          <Link
                            href="/settings"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center space-x-3 px-3 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Settings className="w-5 h-5" />
                            <span className="font-medium">Configuración</span>
                          </Link>
                          <button className="flex items-center space-x-3 px-3 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors w-full text-left">
                            <LogOut className="w-5 h-5" />
                            <span className="font-medium">Cerrar Sesión</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <Button asChild className="w-full">
                          <Link href="/auth/login" onClick={() => setIsOpen(false)}>
                            Iniciar Sesión
                          </Link>
                        </Button>
                        <Button variant="outline" asChild className="w-full bg-transparent">
                          <Link href="/auth/register" onClick={() => setIsOpen(false)}>
                            Registrarse
                          </Link>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  )
}
