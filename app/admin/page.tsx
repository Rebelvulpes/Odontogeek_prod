"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Edit, Trash2, Eye, Archive } from "lucide-react"

const Page = () => {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalUsers: 0,
    totalRevenue: 0,
  })
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  useEffect(() => {
    if (status === "authenticated") {
      loadStats()
      loadCourses()
    }
  }, [status])

  const loadStats = async () => {
    try {
      const response = await fetch("/api/admin/stats")
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error("Error al cargar las estadísticas:", error)
    }
  }

  const loadCourses = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/admin/courses")
      const data = await response.json()
      setCourses(data)
    } catch (error) {
      console.error("Error al cargar los cursos:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleArchiveCourse = async (courseId: string) => {
    if (!courseId || courseId === "undefined" || courseId === "null") {
      alert("Error: ID de curso no válido")
      return
    }

    if (confirm("¿Estás seguro de que quieres archivar este curso? No estará visible en la vista pública.")) {
      try {
        const response = await fetch(`/api/admin/courses/${courseId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ archived: true }),
        })
        const result = await response.json()
        if (result.success) {
          loadCourses()
          loadStats()
          alert("Curso archivado exitosamente")
        } else {
          alert(result.message)
        }
      } catch (error) {
        console.error("Error archivando curso:", error)
        alert("Error archivando curso")
      }
    }
  }

  const handleUnarchiveCourse = async (courseId: string) => {
    if (!courseId || courseId === "undefined" || courseId === "null") {
      alert("Error: ID de curso no válido")
      return
    }

    if (confirm("¿Estás seguro de que quieres desarchivar este curso? Volverá a estar visible en la vista pública.")) {
      try {
        const response = await fetch(`/api/admin/courses/${courseId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ archived: false }),
        })
        const result = await response.json()
        if (result.success) {
          loadCourses()
          loadStats()
          alert("Curso desarchivado exitosamente")
        } else {
          alert(result.message)
        }
      } catch (error) {
        console.error("Error desarchivando curso:", error)
        alert("Error desarchivando curso")
      }
    }
  }

  if (status === "loading") {
    return <div>Cargando...</div>
  }

  if (status === "unauthenticated") {
    return <div>Redirigiendo al login...</div>
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-4">Panel de Administración</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Cursos Totales</CardTitle>
            <CardDescription>Número total de cursos en la plataforma.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCourses}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Usuarios Totales</CardTitle>
            <CardDescription>Número total de usuarios registrados.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ingresos Totales</CardTitle>
            <CardDescription>Ingresos totales generados por la plataforma.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalRevenue}</div>
          </CardContent>
        </Card>
      </div>

      <Separator className="mb-4" />

      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">Cursos</h2>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Título</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead>Inscritos</TableHead>
                <TableHead>Creación</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    Cargando cursos...
                  </TableCell>
                </TableRow>
              ) : courses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    No hay cursos disponibles.
                  </TableCell>
                </TableRow>
              ) : (
                courses.map((course) => (
                  <TableRow key={course.id}>
                    <TableCell className="font-medium">{course.title}</TableCell>
                    <TableCell>{course.category}</TableCell>
                    <TableCell>${course.price}</TableCell>
                    <TableCell>{course.enrollments}</TableCell>
                    <TableCell>
                      {format(new Date(course.createdAt), "dd 'de' MMMM 'de' yyyy", { locale: es })}
                    </TableCell>
                    <TableCell className="text-right flex gap-2 justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/admin/course/${course.id}`)}
                        title="Editar curso"
                      >
                        <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          course.archived ? handleUnarchiveCourse(course.id) : handleArchiveCourse(course.id)
                        }
                        className={
                          course.archived
                            ? "text-green-600 hover:text-green-700 hover:bg-green-50"
                            : "text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                        }
                        title={course.archived ? "Desarchivar curso" : "Archivar curso"}
                      >
                        {course.archived ? (
                          <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                        ) : (
                          <Archive className="w-3 h-3 sm:w-4 sm:h-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        title="Eliminar curso"
                      >
                        <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}

export default Page
