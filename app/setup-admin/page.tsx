import SetupAdminForm from "./SetupAdminForm"

export default async function SetupAdminPage() {
  // Por ahora, simplemente renderizamos el formulario
  // En una implementación real, aquí verificarías la autenticación
  const userId = "temp-user-id" // Esto vendría de la sesión del usuario

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="flex justify-center mb-6">
        <img src="/images/odontogeek-logo-new.png" alt="OdontoGeek" className="h-16 w-auto max-w-[200px]" />
      </div>
      <SetupAdminForm userId={userId} />
    </div>
  )
}
