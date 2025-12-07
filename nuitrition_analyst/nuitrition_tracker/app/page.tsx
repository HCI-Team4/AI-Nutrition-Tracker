"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import NutritionTracker from "@/components/nutrition-tracker"
import { Loader2, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Home() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [userName, setUserName] = useState("")

  useEffect(() => {
    // Check if user is logged in
    const userStr = localStorage.getItem("user")
    if (!userStr) {
      router.push("/auth")
      return
    }

    try {
      const user = JSON.parse(userStr)
      setUserName(user.name)
      setIsAuthenticated(true)
    } catch {
      router.push("/auth")
    } finally {
      setIsLoading(false)
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("user")
    router.push("/auth")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <main className="min-h-screen relative">
      {/* Logout button */}
      <div className="absolute top-4 right-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          className="rounded-full"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>

      {/* Welcome message */}
      <div className="absolute top-4 left-4 z-50">
        <p className="text-sm text-muted-foreground">
          Welcome, <span className="font-semibold text-foreground">{userName}</span>!
        </p>
      </div>

      <NutritionTracker />
    </main>
  )
}
