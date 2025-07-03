const UsersAdminPage = () => {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Users Admin Page</h1>
      {/* Logo Update */}
      <img
        src="/images/odontogeek-logo-new.png"
        alt="OdontoGeek"
        className="h-8 sm:h-10 w-auto max-w-[120px] sm:max-w-[150px]"
      />
      {/* Rest of the page content */}
      <p>This is the users admin page. You can manage users here.</p>
    </div>
  )
}

export default UsersAdminPage
