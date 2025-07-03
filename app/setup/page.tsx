const SetupPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 w-full max-w-md">
        <div className="flex justify-center mb-6">
          <img src="/images/odontogeek-logo-new.png" alt="OdontoGeek" className="h-16 w-auto max-w-[200px]" />
        </div>
        <h2 className="text-center text-2xl font-bold mb-4">Setup Your Account</h2>
        <p className="text-gray-700 text-base mb-4">
          Welcome! Please complete the following steps to set up your account.
        </p>
        {/* Add setup form or instructions here */}
        <div className="text-center">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="button"
          >
            Start Setup
          </button>
        </div>
      </div>
    </div>
  )
}

export default SetupPage
