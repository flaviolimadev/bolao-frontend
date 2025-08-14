import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { useEdicoes, Edicao } from "@/hooks/useEdicoes"

interface EdicaoSelecionadaContextData {
  edicaoSelecionada: Edicao | null
  setEdicaoSelecionada: (edicao: Edicao | null) => void
  isVisualizandoHistorico: boolean
  voltarParaAtiva: () => void
}

const EdicaoSelecionadaContext = createContext<EdicaoSelecionadaContextData>({
  edicaoSelecionada: null,
  setEdicaoSelecionada: () => {},
  isVisualizandoHistorico: false,
  voltarParaAtiva: () => {}
})

interface EdicaoSelecionadaProviderProps {
  children: ReactNode
}

export function EdicaoSelecionadaProvider({ children }: EdicaoSelecionadaProviderProps) {
  const { edicoes } = useEdicoes()
  const [edicaoSelecionada, setEdicaoSelecionadaState] = useState<Edicao | null>(null)

  const edicaoAtiva = edicoes.find(e => e.status === 'active')

  // Quando as edições carregarem, definir a ativa como padrão
  useEffect(() => {
    if (!edicaoSelecionada && edicaoAtiva) {
      setEdicaoSelecionadaState(edicaoAtiva)
    }
  }, [edicaoAtiva, edicaoSelecionada])

  const setEdicaoSelecionada = (edicao: Edicao | null) => {
    setEdicaoSelecionadaState(edicao || edicaoAtiva)
  }

  const isVisualizandoHistorico = edicaoSelecionada?.id !== edicaoAtiva?.id

  const voltarParaAtiva = () => {
    if (edicaoAtiva) {
      setEdicaoSelecionadaState(edicaoAtiva)
    }
  }

  return (
    <EdicaoSelecionadaContext.Provider 
      value={{ 
        edicaoSelecionada: edicaoSelecionada || edicaoAtiva,
        setEdicaoSelecionada,
        isVisualizandoHistorico,
        voltarParaAtiva
      }}
    >
      {children}
    </EdicaoSelecionadaContext.Provider>
  )
}

export function useEdicaoSelecionada() {
  const context = useContext(EdicaoSelecionadaContext)
  if (!context) {
    throw new Error("useEdicaoSelecionada deve ser usado dentro de EdicaoSelecionadaProvider")
  }
  return context
}