import { db } from "@/lib/db"
import { auth } from "@clerk/nextjs"
import { redirect } from "next/navigation"

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
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold">{lesson.title}</h1>
        <p className="text-sm text-muted-foreground">{lesson.description}</p>
        <div className="mt-4">
          <iframe
            src={lesson.video_url}
            title={lesson.title}
            className="w-full h-96 rounded-lg shadow-lg"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  )
}

export default LessonPage
