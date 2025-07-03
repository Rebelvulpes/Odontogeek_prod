const AdminPage = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center">
            <a href="/" className="flex items-center">
              <img
                src="/images/odontogeek-logo-new.png"
                alt="OdontoGeek"
                className="h-8 sm:h-10 w-auto max-w-[120px] sm:max-w-[150px]"
              />
            </a>
            <h1 className="ml-4 text-xl font-semibold text-gray-900">Admin Dashboard</h1>
          </div>
          <div>{/* Add admin user info or actions here */}</div>
        </div>
      </header>
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {/* Replace with your content */}
          <div className="px-4 py-6 sm:px-0">
            <div className="border-4 border-dashed border-gray-200 rounded-lg h-96">
              {/* Your admin content goes here */}
            </div>
          </div>
          {/* /End replace */}
        </div>
      </main>
    </div>
  )
}

export default AdminPage
