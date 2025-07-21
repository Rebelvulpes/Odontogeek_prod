"use client"

import Link from "next/link"
import { useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function Navigation() {
  const { data: session } = useSession()
  const user = session?.user
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="bg-background border-b">
      <div className="container flex items-center justify-between py-4">
        <Link href="/" className="font-bold text-2xl">
          My App
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-4">
          {user && (
            <Link href={user.role === "admin" ? "/admin" : "/dashboard"}>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                Mi Dashboard
              </Button>
            </Link>
          )}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.image || ""} alt={user.name || "User"} />
                    <AvatarFallback>{user.name?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Link href="/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => signOut()}>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link href="/login">Login</Link>
              <Link href="/register">Register</Link>
            </>
          )}
        </div>

        {/* Mobile Navigation */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger className="md:hidden">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path
                fillRule="evenodd"
                d="M3 6.75A.75.75 0 013.75 6h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 6.75zM3 12A.75.75 0 013.75 11.25h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 12zm0 5.25a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75a.75.75 0 01-.75-.75z"
                clipRule="evenodd"
              />
            </svg>
          </SheetTrigger>
          <SheetContent className="sm:max-w-xs">
            <SheetHeader>
              <SheetTitle>Menu</SheetTitle>
              <SheetDescription>Explore the app.</SheetDescription>
            </SheetHeader>
            <Separator />
            <div className="grid gap-4 py-4">
              {user ? (
                <>
                  <div className="flex items-center space-x-2">
                    <Avatar>
                      <AvatarImage src={user.image || ""} alt={user.name || "User"} />
                      <AvatarFallback>{user.name?.charAt(0) || "U"}</AvatarFallback>
                    </Avatar>
                    <span>{user.name}</span>
                  </div>
                  <Separator />
                  <Link href="/profile" onClick={() => setIsOpen(false)}>
                    <Button className="w-full">Profile</Button>
                  </Link>
                  {user && (
                    <Link href={user.role === "admin" ? "/admin" : "/dashboard"} onClick={() => setIsOpen(false)}>
                      <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">Mi Dashboard</Button>
                    </Link>
                  )}
                  <Button className="w-full" onClick={() => signOut()}>
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setIsOpen(false)}>
                    <Button className="w-full">Login</Button>
                  </Link>
                  <Link href="/register" onClick={() => setIsOpen(false)}>
                    <Button className="w-full">Register</Button>
                  </Link>
                </>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  )
}
