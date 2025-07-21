import { CourseSidebar } from "@/components/course-sidebar"
import { auth } from "@clerk/nextjs"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { Play } from "lucide-react"

interface LessonPageProps {
  params: {
    courseId: string
    lessonId: string
  }
}

const LessonPage = async ({ params }: LessonPageProps) => {
  const { userId } = auth()

  if (!userId) {
    return redirect("/")
  }

  const course = await db.course.findUnique({
    where: {
      id: params.courseId,
      userId,
    },
    include: {
      lessons: {
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  })

  if (!course) {
    return redirect("/")
  }

  const lesson = await db.lesson.findUnique({
    where: {
      id: params.lessonId,
      courseId: params.courseId,
    },
  })

  if (!lesson) {
    return redirect(`/courses/${params.courseId}`)
  }

  return (
    <div className="flex flex-col md:flex-row h-screen">
      <div className="w-full md:w-64 flex-shrink-0 border-r h-full">
        <CourseSidebar course={course} lessonId={params.lessonId} />
      </div>
      <div className="flex-1 p-6">
        <h1 className="text-2xl font-bold">{lesson.title}</h1>
        <p className="text-sm text-gray-500 mb-4">
          {new Date(lesson.createdAt).toLocaleDateString("es-ES", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>

        {lesson.video_url ? (
          <iframe
            src={lesson.video_url}
            title={lesson.title}
            className="w-full h-96 rounded-lg shadow-lg"
            allowFullScreen
          />
        ) : (
          <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <Play className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Video no disponible</p>
            </div>
          </div>
        )}

        <div className="mt-8">
          <h2 className="text-xl font-semibold">Descripción</h2>
          <p className="text-gray-700">{lesson.description}</p>
        </div>
      </div>
    </div>
  )
}

export default LessonPage
