const DashboardPage = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Logo */}
          <img
            src="/images/odontogeek-logo-new.png"
            alt="OdontoGeek"
            className="h-8 sm:h-10 w-auto max-w-[120px] sm:max-w-[150px]"
          />

          {/* User Info (Placeholder) */}
          <div>
            <span className="text-gray-700">Welcome, User!</span>
          </div>
        </div>
      </header>

      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {/* Dashboard Content */}
          <div className="px-4 py-6 sm:px-0">
            <div className="border-4 border-dashed border-gray-200 rounded-lg h-96">
              {/* Placeholder Content */}
              <p className="text-center text-gray-500 mt-20">Dashboard Content Here</p>
            </div>
          </div>
          {/* /End replace */}
        </div>
      </main>
    </div>
  )
}

export default DashboardPage
