import { ReactNode, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"

interface ProtectedRouteProps {
  children: ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading, isAdmin } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate("/auth")
      } else if (!isAdmin) {
        navigate("/auth")
      }
    }
  }, [user, loading, isAdmin, navigate])

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2 text-muted-foreground">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent" />
          <span>Verificando acesso...</span>
        </div>
      </div>
    )
  }

  // Don't render children if not authenticated or not admin
  if (!user || !isAdmin) {
    return null
  }

  return <>{children}</>
}