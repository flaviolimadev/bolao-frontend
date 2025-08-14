import { ReactNode, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"

interface Props {
  children: ReactNode
}

export default function RedirectIfAuth({ children }: Props) {
  const { user, isAdmin, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && user && isAdmin) {
      navigate("/dashboard", { replace: true })
    }
  }, [user, isAdmin, loading, navigate])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2 text-muted-foreground">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent" />
          <span>Carregando...</span>
        </div>
      </div>
    )
  }

  if (user && isAdmin) {
    return null
  }

  return <>{children}</>
}


