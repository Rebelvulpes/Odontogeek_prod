import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container flex flex-col items-center justify-center py-8">
        <h1 className="text-4xl font-bold mb-4">Welcome to the App!</h1>
        <p className="text-gray-700 mb-8">This is a simple Next.js application.</p>
        <Button>Click Me</Button>
      </div>
    </div>
  )
}
