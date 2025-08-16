import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // 🔧 GARANTIR QUE A VARIÁVEL SEJA LIDA CORRETAMENTE
  // Usar múltiplas fontes para garantir que funcione
  const apiUrl = process.env.VITE_API_URL || 
                 process.env.VITE_API_BASE_URL || 
                 '';
  
  // 🔧 Logs de debug mais visíveis
  console.log('='.repeat(50));
  console.log('🔧 BUILD DEBUG INFO');
  console.log('='.repeat(50));
  console.log('🔧 VITE_API_URL durante build:', apiUrl);
  console.log('🔧 process.env.VITE_API_URL:', process.env.VITE_API_URL);
  console.log('🔧 process.env.VITE_API_BASE_URL:', process.env.VITE_API_BASE_URL);
  console.log('🔧 process.env keys:', Object.keys(process.env).filter(key => key.includes('VITE')));
  console.log('='.repeat(50));
  
  return {
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [
      react(),
      mode === 'development' &&
      componentTagger(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    // 🔧 CONFIGURAÇÃO PARA VARIÁVEIS DE AMBIENTE
    define: {
      'import.meta.env.VITE_API_URL': JSON.stringify(apiUrl),
      'import.meta.env.VITE_API_BASE_URL': JSON.stringify(apiUrl), // Fallback para compatibilidade
    },
  };
});
