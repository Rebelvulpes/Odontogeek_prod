"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Menu, BookOpen, Users, Award, Phone, LogIn, UserPlus, Settings, LogOut, User } from "lucide-react"

interface NavigationProps {
  user: any | null
}

export function Navigation({ user: initialUser }: NavigationProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState<any | null>(initialUser)

  // Sincronizar con el prop user cuando cambie
  useEffect(() => {
    setUser(initialUser)
  }, [initialUser])

  const navigationItems = [
    { name: "Cursos", href: "/courses", icon: BookOpen },
    { name: "Nosotros", href: "/nosotros", icon: Users },
    { name: "Certificaciones", href: "/certifications", icon: Award },
    { name: "Contacto", href: "/contact", icon: Phone },
  ]

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      })

      if (response.ok) {
        setUser(null)
        window.location.href = "/"
      }
    } catch (error) {
      console.error("Error during logout:", error)
    }
  }

  const getUserDisplayName = () => {
    if (!user) return ""
    if (user.name) return user.name
    if (user.first_name && user.last_name) return `${user.first_name} ${user.last_name}`
    if (user.first_name) return user.first_name
    return user.email.split("@")[0]
  }

  const getUserInitials = () => {
    const displayName = getUserDisplayName()
    if (!displayName) return "U"

    const names = displayName.split(" ")
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase()
    }
    return displayName.substring(0, 2).toUpperCase()
  }

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
                {/* Botón Mi Dashboard */}
                <Link href={user.role === "admin" ? "/admin" : "/dashboard"}>
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                    Mi Dashboard
                  </Button>
                </Link>

                <span className="text-gray-700">Hola, {getUserDisplayName()}</span>

                {/* User Avatar Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar_url || "/placeholder.svg"} alt={getUserDisplayName()} />
                        <AvatarFallback>{getUserInitials()}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuItem asChild>
                      <Link href={user.role === "admin" ? "/admin" : "/dashboard"} className="flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        <span>{user.role === "admin" ? "Panel de Admin" : "Mi Dashboard"}</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="flex items-center">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Configuración</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout} className="flex items-center text-red-600">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Cerrar Sesión</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
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
                      <div className="flex items-center space-x-3 p-2">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.avatar_url || "/placeholder.svg"} alt={getUserDisplayName()} />
                          <AvatarFallback>{getUserInitials()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="text-gray-900 font-medium">{getUserDisplayName()}</div>
                          <div className="text-gray-500 text-sm">{user.email}</div>
                        </div>
                      </div>

                      {/* Botón Mi Dashboard para móvil */}
                      <Link href={user.role === "admin" ? "/admin" : "/dashboard"} onClick={() => setIsOpen(false)}>
                        <Button className="w-full justify-center bg-blue-600 hover:bg-blue-700 text-white">
                          Mi Dashboard
                        </Button>
                      </Link>

                      <Link href={user.role === "admin" ? "/admin" : "/dashboard"} onClick={() => setIsOpen(false)}>
                        <Button variant="outline" className="w-full justify-start bg-transparent">
                          <User className="w-4 h-4 mr-2" />
                          {user.role === "admin" ? "Panel de Admin" : "Mi Dashboard"}
                        </Button>
                      </Link>

                      <Link href="/profile" onClick={() => setIsOpen(false)}>
                        <Button variant="outline" className="w-full justify-start bg-transparent">
                          <Settings className="w-4 h-4 mr-2" />
                          Configuración
                        </Button>
                      </Link>

                      <Button
                        variant="outline"
                        className="w-full justify-start bg-transparent text-red-600 border-red-200 hover:bg-red-50"
                        onClick={() => {
                          setIsOpen(false)
                          handleLogout()
                        }}
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Cerrar Sesión
                      </Button>
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
