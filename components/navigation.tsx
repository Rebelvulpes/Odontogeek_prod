"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Menu, Home, BookOpen, Users, Phone, Shield, LogOut, Settings, User } from "lucide-react"

interface NavigationProps {
  user?: {
    name: string
    email: string
    role?: string
    avatar?: string
  }
}

export function Navigation({ user }: NavigationProps) {
  const [isOpen, setIsOpen] = useState(false)

  const navigationLinks = [
    { href: "/", label: "Inicio", icon: Home },
    { href: "/courses", label: "Cursos", icon: BookOpen },
    { href: "/about", label: "Nosotros", icon: Users },
    { href: "/contact", label: "Contacto", icon: Phone },
  ]

  const handleLinkClick = () => {
    setIsOpen(false)
  }

  return (
    <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Logo - Mobile optimized */}
          <div className="flex-shrink-0">
            <Link href="/">
              <img
                src="/images/odontogeek-logo-new.png"
                alt="OdontoGeek"
                className="h-8 sm:h-10 md:h-12 w-auto max-w-[120px] sm:max-w-[150px] md:max-w-[200px]"
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6">
            {navigationLinks.map((link) => (
              <Link key={link.href} href={link.href} className="text-gray-600 hover:text-blue-600 transition-colors">
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Auth Buttons - Mobile optimized */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                      <AvatarFallback className="bg-blue-500 text-white">
                        {user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium leading-none">{user.name}</p>
                        {user.role === "admin" && (
                          <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-700">
                            <Shield className="w-3 h-3 mr-1" />
                            Admin
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="flex items-center space-x-2">
                      <User className="w-4 h-4" />
                      <span>Mi Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center space-x-2">
                      <Settings className="w-4 h-4" />
                      <span>Mi Perfil</span>
                    </Link>
                  </DropdownMenuItem>
                  {user.role === "admin" && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="flex items-center space-x-2 text-orange-600">
                          <Shield className="w-4 h-4" />
                          <span>Panel Admin</span>
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600 focus:text-red-600">
                    <LogOut className="w-4 h-4 mr-2" />
                    <span>Cerrar Sesión</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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

            {/* Mobile Menu Button */}
            <div className="lg:hidden">
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-2">
                    <Menu className="w-6 h-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80 p-0">
                  <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b">
                      <Link href="/" onClick={handleLinkClick} className="flex items-center space-x-2">
                        <img src="/images/odontogeek-logo-new.png" alt="OdontoGeek" className="h-8 w-auto" />
                      </Link>
                    </div>

                    {/* User Info */}
                    {user && (
                      <div className="p-6 border-b bg-gray-50">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                            <AvatarFallback className="bg-blue-500 text-white">
                              {user.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                              {user.role === "admin" && (
                                <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-700">
                                  <Shield className="w-3 h-3 mr-1" />
                                  Admin
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 truncate">{user.email}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Navigation Links */}
                    <div className="flex-1 py-6">
                      <div className="px-6 space-y-1">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                          Navegación
                        </h3>
                        {navigationLinks.map((link) => (
                          <Link
                            key={link.href}
                            href={link.href}
                            onClick={handleLinkClick}
                            className="flex items-center space-x-3 px-3 py-2 rounded-md text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          >
                            <link.icon className="w-5 h-5" />
                            <span>{link.label}</span>
                          </Link>
                        ))}

                        {/* User Menu Items */}
                        {user && (
                          <div className="pt-4">
                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                              Mi Cuenta
                            </h3>
                            <Link
                              href="/dashboard"
                              onClick={handleLinkClick}
                              className="flex items-center space-x-3 px-3 py-2 rounded-md text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            >
                              <User className="w-5 h-5" />
                              <span>Mi Dashboard</span>
                            </Link>
                            <Link
                              href="/profile"
                              onClick={handleLinkClick}
                              className="flex items-center space-x-3 px-3 py-2 rounded-md text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            >
                              <Settings className="w-5 h-5" />
                              <span>Mi Perfil</span>
                            </Link>
                            {user.role === "admin" && (
                              <Link
                                href="/admin"
                                onClick={handleLinkClick}
                                className="flex items-center space-x-3 px-3 py-2 rounded-md text-orange-600 hover:text-orange-700 hover:bg-orange-50 transition-colors"
                              >
                                <Shield className="w-5 h-5" />
                                <span>Panel Admin</span>
                              </Link>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="p-6 border-t bg-gray-50">
                      {user ? (
                        <Button
                          variant="ghost"
                          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={handleLinkClick}
                        >
                          <LogOut className="w-5 h-5 mr-3" />
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
      </div>
    </header>
  )
}
