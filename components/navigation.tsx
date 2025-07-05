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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Menu, Home, BookOpen, Settings, LogOut, Shield, Users, BarChart3 } from "lucide-react"

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
    { href: "/contact", label: "Contacto", icon: Settings },
  ]

  const adminLinks = [
    { href: "/admin", label: "Panel Admin", icon: BarChart3 },
    { href: "/admin/users", label: "Usuarios", icon: Users },
  ]

  const userMenuItems = [
    { href: "/dashboard", label: "Mi Dashboard", icon: Users },
    { href: "/profile", label: "Mi Perfil", icon: Settings },
    { href: "/settings", label: "Configuración", icon: Settings },
  ]

  const handleLinkClick = () => {
    setIsOpen(false)
  }

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/images/odontogeek-logo-new.png"
              alt="OdontoGeek"
              width={40}
              height={40}
              className="w-8 h-8 sm:w-10 sm:h-10"
            />
            <span className="text-xl sm:text-2xl font-bold text-gray-900">OdontoGeek</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigationLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <link.icon className="w-4 h-4" />
                <span>{link.label}</span>
              </Link>
            ))}

            {/* Admin Links for Admin Users */}
            {user?.role === "admin" && (
              <>
                <div className="w-px h-6 bg-gray-300" />
                {adminLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center space-x-1 text-orange-600 hover:text-orange-700 transition-colors"
                  >
                    <link.icon className="w-4 h-4" />
                    <span>{link.label}</span>
                  </Link>
                ))}
              </>
            )}
          </div>

          {/* Desktop User Menu or Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
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
                  {userMenuItems.map((item) => (
                    <DropdownMenuItem key={item.href} asChild>
                      <Link href={item.href} className="flex items-center space-x-2">
                        <item.icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </Link>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600 focus:text-red-600">
                    <LogOut className="w-4 h-4 mr-2" />
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

          {/* Mobile Menu Button */}
          <div className="md:hidden">
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
                      <Image
                        src="/images/odontogeek-logo-new.png"
                        alt="OdontoGeek"
                        width={32}
                        height={32}
                        className="w-8 h-8"
                      />
                      <span className="text-xl font-bold text-gray-900">OdontoGeek</span>
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
                      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Navegación</h3>
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

                      {/* Admin Links */}
                      {user?.role === "admin" && (
                        <>
                          <div className="pt-4">
                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                              Administración
                            </h3>
                            {adminLinks.map((link) => (
                              <Link
                                key={link.href}
                                href={link.href}
                                onClick={handleLinkClick}
                                className="flex items-center space-x-3 px-3 py-2 rounded-md text-orange-600 hover:text-orange-700 hover:bg-orange-50 transition-colors"
                              >
                                <link.icon className="w-5 h-5" />
                                <span>{link.label}</span>
                              </Link>
                            ))}
                          </div>
                        </>
                      )}

                      {/* User Menu Items */}
                      {user && (
                        <div className="pt-4">
                          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                            Mi Cuenta
                          </h3>
                          {userMenuItems.map((item) => (
                            <Link
                              key={item.href}
                              href={item.href}
                              onClick={handleLinkClick}
                              className="flex items-center space-x-3 px-3 py-2 rounded-md text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            >
                              <item.icon className="w-5 h-5" />
                              <span>{item.label}</span>
                            </Link>
                          ))}
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
    </nav>
  )
}
