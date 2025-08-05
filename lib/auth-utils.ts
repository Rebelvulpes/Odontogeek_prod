// Utility functions for authentication across the app
export interface User {
  id: string
  email: string
  first_name: string
  last_name: string
  role: string
}

// Check authentication status
export async function checkAuthStatus(): Promise<User | null> {
  try {
    const response = await fetch("/api/auth/me", {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (response.ok) {
      const data = await response.json()
      if (data.success && data.user) {
        return data.user
      }
    }
    return null
  } catch (error) {
    console.error("Error checking auth status:", error)
    return null
  }
}

// Logout function
export async function logout(): Promise<boolean> {
  try {
    const response = await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    })

    if (response.ok) {
      return true
    }
    return false
  } catch (error) {
    console.error("Error during logout:", error)
    return false
  }
}
