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
import { Menu, User, Settings, LogOut, BookOpen, Users, Home, Phone, Info } from "lucide-react"

interface NavigationProps {
  user?: {
    name: string
    email: string
    role: string
    avatar?: string
  }
}

export function Navigation({ user }: NavigationProps) {
  const [isOpen, setIsOpen] = useState(false)

  const navigationItems = [
    { href: "/", label: "Inicio", icon: Home },
    { href: "/courses", label: "Cursos", icon: BookOpen },
    { href: "/about", label: "Nosotros", icon: Info },
    { href: "/contact", label: "Contacto", icon: Phone },
  ]

  const adminItems =
    user?.role === "admin"
      ? [
          { href: "/admin", label: "Panel Admin", icon: Settings },
          { href: "/admin/users", label: "Usuarios", icon: Users },
        ]
      : []

  const UserMenu = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.avatar || "/placeholder.svg"} alt={user?.name} />
            <AvatarFallback>
              {user?.name
                ?.split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <div className="flex items-center justify-start gap-2 p-2">
          <div className="flex flex-col space-y-1 leading-none">
            <p className="font-medium">{user?.name}</p>
            <p className="w-[200px] truncate text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/dashboard" className="cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            Mi Perfil
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/settings" className="cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            Configuración
          </Link>
        </DropdownMenuItem>
        {user?.role === "admin" && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/admin" className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                Panel Admin
              </Link>
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600">
          <LogOut className="mr-2 h-4 w-4" />
          Cerrar Sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <img src="/images/odontogeek-logo-new.png" alt="OdontoGeek" className="h-8 w-auto" />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium ml-6">
          {navigationItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex flex-1 items-center justify-end space-x-4">
          {/* Desktop User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-2">
                {user.role === "admin" && (
                  <Badge variant="secondary" className="text-xs">
                    Admin
                  </Badge>
                )}
                <UserMenu />
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/auth/login">Iniciar Sesión</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/auth/register">Registrarse</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" className="md:hidden" size="sm">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Abrir menú</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <div className="flex flex-col h-full">
                {/* Logo en el menú móvil */}
                <div className="flex items-center space-x-2 pb-6 border-b">
                  <Link href="/" onClick={() => setIsOpen(false)}>
                    <img src="/images/odontogeek-logo-new.png" alt="OdontoGeek" className="h-8 w-auto" />
                  </Link>
                </div>

                {/* Navegación móvil */}
                <nav className="flex flex-col space-y-3 py-6">
                  {navigationItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center space-x-2 text-lg font-medium"
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </Link>
                  ))}

                  {adminItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center space-x-2 text-lg font-medium text-blue-600"
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </Link>
                  ))}
                </nav>

                {/* Usuario en móvil */}
                <div className="mt-auto pt-6 border-t">
                  {user ? (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                          <AvatarFallback>
                            {user.name
                              ?.split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                          {user.role === "admin" && (
                            <Badge variant="secondary" className="text-xs w-fit mt-1">
                              Administrador
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col space-y-2">
                        <Button variant="ghost" className="justify-start" asChild>
                          <Link href="/dashboard" onClick={() => setIsOpen(false)}>
                            <User className="mr-2 h-4 w-4" />
                            Mi Perfil
                          </Link>
                        </Button>
                        <Button variant="ghost" className="justify-start" asChild>
                          <Link href="/settings" onClick={() => setIsOpen(false)}>
                            <Settings className="mr-2 h-4 w-4" />
                            Configuración
                          </Link>
                        </Button>
                        <Button variant="ghost" className="justify-start text-red-600 hover:text-red-700">
                          <LogOut className="mr-2 h-4 w-4" />
                          Cerrar Sesión
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col space-y-2">
                      <Button asChild onClick={() => setIsOpen(false)}>
                        <Link href="/auth/login">Iniciar Sesión</Link>
                      </Button>
                      <Button variant="outline" asChild onClick={() => setIsOpen(false)}>
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
    </header>
  )
}
