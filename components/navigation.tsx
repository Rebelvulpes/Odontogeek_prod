"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
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
import { Menu, User, Settings, LogOut, BookOpen, Users, BarChart3, Home, GraduationCap } from "lucide-react"

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
  const pathname = usePathname()

  const navigationLinks = [
    { href: "/", label: "Inicio", icon: Home },
    { href: "/courses", label: "Cursos", icon: BookOpen },
    { href: "/about", label: "Nosotros", icon: Users },
  ]

  const adminLinks = [
    { href: "/admin", label: "Panel Admin", icon: BarChart3 },
    { href: "/admin/users", label: "Usuarios", icon: Users },
  ]

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/"
    }
    return pathname.startsWith(href)
  }

  const handleLinkClick = () => {
    setIsOpen(false)
  }

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
            <div className="hidden">
              <GraduationCap className="h-8 w-8 text-blue-600" />
            </div>
            <span className="text-xl font-bold text-gray-900">OdontoGeek</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigationLinks.map((link) => {
              const Icon = link.icon
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(link.href)
                      ? "text-blue-600 bg-blue-50"
                      : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </Link>
              )
            })}

            {/* Admin Links */}
            {user?.role === "admin" && (
              <>
                {adminLinks.map((link) => {
                  const Icon = link.icon
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive(link.href)
                          ? "text-blue-600 bg-blue-50"
                          : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{link.label}</span>
                    </Link>
                  )
                })}
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
                      <AvatarFallback>
                        {user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
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
                  <DropdownMenuItem className="text-red-600">
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
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Abrir menú</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col h-full">
                  {/* Logo en el menú móvil */}
                  <div className="flex items-center space-x-2 pb-6 border-b">
                    <Link href="/" onClick={handleLinkClick} className="flex items-center space-x-2">
                      <img
                        src="/images/odontogeek-logo-new.png"
                        alt="OdontoGeek"
                        className="h-8 w-auto"
                        onError={(e) => {
                          e.currentTarget.style.display = "none"
                          e.currentTarget.nextElementSibling?.classList.remove("hidden")
                        }}
                      />
                      <div className="hidden">
                        <GraduationCap className="h-8 w-8 text-blue-600" />
                      </div>
                      <span className="text-xl font-bold text-gray-900">OdontoGeek</span>
                    </Link>
                  </div>

                  {/* User info */}
                  {user && (
                    <div className="py-6 border-b">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                          <AvatarFallback>
                            {user.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center space-x-2">
                            <p className="font-medium">{user.name}</p>
                            {user.role === "admin" && (
                              <Badge variant="secondary" className="text-xs">
                                Admin
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{user.email}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Navigation Links */}
                  <div className="flex-1 py-6">
                    <div className="space-y-1">
                      {navigationLinks.map((link) => {
                        const Icon = link.icon
                        return (
                          <Link
                            key={link.href}
                            href={link.href}
                            onClick={handleLinkClick}
                            className={`flex items-center space-x-3 px-3 py-3 rounded-md text-base font-medium transition-colors ${
                              isActive(link.href)
                                ? "text-blue-600 bg-blue-50"
                                : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                            }`}
                          >
                            <Icon className="w-5 h-5" />
                            <span>{link.label}</span>
                          </Link>
                        )
                      })}

                      {/* Admin Links */}
                      {user?.role === "admin" && (
                        <>
                          <div className="pt-4 pb-2">
                            <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                              Administración
                            </p>
                          </div>
                          {adminLinks.map((link) => {
                            const Icon = link.icon
                            return (
                              <Link
                                key={link.href}
                                href={link.href}
                                onClick={handleLinkClick}
                                className={`flex items-center space-x-3 px-3 py-3 rounded-md text-base font-medium transition-colors ${
                                  isActive(link.href)
                                    ? "text-blue-600 bg-blue-50"
                                    : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                                }`}
                              >
                                <Icon className="w-5 h-5" />
                                <span>{link.label}</span>
                              </Link>
                            )
                          })}
                        </>
                      )}

                      {/* User Menu Items */}
                      {user && (
                        <>
                          <div className="pt-4 pb-2">
                            <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                              Mi Cuenta
                            </p>
                          </div>
                          <Link
                            href="/dashboard"
                            onClick={handleLinkClick}
                            className="flex items-center space-x-3 px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors"
                          >
                            <User className="w-5 h-5" />
                            <span>Mi Perfil</span>
                          </Link>
                          <Link
                            href="/settings"
                            onClick={handleLinkClick}
                            className="flex items-center space-x-3 px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors"
                          >
                            <Settings className="w-5 h-5" />
                            <span>Configuración</span>
                          </Link>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Auth Buttons */}
                  <div className="border-t pt-6">
                    {user ? (
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={handleLinkClick}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Cerrar Sesión
                      </Button>
                    ) : (
                      <div className="space-y-2">
                        <Button asChild className="w-full">
                          <Link href="/auth/login" onClick={handleLinkClick}>
                            Iniciar Sesión
                          </Link>
                        </Button>
                        <Button variant="outline" asChild className="w-full bg-transparent">
                          <Link href="/auth/register" onClick={handleLinkClick}>
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
