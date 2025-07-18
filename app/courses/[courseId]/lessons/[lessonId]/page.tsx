import type React from "react"

interface LessonPageProps {
  params: {
    courseId: string
    lessonId: string
  }
}

const LessonPage: React.FC<LessonPageProps> = ({ params }) => {
  const { courseId, lessonId } = params

  return (
    <div>
      <h1>Lesson Page</h1>
      <p>Course ID: {courseId}</p>
      <p>Lesson ID: {lessonId}</p>
      {/* You can fetch and display lesson content here based on courseId and lessonId */}
    </div>
  )
}

export default LessonPage
