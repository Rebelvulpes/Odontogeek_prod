import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Client-side utilities only
export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date))
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(amount)
}

export function truncateText(text: string, maxLength: number) {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + "..."
}

// Client-side session helpers
export function getClientSession() {
  if (typeof window === "undefined") return null

  try {
    const sessionData = localStorage.getItem("user-session")
    return sessionData ? JSON.parse(sessionData) : null
  } catch (error) {
    console.error("Error getting client session:", error)
    return null
  }
}

export function setClientSession(session: any) {
  if (typeof window === "undefined") return

  try {
    localStorage.setItem("user-session", JSON.stringify(session))
  } catch (error) {
    console.error("Error setting client session:", error)
  }
}

export function clearClientSession() {
  if (typeof window === "undefined") return

  try {
    localStorage.removeItem("user-session")
  } catch (error) {
    console.error("Error clearing client session:", error)
  }
}
