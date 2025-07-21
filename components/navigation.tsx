"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
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
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Settings, LogOut, Menu, BookOpen, GraduationCap, Users, BarChart3, Shield, Home, Info } from "lucide-react"

interface NavigationProps {
  user: any | null
}

function getUserDisplayName(user: any | null): string {
  if (!user) return "Usuario"

  // Verificar si user.email existe y es string antes de usar split
  if (user.first_name && user.last_name) {
    return `${user.first_name} ${user.last_name}`
  }

  if (user.name) {
    return user.name
  }

  if (user.email && typeof user.email === "string") {
    return user.email.split("@")[0]
  }

  return "Usuario"
}

function getUserInitials(user: any | null): string {
  if (!user) return "U"

  const displayName = getUserDisplayName(user)

  if (displayName === "Usuario") {
    return "U"
  }

  const names = displayName.split(" ")
  if (names.length >= 2) {
    return `${names[0][0]}${names[1][0]}`.toUpperCase()
  }

  return displayName.substring(0, 2).toUpperCase()
}

export function Navigation({ user }: NavigationProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      })

      if (response.ok) {
        router.push("/")
        router.refresh()
      }
    } catch (error) {
      console.error("Error during logout:", error)
    }
  }

  const navItems = [
    { href: "/", label: "Inicio", icon: Home },
    { href: "/courses", label: "Cursos", icon: BookOpen },
    { href: "/nosotros", label: "Nosotros", icon: Info },
  ]

  const userMenuItems = user
    ? [
        { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
        { href: "/profile", label: "Perfil", icon: GraduationCap },
        { href: "/settings", label: "Configuración", icon: Settings },
      ]
    : []

  const adminMenuItems =
    user?.role === "admin"
      ? [
          { href: "/admin", label: "Panel Admin", icon: Shield },
          { href: "/admin/users", label: "Usuarios", icon: Users },
        ]
      : []

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">OdontoGeek</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-gray-600 hover:text-blue-600 transition-colors font-medium"
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* User Menu / Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatar_url || "/placeholder.svg"} alt={getUserDisplayName(user)} />
                      <AvatarFallback className="bg-blue-600 text-white">{getUserInitials(user)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{getUserDisplayName(user)}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email && typeof user.email === "string" ? user.email : "Sin email"}
                      </p>
                      {user.role === "admin" && (
                        <Badge variant="secondary" className="w-fit text-xs">
                          Administrador
                        </Badge>
                      )}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  {userMenuItems.map((item) => {
                    const Icon = item.icon
                    return (
                      <DropdownMenuItem key={item.href} asChild>
                        <Link href={item.href} className="flex items-center">
                          <Icon className="mr-2 h-4 w-4" />
                          <span>{item.label}</span>
                        </Link>
                      </DropdownMenuItem>
                    )
                  })}

                  {adminMenuItems.length > 0 && (
                    <>
                      <DropdownMenuSeparator />
                      {adminMenuItems.map((item) => {
                        const Icon = item.icon
                        return (
                          <DropdownMenuItem key={item.href} asChild>
                            <Link href={item.href} className="flex items-center">
                              <Icon className="mr-2 h-4 w-4" />
                              <span>{item.label}</span>
                            </Link>
                          </DropdownMenuItem>
                        )
                      })}
                    </>
                  )}

                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600">
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

          {/* Mobile Menu */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="flex flex-col space-y-4 mt-4">
                  {/* User Info */}
                  {user && (
                    <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={user.avatar_url || "/placeholder.svg"} alt={getUserDisplayName(user)} />
                        <AvatarFallback className="bg-blue-600 text-white">{getUserInitials(user)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{getUserDisplayName(user)}</p>
                        <p className="text-xs text-gray-500 truncate">
                          {user.email && typeof user.email === "string" ? user.email : "Sin email"}
                        </p>
                        {user.role === "admin" && (
                          <Badge variant="secondary" className="text-xs mt-1">
                            Admin
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Navigation Items */}
                  <div className="space-y-2">
                    {navItems.map((item) => {
                      const Icon = item.icon
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setIsOpen(false)}
                          className="flex items-center space-x-3 px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100"
                        >
                          <Icon className="h-5 w-5" />
                          <span>{item.label}</span>
                        </Link>
                      )
                    })}
                  </div>

                  {user && (
                    <>
                      <div className="border-t pt-4 space-y-2">
                        {userMenuItems.map((item) => {
                          const Icon = item.icon
                          return (
                            <Link
                              key={item.href}
                              href={item.href}
                              onClick={() => setIsOpen(false)}
                              className="flex items-center space-x-3 px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100"
                            >
                              <Icon className="h-5 w-5" />
                              <span>{item.label}</span>
                            </Link>
                          )
                        })}
                      </div>

                      {adminMenuItems.length > 0 && (
                        <div className="border-t pt-4 space-y-2">
                          {adminMenuItems.map((item) => {
                            const Icon = item.icon
                            return (
                              <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsOpen(false)}
                                className="flex items-center space-x-3 px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100"
                              >
                                <Icon className="h-5 w-5" />
                                <span>{item.label}</span>
                              </Link>
                            )
                          })}
                        </div>
                      )}

                      <div className="border-t pt-4">
                        <button
                          onClick={() => {
                            handleLogout()
                            setIsOpen(false)
                          }}
                          className="flex items-center space-x-3 px-3 py-2 rounded-md text-red-600 hover:bg-red-50 w-full text-left"
                        >
                          <LogOut className="h-5 w-5" />
                          <span>Cerrar Sesión</span>
                        </button>
                      </div>
                    </>
                  )}

                  {!user && (
                    <div className="border-t pt-4 space-y-2">
                      <Link href="/auth/login" onClick={() => setIsOpen(false)} className="block w-full">
                        <Button variant="ghost" className="w-full justify-start">
                          Iniciar Sesión
                        </Button>
                      </Link>
                      <Link href="/auth/register" onClick={() => setIsOpen(false)} className="block w-full">
                        <Button className="w-full">Registrarse</Button>
                      </Link>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  )
}
