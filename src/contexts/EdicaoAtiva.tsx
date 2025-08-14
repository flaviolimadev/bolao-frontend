import { createContext, useContext, useEffect, useState } from "react"
import { useEdicoes, Edicao } from "@/hooks/useEdicoes"

interface EdicaoAtivaContextData {
  edicaoAtiva: Edicao | null
  loading: boolean
}

const EdicaoAtivaContext = createContext<EdicaoAtivaContextData>({
  edicaoAtiva: null,
  loading: true
})

interface EdicaoAtivaProviderProps {
  children: React.ReactNode
}

export function EdicaoAtivaProvider({ children }: EdicaoAtivaProviderProps) {
  const { edicoes, loading: edicoesLoading } = useEdicoes()
  const [edicaoAtiva, setEdicaoAtiva] = useState<Edicao | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!edicoesLoading && edicoes.length > 0) {
      const ativa = edicoes.find(e => e.status === 'active')
      setEdicaoAtiva(ativa ? ativa : null)
      setLoading(false)
    } else if (!edicoesLoading) {
      setEdicaoAtiva(null)
      setLoading(false)
    }
  }, [edicoes, edicoesLoading])

  return (
    <EdicaoAtivaContext.Provider value={{ edicaoAtiva, loading }}>
      {children}
    </EdicaoAtivaContext.Provider>
  )
}

export function useEdicaoAtiva() {
  const context = useContext(EdicaoAtivaContext)
  if (!context) {
    throw new Error("useEdicaoAtiva deve ser usado dentro de EdicaoAtivaProvider")
  }
  return context
}