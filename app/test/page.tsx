const TestPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <header className="bg-white shadow-md w-full p-4">
        <div className="container mx-auto flex items-center justify-between">
          <a href="/" className="flex items-center">
            <img src="/images/odontogeek-logo-new.png" alt="OdontoGeek" className="h-12 w-auto max-w-[180px]" />
          </a>
          <nav>{/* Navigation links can be added here */}</nav>
        </div>
      </header>

      <main className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-semibold text-gray-800 mb-4">Test Page</h1>
        <p className="text-gray-700">This is a test page to verify the setup and configuration.</p>
        {/* Add more test components or content here */}
      </main>

      <footer className="bg-gray-200 w-full p-4 text-center">
        <p className="text-gray-600">© {new Date().getFullYear()} OdontoGeek</p>
      </footer>
    </div>
  )
}

export default TestPage
