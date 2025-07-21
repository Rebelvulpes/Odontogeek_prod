import { redirect } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Lock, PlayCircle } from "lucide-react"
import { getServerUser, getServerSupabaseClient } from "@/lib/server-utils"

async function getLessonData(lessonId: string, courseId: string) {
  const supabase = getServerSupabaseClient()
  const { data: lesson, error: lessonError } = await supabase.from("lessons").select("*").eq("id", lessonId).single()

  if (lessonError || !lesson) {
    console.error("Error fetching lesson:", lessonError)
    return { lesson: null, course: null, lessons: [] }
  }

  const { data: course, error: courseError } = await supabase.from("courses").select("*").eq("id", courseId).single()

  if (courseError || !course) {
    console.error("Error fetching course:", courseError)
    return { lesson, course: null, lessons: [] }
  }

  const { data: lessons, error: lessonsError } = await supabase
    .from("lessons")
    .select("*")
    .eq("course_id", courseId)
    .neq("archived", true)
    .order("order_index", { ascending: true })

  if (lessonsError) {
    console.error("Error fetching course lessons:", lessonsError)
  }

  return { lesson, course, lessons: lessons || [] }
}

async function checkEnrollment(userId: string, courseId: string) {
  const supabase = getServerSupabaseClient()
  const { data, error } = await supabase
    .from("enrollments")
    .select("id")
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .single()

  return !error && data
}

export default async function LessonPage({
  params,
}: {
  params: { courseId: string; lessonId: string }
}) {
  const user = await getServerUser()
  if (!user) {
    redirect("/auth/login")
  }

  const { lesson, course, lessons } = await getLessonData(params.lessonId, params.courseId)

  if (!lesson || !course) {
    redirect("/courses")
  }

  const isEnrolled = await checkEnrollment(user.id, params.courseId)

  if (!isEnrolled && !lesson.is_free) {
    redirect(`/courses/${params.courseId}?error=not_enrolled`)
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50">
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">{lesson.title}</h1>
            <p className="text-gray-500 mt-1">
              Del curso:{" "}
              <a href={`/courses/${course.id}`} className="text-blue-600 hover:underline">
                {course.title}
              </a>
            </p>
          </div>

          <Card className="mb-6 overflow-hidden shadow-lg">
            <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
              {lesson.video_url ? (
                <iframe
                  src={lesson.video_url}
                  title={lesson.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute top-0 left-0 w-full h-full"
                ></iframe>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                  <p className="text-gray-500">Video no disponible</p>
                </div>
              )}
            </div>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Descripción de la Lección</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 whitespace-pre-wrap">{lesson.content || "No hay descripción disponible."}</p>
            </CardContent>
          </Card>
        </div>
      </main>

      <aside className="w-full lg:w-80 bg-white border-l border-gray-200 p-4">
        <div className="sticky top-4">
          <h2 className="text-xl font-semibold mb-4">Lecciones del Curso</h2>
          <Accordion type="single" collapsible defaultValue={`item-${lesson.id}`}>
            {lessons.map((item) => (
              <AccordionItem value={`item-${item.id}`} key={item.id}>
                <AccordionTrigger className={`text-left ${item.id === lesson.id ? "text-blue-600" : ""}`}>
                  <div className="flex items-center">
                    {item.is_free || isEnrolled ? (
                      <PlayCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                    ) : (
                      <Lock className="w-4 h-4 mr-2 flex-shrink-0 text-gray-400" />
                    )}
                    <span>{item.title}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="flex justify-between items-center">
                    <Badge variant="secondary">{item.duration_minutes} min</Badge>
                    {item.is_free && <Badge variant="outline">Gratis</Badge>}
                  </div>
                  <a
                    href={item.is_free || isEnrolled ? `/courses/${course.id}/lessons/${item.id}` : "#"}
                    className={`mt-2 block text-sm ${
                      item.is_free || isEnrolled ? "text-blue-600 hover:underline" : "text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    {item.is_free || isEnrolled ? "Ver lección" : "Requiere inscripción"}
                  </a>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </aside>
    </div>
  )
}
