import { auth } from "@clerk/nextjs"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { CourseNavbar } from "./_components/course-navbar"
import { IconBadge } from "@/components/icon-badge"
import { CircleDollarSign, File, LayoutDashboard, ListChecks, Lock, Video } from "lucide-react"

interface CourseIdLessonIdPageProps {
  params: {
    courseId: string
    lessonId: string
  }
}

const CourseIdLessonIdPage = async ({ params }: CourseIdLessonIdPageProps) => {
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

  const purchase = await db.purchase.findUnique({
    where: {
      userId,
      courseId: params.courseId,
    },
  })

  const hasAccess = !!purchase

  return (
    <div>
      <CourseNavbar course={course} />
      <div className="mx-auto max-w-5xl py-6 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="col-span-4">
            <div className="space-y-4">
              <h1 className="text-2xl font-semibold line-clamp-1">{lesson?.title}</h1>
              {/* Video Player */}
              <div className="mb-8">
                {hasAccess ? (
                  <div className="w-full">
                    <iframe
                      src={lesson.video_url}
                      title={lesson.title}
                      className="w-full h-96 rounded-lg shadow-lg"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <Lock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">Necesitas estar inscrito para ver este contenido</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <p className="text-md">{lesson?.description}</p>
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="w-full">
              <p className="text-md font-semibold mb-4">Contenido del curso</p>
              <div className="space-y-4">
                <div className="flex items-center gap-x-2 text-sm">
                  <IconBadge icon={LayoutDashboard} />
                  <p>Bienvenida</p>
                </div>
                <div className="flex items-center gap-x-2 text-sm">
                  <IconBadge icon={Video} />
                  <p>Introducción</p>
                </div>
                <div className="flex items-center gap-x-2 text-sm">
                  <IconBadge icon={ListChecks} />
                  <p>Requisitos</p>
                </div>
                <div className="flex items-center gap-x-2 text-sm">
                  <IconBadge icon={File} />
                  <p>Temario</p>
                </div>
                <div className="flex items-center gap-x-2 text-sm">
                  <IconBadge icon={CircleDollarSign} />
                  <p>Precio</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CourseIdLessonIdPage
