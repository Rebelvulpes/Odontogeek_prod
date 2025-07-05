import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { Navigation } from "@/components/navigation"

export const metadata: Metadata = {
  title: "OdontoGeek - Cursos Dentales",
  description: "Plataforma de cursos dentales profesionales",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body>
        <Navigation user={null} />
        <main>{children}</main>
      </body>
    </html>
  )
}
